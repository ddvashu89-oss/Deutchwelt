import { createRequire } from 'node:module';
import { env } from '../config/env.js';

const require = createRequire(import.meta.url);

declare global {
  var prismaInstance: any | undefined;
}

const isPostgresUrl =
  Boolean(env.DATABASE_URL) &&
  typeof env.DATABASE_URL === 'string' &&
  (env.DATABASE_URL.startsWith('postgresql://') || env.DATABASE_URL.startsWith('postgres://')) &&
  !(process.env.VERCEL && env.DATABASE_URL.includes('localhost'));

let client: any = null;

function initPrismaClient() {
  if (!client && isPostgresUrl) {
    try {
      const { PrismaClient } = require('@prisma/client');
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
  return client;
}

export const prisma: any = new Proxy({} as any, {
  get: (_target, prop) => {
    const c = initPrismaClient();
    if (c && c[prop]) {
      return typeof c[prop] === 'function' ? c[prop].bind(c) : c[prop];
    }
    if (prop === '$queryRaw' || prop === '$connect' || prop === '$disconnect') {
      return async () => {
        throw new Error('PostgreSQL database URL is not configured. Running in memory mode.');
      };
    }
    return undefined;
  }
});

export let isDatabaseConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  const c = initPrismaClient();
  if (!isPostgresUrl || !c || typeof c.$queryRaw !== 'function') {
    isDatabaseConnected = false;
    console.log('[Database] PostgreSQL URL not configured. Operating in high-performance in-memory mode.');
    return false;
  }

  try {
    await c.$queryRaw`SELECT 1`;
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
