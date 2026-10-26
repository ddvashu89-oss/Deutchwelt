import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const appEnv = (process.env.APP_ENV || (process.env.VERCEL ? 'production' : 'sandbox')).toLowerCase();

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
  isDev: nodeEnv === 'development' && !process.env.VERCEL,
  isTest: nodeEnv === 'test',
  isProd: nodeEnv === 'production' || process.env.VERCEL === '1',
  isSandbox: appEnv === 'sandbox' || (!process.env.VERCEL && nodeEnv !== 'production')
};
