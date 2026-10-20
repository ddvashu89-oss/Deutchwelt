import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

declare global {
  var prismaInstance: PrismaClient | undefined;
}

const isPostgresUrl =
  typeof env.DATABASE_URL === 'string' &&
  (env.DATABASE_URL.startsWith('postgresql://') || env.DATABASE_URL.startsWith('postgres://'));

export const prisma: PrismaClient =
  global.prismaInstance ||
  (isPostgresUrl
    ? new PrismaClient({
        log: env.isDev ? ['warn', 'error'] : ['error']
      })
    : (new Proxy({} as PrismaClient, {
        get: (_target, prop) => {
          if (prop === '$queryRaw' || prop === '$connect' || prop === '$disconnect') {
            return async () => {
              throw new Error('PostgreSQL database URL is not configured. Running in memory mode.');
            };
          }
          return undefined;
        }
      }) as PrismaClient));

if (env.isDev && isPostgresUrl) {
  global.prismaInstance = prisma;
}

export let isDatabaseConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isPostgresUrl) {
    isDatabaseConnected = false;
    console.log('[Database] PostgreSQL URL not configured. Operating in high-performance in-memory mode.');
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    console.log('[Database] Successfully connected to PostgreSQL via Prisma.');
    return true;
  } catch (error: any) {
    isDatabaseConnected = false;
    const sanitizedUrl = env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.warn(`[Database Warning] Could not connect to PostgreSQL at ${sanitizedUrl}.`);
    console.warn('[Database Notice] Resilient in-memory fallback is active and handling all requests.');
    return false;
  }
}
