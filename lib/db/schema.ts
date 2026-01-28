/**
 * Schema do banco de dados com Drizzle ORM
 * 
 * Define a estrutura da tabela de usuários para autenticação.
 */

import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * Tabela de usuários
 * 
 * Armazena credenciais e informações básicas dos usuários.
 * Senhas são armazenadas com hash bcrypt.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Tipo inferido do usuário
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
