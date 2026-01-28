/**
 * Configuração do Auth.js v5 (NextAuth)
 * 
 * Usa Credentials Provider para autenticação com email/senha.
 * Senhas são validadas com bcrypt.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/**
 * Configuração do NextAuth
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Busca usuário no banco com Prisma
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        // Valida senha com bcrypt
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        // Retorna dados do usuário (sem senha)
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
