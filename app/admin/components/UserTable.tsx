"use client";

import { useState } from "react";
import { MoreHorizontal, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User { id: number; email: string; name: string; role: "USER" | "ADMIN"; isActive: boolean; createdAt: string; updatedAt: string; }
interface Props { users: User[]; onEdit: (user: User) => void; onToggleStatus: (user: User) => void; isLoading?: boolean; }

export function UserTable({ users, onEdit, onToggleStatus, isLoading }: Props) {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const toggle = async (user: User) => { setActionLoading(user.id); await onToggleStatus(user); setActionLoading(null); };
  if (isLoading) return <Card className="space-y-3 p-5">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</Card>;
  if (!users.length) return <Empty className="min-h-64 border"><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>Nenhum usuário</EmptyTitle><EmptyDescription>Crie o primeiro acesso para começar.</EmptyDescription></EmptyHeader></Empty>;
  return <Card className="min-w-0 overflow-hidden"><Table><TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Perfil</TableHead><TableHead>Status</TableHead><TableHead>Criado em</TableHead><TableHead className="w-12" /></TableRow></TableHeader><TableBody>{users.map((user) => <TableRow key={user.id}><TableCell className="max-w-[240px]"><div className="truncate font-medium">{user.name}</div><div className="truncate text-xs text-muted-foreground">{user.email}</div></TableCell><TableCell><Badge variant="secondary">{user.role === "ADMIN" ? "Administrador" : "Usuário"}</Badge></TableCell><TableCell><Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Ativo" : "Inativo"}</Badge></TableCell><TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Ações"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit(user)}>Editar</DropdownMenuItem><DropdownMenuItem disabled={actionLoading === user.id} onClick={() => toggle(user)}>{user.isActive ? "Desativar" : "Ativar"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table></Card>;
}
