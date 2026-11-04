import app from './app.js';
import { checkDatabaseConnection } from './services/prisma.js';
import { productionConfigProblems } from './config/env.js';

let databaseCheck: Promise<boolean> | null = null;

async function waitForDatabaseCheck(check: Promise<boolean>): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // An unreachable database must produce the API's 503 response before the
    // serverless platform ends the invocation with a generic 500 page.
    await Promise.race([
      check,
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 3000);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (productionConfigProblems.length === 0) {
      if (!databaseCheck) {
        databaseCheck = checkDatabaseConnection().then((connected) => {
          if (!connected) databaseCheck = null;
          return connected;
        });
      }
      await waitForDatabaseCheck(databaseCheck);
    }
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
