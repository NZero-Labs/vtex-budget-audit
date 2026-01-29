/**
 * API Routes para gerenciamento de usuário específico (Admin)
 * 
 * PATCH /api/admin/users/[id] - Atualiza usuário
 * DELETE /api/admin/users/[id] - Desativa usuário
 * 
 * Requer autenticação e role ADMIN.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * Schema de validação para atualizar usuário
 */
const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Verifica se o usuário é admin
 */
async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

/**
 * PATCH /api/admin/users/[id]
 * Atualiza dados do usuário
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Verifica se usuário existe
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Prepara dados para atualização
    const updateData: {
      email?: string;
      password?: string;
      name?: string;
      role?: 'USER' | 'ADMIN';
      isActive?: boolean;
    } = {};

    if (validation.data.email) {
      // Verifica se novo email já está em uso
      const emailInUse = await db.user.findFirst({
        where: {
          email: validation.data.email,
          id: { not: userId },
        },
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        );
      }

      updateData.email = validation.data.email;
    }

    if (validation.data.password) {
      updateData.password = await bcrypt.hash(validation.data.password, 12);
    }

    if (validation.data.name) {
      updateData.name = validation.data.name;
    }

    if (validation.data.role) {
      updateData.role = validation.data.role;
    }

    if (typeof validation.data.isActive === 'boolean') {
      updateData.isActive = validation.data.isActive;
    }

    // Atualiza usuário
    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar usuário' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Desativa usuário (soft delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verifica se usuário existe
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Desativa usuário (soft delete)
    const user = await db.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user, message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao desativar usuário' },
      { status: 500 }
    );
  }
}
