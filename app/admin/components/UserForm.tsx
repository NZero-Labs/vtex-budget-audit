"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
}
interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    email: string;
    password?: string;
    name: string;
    role: "USER" | "ADMIN";
    isActive?: boolean;
  }) => Promise<void>;
}
const empty = {
  email: "",
  password: "",
  name: "",
  role: "USER" as const,
  isActive: true,
};

export function UserForm({ user, isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState<{
    email: string;
    password: string;
    name: string;
    role: "USER" | "ADMIN";
    isActive: boolean;
  }>(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setForm(
      user
        ? {
            email: user.email,
            password: "",
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          }
        : empty,
    );
    setError("");
  }, [user, isOpen]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      (!user && form.password.length < 6)
    ) {
      setError("Preencha nome, email e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await onSave({
        email: form.email,
        name: form.name,
        role: form.role,
        ...(form.password && { password: form.password }),
        ...(user && { isActive: form.isActive }),
      });
      toast.success(user ? "Usuário atualizado" : "Usuário criado");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Erro ao salvar usuário",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {user ? "Editar usuário" : "Novo usuário"}
            </DialogTitle>
            <DialogDescription>
              Gerencie credenciais e permissões de acesso ao VTEX Tools.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-5">
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">
                {user ? "Nova senha (opcional)" : "Senha"}
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Perfil</FieldLabel>
              <Select
                value={form.role}
                onValueChange={(role: "USER" | "ADMIN") =>
                  setForm({ ...form, role })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {user && (
              <Field orientation="horizontal">
                <Checkbox
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isActive: checked === true })
                  }
                />
                <FieldLabel htmlFor="active">Usuário ativo</FieldLabel>
              </Field>
            )}
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
          <DialogFooter>
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="submit"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
