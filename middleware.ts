/**
 * Middleware de autenticação (Edge Runtime)
 * 
 * Usa configuração edge-safe que NÃO inclui Prisma/bcrypt.
 * Apenas verifica JWT para proteger rotas.
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

/**
 * Middleware NextAuth com configuração edge-safe
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
