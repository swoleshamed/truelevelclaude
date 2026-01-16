// ===========================================
// FILE: src/lib/prisma.ts
// PURPOSE: Prisma client singleton for database connections
// WHY: Prevents multiple Prisma client instances in development (hot reload)
// USED BY: All API routes and server components
// ===========================================

import { PrismaClient } from '@prisma/client';

// Type for Prisma transaction client (used in $transaction callbacks)
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Prisma Client singleton pattern
// WHY: In development, Next.js hot reload can create multiple Prisma clients
// This pattern ensures we only have one client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Store the client in global scope in development
// WHY: Prevents hot reload from creating new instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
