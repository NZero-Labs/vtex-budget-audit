import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export function createPrismaClient(databaseUrl = process.env.BU_PRISMA_DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error('BU_PRISMA_DATABASE_URL não configurada.');
  }

  if (databaseUrl.startsWith('prisma+postgres://') || databaseUrl.startsWith('prisma://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}
