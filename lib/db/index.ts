/**
 * Cliente de conexão com Postgres via Prisma
 * 
 * Usa Prisma Accelerate para conexão gerenciada.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Instância do Prisma Client
 * 
 * Em desenvolvimento, reutiliza a conexão para evitar hot-reload issues.
 * A conexão usa a variável de ambiente BU_PRISMA_DATABASE_URL (Prisma Accelerate).
 */
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Prisma 7 com Accelerate: passar a URL diretamente
    accelerateUrl: process.env.BU_PRISMA_DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
