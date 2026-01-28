"use client";

/**
 * Provider de autenticação para componentes cliente
 *
 * Wrapa a aplicação com SessionProvider do NextAuth.
 */

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
