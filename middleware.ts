/**
 * Middleware de autenticação
 * 
 * Protege rotas que requerem login.
 * Redireciona usuários não autenticados para /login.
 */

import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

/**
 * Rotas protegidas que requerem autenticação
 */
const protectedRoutes = ['/compare'];

/**
 * Rotas públicas (não requerem autenticação)
 */
const publicRoutes = ['/login', '/api/auth'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Verifica se é rota de API auth (sempre permitir)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Verifica se está autenticado
  const isAuthenticated = !!req.auth;

  // Se não autenticado e tentando acessar rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se autenticado e tentando acessar login, redireciona para compare
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/compare', req.url));
  }

  return NextResponse.next();
});

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
