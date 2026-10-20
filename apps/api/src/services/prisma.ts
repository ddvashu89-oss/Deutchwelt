import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { env } from '../config/env.js';

declare global {
  var prismaInstance: any | undefined;
}

const isPostgresUrl =
  Boolean(env.DATABASE_URL) &&
  typeof env.DATABASE_URL === 'string' &&
  (env.DATABASE_URL.startsWith('postgresql://') || env.DATABASE_URL.startsWith('postgres://')) &&
  !(process.env.VERCEL && env.DATABASE_URL.includes('localhost'));

let client: any = null;

if (isPostgresUrl) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    client = global.prismaInstance || new PrismaClient({
      log: env.isDev ? ['warn', 'error'] : ['error']
    });
    if (env.isDev) {
      global.prismaInstance = client;
    }
  } catch (e: any) {
    console.warn('[Prisma Warning] Could not initialize PrismaClient, operating in resilient store mode:', e?.message);
  }
}

if (!client) {
  client = new Proxy({} as any, {
    get: (_target, prop) => {
      if (prop === '$queryRaw' || prop === '$connect' || prop === '$disconnect') {
        return async () => {
          throw new Error('PostgreSQL database URL is not configured. Running in memory mode.');
        };
      }
      return undefined;
    }
  });
}

export const prisma: any = client;

export let isDatabaseConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isPostgresUrl || !client || typeof client.$queryRaw !== 'function') {
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
    return false;
  }
}
