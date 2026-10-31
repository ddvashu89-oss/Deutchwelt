import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || "";
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || "";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_DATABASE || "";

const isMySQLEnabled = process.env.ENABLE_MYSQL === "true" && Boolean(host && user && password && database);

let pool: Pool | null = null;
export let isMySQLConnected = false;

export function getMySQLPool(): Pool {
  if (!isMySQLEnabled) throw new Error("MySQL is disabled or missing explicit connection settings.");
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
  if (!isMySQLEnabled) {
    isMySQLConnected = false;
    console.log("[MySQL] Disabled; only explicitly configured connections are allowed.");
    return false;
  }
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
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.warn(`[MySQL Notice] Remote MySQL (${host}) access requires client IP whitelist in cPanel -> Remote MySQL. Using resilient in-memory store.`);
    } else {
      console.warn(`[MySQL Notice] Remote MySQL server unreachable (${error.message}). Using resilient in-memory store.`);
    }
    return false;
  }
}
