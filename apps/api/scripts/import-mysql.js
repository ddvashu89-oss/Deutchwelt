import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function importSchema() {
  const host = process.env.DB_HOST || 's1-livi.neondns.com';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'vecosiss_DeutchWelt';
  const password = process.env.DB_PASSWORD || 'x{=Q=]qko2%sxNyX';
  const database = process.env.DB_NAME || 'vecosiss_DeutchWelt';

  console.log(`Connecting to MySQL server at ${host}:${port}...`);
  console.log(`User: ${user} | Database: ${database}`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
      connectTimeout: 15000
    });

    console.log('✓ Successfully connected to remote MySQL server!');

    const sqlFilePath = path.resolve(__dirname, '../../../deutschwelt_mysql_schema.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Schema file not found at: ${sqlFilePath}`);
    }

    console.log(`Reading SQL schema file: ${sqlFilePath}...`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL schema import into database...');
    await connection.query(sql);

    console.log('✓ Successfully executed schema and initial seed data!');

    const [tables] = await connection.query('SHOW TABLES;');
    console.log(`✓ Tables in ${database}:`, tables.map(r => Object.values(r)[0]));

    await connection.end();
    console.log('Database import completed successfully.');
  } catch (error) {
    console.error('\n❌ MySQL Connection or Import Error:');
    console.error(error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n--> To fix this, you must whitelist your IP address in cPanel:');
      console.error('    1. Open cPanel -> Databases -> Remote MySQL®');
      console.error('    2. Add your current public IP address or "%"');
      console.error('    3. Verify user vecosiss_DeutchWelt has ALL PRIVILEGES on vecosiss_DeutchWelt');
    }
    process.exit(1);
  }
}

importSchema();
