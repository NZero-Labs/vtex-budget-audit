/**
 * Script para criar usuários
 * 
 * Uso: npx tsx scripts/seed-user.ts --email admin@empresa.com --password senha123 --name "Admin"
 * 
 * Requer a variável BU_PRISMA_DATABASE_URL no ambiente.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Parse argumentos da linha de comando
function parseArgs(): { email: string; password: string; name: string } {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      result[key] = value;
    }
  }

  if (!result.email || !result.password || !result.name) {
    console.error('Uso: npx tsx scripts/seed-user.ts --email <email> --password <senha> --name <nome>');
    console.error('Exemplo: npx tsx scripts/seed-user.ts --email admin@empresa.com --password senha123 --name "Admin"');
    process.exit(1);
  }

  return {
    email: result.email,
    password: result.password,
    name: result.name,
  };
}

async function seedUser() {
  const { email, password, name } = parseArgs();

  // Verifica se BU_PRISMA_DATABASE_URL está definida
  if (!process.env.BU_PRISMA_DATABASE_URL) {
    console.error('Erro: BU_PRISMA_DATABASE_URL não definida no ambiente');
    console.error('Configure a variável de ambiente ou use um arquivo .env');
    process.exit(1);
  }

  // Cria cliente Prisma com URL do Accelerate
  const prisma = new PrismaClient({
    accelerateUrl: process.env.BU_PRISMA_DATABASE_URL,
  });

  console.log(`Criando usuário: ${email}`);

  try {
    // Gera hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insere usuário com Prisma
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('✅ Usuário criado com sucesso:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Nome: ${newUser.name}`);

    process.exit(0);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.error(`❌ Erro: Email "${email}" já está cadastrado`);
    } else {
      console.error('❌ Erro ao criar usuário:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedUser();
