import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

declare global {
  var prismaInstance: PrismaClient | undefined;
}

export const prisma = global.prismaInstance || new PrismaClient({
  log: env.isDev ? ['warn', 'error'] : ['error']
});

if (env.isDev) {
  global.prismaInstance = prisma;
}

export let isDatabaseConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    console.log('[Database] Successfully connected to PostgreSQL via Prisma.');
    return true;
  } catch (error: any) {
    isDatabaseConnected = false;
    console.warn(`[Database Warning] Could not connect to PostgreSQL at ${env.DATABASE_URL}.`);
    console.warn('[Database Notice] If running locally, start PostgreSQL via "docker compose up -d" or configure DATABASE_URL in .env. Resilient in-memory fallback will handle requests gracefully.');
    return false;
  }
}
