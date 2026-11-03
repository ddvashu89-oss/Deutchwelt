import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { prisma, isDatabaseConnected } from './prisma.js';

type SystemLogInput = {
  userId?: string | null;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
  source: string;
  event: string;
  message: string;
  context?: Record<string, unknown>;
  requestId?: string;
};

export async function writeSystemLog(input: SystemLogInput) {
  if (!isDatabaseConnected) return;
  try {
    await prisma.systemLog.create({
      data: {
        userId: input.userId || null,
        level: input.level || 'INFO',
        source: input.source.slice(0, 64),
        event: input.event.slice(0, 100),
        message: input.message.slice(0, 60000),
        context: input.context as any,
        requestId: input.requestId?.slice(0, 64)
      }
    });
  } catch (error) {
    console.error('[System Log Error]', error);
  }
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  res.setHeader('X-Request-Id', requestId);

  res.once('finish', () => {
    if (!isDatabaseConnected) return;

    const durationMs = Math.max(0, Date.now() - startedAt);
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    const requestPath = (req.originalUrl.split('?')[0] || req.path).slice(0, 512);
    const method = req.method.slice(0, 12);
    const userId = req.user?.id || null;
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 45);
    const userAgent = req.get('user-agent')?.slice(0, 512) || null;

    // SystemLog contains operational metadata only. IP address and user agent are stored
    // exclusively in IpAccessLog, with query strings and request bodies deliberately omitted.
    void Promise.allSettled([
      writeSystemLog({
        userId,
        level,
        source: 'http',
        event: 'HTTP_REQUEST',
        message: `${method} ${requestPath} completed with ${statusCode}`,
        context: { method, path: requestPath, statusCode, durationMs },
        requestId
      }),
      prisma.ipAccessLog.create({
        data: {
          userId,
          ipAddress,
          method,
          requestPath,
          statusCode,
          userAgent,
          requestId,
          durationMs
        }
      })
    ]).then(results => {
      if (results[1].status === 'rejected') console.error('[IP Access Log Error]', results[1].reason);
    });
  });

  next();
}
