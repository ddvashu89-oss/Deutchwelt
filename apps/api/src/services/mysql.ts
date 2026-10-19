import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || 's1-livi.neondns.com';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'vecosis_DeutchWelt';
const password = process.env.DB_PASSWORD || 'x{=Q=]qko2%sxNyX';
const database = process.env.DB_NAME || 'vecosiss_DeutchWelt';

let pool: Pool | null = null;
export let isMySQLConnected = false;

export function getMySQLPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000
    });
  }
  return pool;
}

export async function checkMySQLConnection(): Promise<boolean> {
  try {
    const p = getMySQLPool();
    const connection = await p.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    isMySQLConnected = true;
    console.log(`[MySQL] Successfully connected to ${database} on ${host}:${port}`);
    return true;
  } catch (error: any) {
    isMySQLConnected = false;
    console.warn(`[MySQL Warning] Could not connect to remote MySQL server: ${error.message}`);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.warn('[MySQL Action Required] Add your public IP to cPanel -> Remote MySQL to enable remote access.');
    }
    return false;
  }
}
