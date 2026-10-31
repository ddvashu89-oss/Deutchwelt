import { createRequire } from 'node:module';
import { env } from '../config/env.js';

const require = createRequire(import.meta.url);

declare global {
  var prismaInstance: any | undefined;
}

const isMySQLUrl = (() => {
  if (!env.DATABASE_URL || typeof env.DATABASE_URL !== 'string' || !env.DATABASE_URL.startsWith('mysql://')) return false;
  try {
    const host = new URL(env.DATABASE_URL).hostname;
    return !(process.env.VERCEL && ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host));
  } catch {
    return false;
  }
})();

let client: any = null;

function initPrismaClient() {
  if (!client && isMySQLUrl) {
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
        throw new Error('MySQL database URL is not configured. Running in memory mode.');
      };
    }
    return undefined;
  }
});

export let isDatabaseConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  const c = initPrismaClient();
  if (!isMySQLUrl || !c || typeof c.$queryRaw !== 'function') {
    isDatabaseConnected = false;
    console.log('[Database] MySQL URL not configured. Operating in high-performance in-memory mode.');
    return false;
  }

  try {
    await c.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    console.log('[Database] Successfully connected to MySQL via Prisma.');
    return true;
  } catch (error: any) {
    isDatabaseConnected = false;
    const sanitizedUrl = env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.warn(`[Database Warning] Could not connect to MySQL at ${sanitizedUrl}.`);
    return false;
  }
}
