"use client";

/**
 * Menu do usuário logado
 *
 * Mostra nome do usuário e botão de logout.
 */

import { useSession, signOut } from "next-auth/react";

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

  return (
    <div className="flex items-center gap-3">
      {/* Avatar com iniciais */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
        <span className="text-sm text-white/90 hidden md:block">
          {session.user.name}
        </span>
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
