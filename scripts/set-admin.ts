/**
 * Script para definir um usuário como administrador
 * 
 * Uso: npx tsx scripts/set-admin.ts <email>
 * Exemplo: npx tsx scripts/set-admin.ts jalmeida@amaranzero.com
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function setAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Uso: npx tsx scripts/set-admin.ts <email>');
    console.error('Exemplo: npx tsx scripts/set-admin.ts jalmeida@amaranzero.com');
    process.exit(1);
  }

  if (!process.env.BU_PRISMA_DATABASE_URL) {
    console.error('Erro: BU_PRISMA_DATABASE_URL não definida no ambiente');
    console.error('Configure a variável no arquivo .env');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    accelerateUrl: process.env.BU_PRISMA_DATABASE_URL,
  });

  try {
    // Verifica se usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`Erro: Usuário com email "${email}" não encontrado.`);
      console.error('Crie o usuário primeiro com: npm run seed:user -- --email <email> --password <senha> --name <nome>');
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`Usuário "${email}" já é administrador.`);
      process.exit(0);
    }

    // Atualiza role para ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('');
    console.log('✅ Usuário promovido a administrador com sucesso!');
    console.log('');
    console.log('Dados do usuário:');
    console.log(`  ID: ${updatedUser.id}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Nome: ${updatedUser.name}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log('');
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
