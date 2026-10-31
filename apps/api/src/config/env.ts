import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const appEnv = (process.env.APP_ENV || (nodeEnv === 'production' || process.env.VERCEL ? 'production' : 'sandbox')).toLowerCase();

const isProd = nodeEnv === 'production' || process.env.VERCEL === '1';

export const env = {
  NODE_ENV: nodeEnv,
  APP_ENV: appEnv,
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'deutschwelt-insecure-dev-session-key-32chars',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'deutschwelt-insecure-dev-cookie-key-32chars',
  SESSION_MAX_AGE_DAYS: parseInt(process.env.SESSION_MAX_AGE_DAYS || '14', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || (process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads')),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  GOOGLE_DRIVE_CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
  GOOGLE_DRIVE_CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
  GOOGLE_DRIVE_PICKER_API_KEY: process.env.GOOGLE_DRIVE_PICKER_API_KEY || '',
  GOOGLE_DRIVE_PROJECT_NUMBER: process.env.GOOGLE_DRIVE_PROJECT_NUMBER || '',
  isDev: nodeEnv === 'development' && !process.env.VERCEL,
  isTest: nodeEnv === 'test',
  isProd,
  isSandbox: !isProd && appEnv === 'sandbox'
};

if (isProd) {
  const problems: string[] = [];
  if (!env.DATABASE_URL || !/^mysql:\/\//.test(env.DATABASE_URL)) {
    problems.push('DATABASE_URL must be a MySQL connection URL used by the API.');
  } else {
    try {
      const databaseHost = new URL(env.DATABASE_URL).hostname;
      if (!databaseHost || ['localhost', '127.0.0.1', '::1', '[::1]'].includes(databaseHost)) {
        problems.push('DATABASE_URL must use the remote MySQL host in production.');
      }
    } catch {
      problems.push('DATABASE_URL must be a valid MySQL connection URL.');
    }
  }
  if (env.SESSION_SECRET.length < 32 || env.SESSION_SECRET.startsWith('deutschwelt-insecure-') || env.SESSION_SECRET.startsWith('super-secret-')) {
    problems.push('SESSION_SECRET must be a unique secret of at least 32 characters.');
  }
  if (env.COOKIE_SECRET.length < 32 || env.COOKIE_SECRET.startsWith('deutschwelt-insecure-') || env.COOKIE_SECRET.startsWith('super-secret-')) {
    problems.push('COOKIE_SECRET must be a unique secret of at least 32 characters.');
  }
  if (!env.FRONTEND_URL.startsWith('https://')) {
    problems.push('FRONTEND_URL must use HTTPS in production.');
  }
  if (problems.length) {
    throw new Error(`Invalid production configuration:\n- ${problems.join('\n- ')}`);
  }
}
