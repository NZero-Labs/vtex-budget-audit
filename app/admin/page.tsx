"use client";

/**
 * Página de administração de usuários
 *
 * Acesso restrito a usuários com role ADMIN.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserTable, UserForm } from "./components";

interface User {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  /**
   * Carrega lista de usuários
   */
  const loadUsers = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao carregar usuários");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Abre modal para criar novo usuário
   */
  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  /**
   * Abre modal para editar usuário
   */
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  /**
   * Alterna status do usuário (ativo/inativo)
   */
  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar status");
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  /**
   * Salva usuário (criar ou atualizar)
   */
  const handleSave = async (data: {
    email: string;
    password?: string;
    name: string;
    role: "USER" | "ADMIN";
    isActive?: boolean;
  }) => {
    const url = editingUser
      ? `/api/admin/users/${editingUser.id}`
      : "/api/admin/users";

    const method = editingUser ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao salvar usuário");
    }

    await loadUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/compare"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Voltar para Comparação"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciar Usuários
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Adicione, edite ou desative usuários do sistema
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Novo Usuário
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total de Usuários
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Usuários Ativos
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter((u) => u.isActive).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Administradores
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter((u) => u.role === "ADMIN").length}
          </div>
        </div>
      </div>

      {/* Tabela de usuários */}
      <UserTable
        users={users}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      {/* Modal de formulário */}
      <UserForm
        user={editingUser}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
