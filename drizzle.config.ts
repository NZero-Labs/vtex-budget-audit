/**
 * Configuração do Drizzle Kit
 * 
 * Usado para migrations e push de schema.
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Usa POSTGRES_URL do ambiente (Vercel auto-popula)
    url: process.env.POSTGRES_URL!,
  },
});
