/**
 * Cliente de conexão com Vercel Postgres
 * 
 * Usa Drizzle ORM para queries type-safe.
 */

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

/**
 * Instância do Drizzle conectada ao Vercel Postgres
 * 
 * A conexão usa a variável de ambiente POSTGRES_URL automaticamente.
 */
export const db = drizzle(sql, { schema });

export * from './schema';
