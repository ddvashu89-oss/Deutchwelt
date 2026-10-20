import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'deutschwelt-insecure-dev-session-key-32chars',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'deutschwelt-insecure-dev-cookie-key-32chars',
  SESSION_MAX_AGE_DAYS: parseInt(process.env.SESSION_MAX_AGE_DAYS || '14', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || (process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads')),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  isDev: (process.env.NODE_ENV || 'development') === 'development' && !process.env.VERCEL,
  isTest: (process.env.NODE_ENV || 'development') === 'test',
  isProd: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
};
