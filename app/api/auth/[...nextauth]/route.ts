/**
 * API Route do NextAuth
 * 
 * Expõe os handlers de autenticação:
 * - GET /api/auth/session
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - etc.
 */

import { handlers } from '@/lib/auth/config';

export const { GET, POST } = handlers;
