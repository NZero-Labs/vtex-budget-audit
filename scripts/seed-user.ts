/**
 * Script para criar usuários
 * 
 * Uso: npx tsx scripts/seed-user.ts --email admin@empresa.com --password senha123 --name "Admin"
 * 
 * Requer a variável POSTGRES_URL no ambiente.
 */

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import bcrypt from 'bcryptjs';
import { users } from '../lib/db/schema';

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

  // Verifica se POSTGRES_URL está definida
  if (!process.env.POSTGRES_URL) {
    console.error('Erro: POSTGRES_URL não definida no ambiente');
    console.error('Configure a variável de ambiente ou use um arquivo .env.local');
    process.exit(1);
  }

  console.log(`Criando usuário: ${email}`);

  try {
    const db = drizzle(sql);

    // Gera hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insere usuário
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        isActive: true,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    console.log('✅ Usuário criado com sucesso:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Nome: ${newUser.name}`);

    process.exit(0);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      console.error(`❌ Erro: Email "${email}" já está cadastrado`);
    } else {
      console.error('❌ Erro ao criar usuário:', error);
    }
    process.exit(1);
  }
}

seedUser();
