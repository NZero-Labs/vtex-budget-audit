/**
 * Configuração Edge-safe do NextAuth
 * 
 * Este arquivo contém apenas configurações que podem rodar no Edge Runtime.
 * NÃO importa Prisma, bcrypt ou outras dependências pesadas.
 * 
 * Usado pelo middleware para verificar autenticação via JWT.
 */

import type { NextAuthConfig } from 'next-auth';

/**
 * Rotas protegidas que requerem autenticação
 */
const protectedRoutes = ['/compare', '/admin'];

/**
 * Rotas que requerem role ADMIN
 */
const adminRoutes = ['/admin'];

/**
 * Configuração base do NextAuth (Edge-safe)
 * 
 * - Providers são adicionados em auth.ts (Node.js runtime)
 * - Callback authorized verifica JWT sem acessar banco
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 horas
  },
  providers: [], // Providers são adicionados em auth.ts
  callbacks: {
    /**
     * Callback JWT - adiciona id e role ao token
     * Edge-safe: não acessa banco de dados
     */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    /**
     * Callback Session - expõe id e role na sessão
     * Edge-safe: não acessa banco de dados
     */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'USER';
      }
      return session;
    },
    /**
     * Callback de autorização para o middleware
     * Roda no Edge Runtime - não pode acessar banco
     */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const userRole = (auth?.user as { role?: string } | undefined)?.role;

      // Verifica se é rota admin (requer role ADMIN)
      const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isAdminRoute) {
        // Precisa estar logado E ser admin
        if (!isLoggedIn) {
          return false;
        }
        if (userRole !== 'ADMIN') {
          // Redireciona para /compare se não for admin
          return Response.redirect(new URL('/compare', request.nextUrl));
        }
        return true;
      }

      // Verifica se é rota protegida (requer apenas login)
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      // Se autenticado e tentando acessar login, redireciona
      if (isLoggedIn && pathname === '/login') {
        return Response.redirect(new URL('/compare', request.nextUrl));
      }

      return true;
    },
  },
};
