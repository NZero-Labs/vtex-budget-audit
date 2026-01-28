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
const protectedRoutes = ['/compare'];

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
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  providers: [], // Providers são adicionados em auth.ts
  callbacks: {
    /**
     * Callback de autorização para o middleware
     * Roda no Edge Runtime - não pode acessar banco
     */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Verifica se é rota protegida
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Se rota protegida, requer login
      if (isProtectedRoute) {
        return isLoggedIn;
      }

      // Se autenticado e tentando acessar login, redireciona
      if (isLoggedIn && pathname === '/login') {
        return Response.redirect(new URL('/compare', request.nextUrl));
      }

      return true;
    },
    // Callbacks jwt e session são herdados em auth.ts
  },
};
