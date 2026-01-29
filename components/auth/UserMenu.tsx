"use client";

/**
 * Menu do usuário logado
 *
 * Mostra nome do usuário, link admin (se ADMIN) e botão de logout.
 */

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  // Não mostra nada se não estiver autenticado
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Extrai iniciais do nome
  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  // Verifica se é admin
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex items-center gap-3">
      {/* Link Admin (apenas para admins) */}
      {isAdmin && (
        <Link
          href="/admin"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
          title="Administração"
        >
          <svg
            className="w-5 h-5 text-white/80 hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm text-white/90 hidden lg:block">Admin</span>
        </Link>
      )}

      {/* Avatar com iniciais */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-sm text-white/90 leading-tight">
            {session.user.name}
          </span>
          {isAdmin && (
            <span className="text-xs text-white/60 leading-tight">Admin</span>
          )}
        </div>
      </div>

      {/* Botão de logout */}
      <button
        onClick={handleLogout}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="Sair"
        aria-label="Sair"
      >
        <svg
          className="w-5 h-5 text-white/80 hover:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  );
}
