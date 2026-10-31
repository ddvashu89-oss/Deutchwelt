import app from './app.js';
import { checkDatabaseConnection } from './services/prisma.js';

let databaseCheck: Promise<boolean> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!databaseCheck) databaseCheck = checkDatabaseConnection();
    if (!await databaseCheck) databaseCheck = null;
    return app(req, res);
  } catch (err: any) {
    console.error('[Serverless Handler Error]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: err?.message || 'Serverless invocation error'
    }));
  }
}
