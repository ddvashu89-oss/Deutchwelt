import app from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './services/prisma.js';
import { checkMySQLConnection } from './services/mysql.js';

async function bootstrap() {
  await Promise.allSettled([
    checkDatabaseConnection(),
    checkMySQLConnection()
  ]);

  const server = app.listen(env.PORT, () => {
    console.log(`=================================================`);
    console.log(`🇩🇪 DeutschWelt Backend API Running on port ${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API Base: http://localhost:${env.PORT}/api/v1`);
    console.log(`❤️  Health:   http://localhost:${env.PORT}/api/v1/health`);
    console.log(`=================================================`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Server Bootstrap Error]', err);
  process.exit(1);
});
