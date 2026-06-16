"use client";

/**
 * Página de administração de usuários
 *
 * Acesso restrito a usuários com role ADMIN.
 */

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, UserCheck, Users, UserPlus } from "lucide-react";
import { UserTable, UserForm } from "./components";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Gerenciar Usuários
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione, edite ou desative usuários do sistema
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleCreate}>
          <UserPlus /> Novo usuário
        </Button>
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        {[
          { label: "Total de usuários", value: users.length, icon: Users },
          {
            label: "Usuários ativos",
            value: users.filter((u) => u.isActive).length,
            icon: UserCheck,
          },
          {
            label: "Administradores",
            value: users.filter((u) => u.role === "ADMIN").length,
            icon: ShieldCheck,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
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
