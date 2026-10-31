import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { store } from '../../services/store.js';
import { isDatabaseConnected } from '../../services/prisma.js';
import { UserRole } from '@deutschwelt/shared';
import { AppError } from '../../middleware/errorHandler.js';

export async function getEnvironmentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({
      success: true,
      environment: env.isSandbox ? 'sandbox' : 'production',
      isSandbox: env.isSandbox,
      isProduction: env.isProd,
      nodeEnv: env.NODE_ENV,
      databaseMode: isDatabaseConnected ? 'PostgreSQL' : 'Isolated Memory Sandbox',
      securityControls: {
        xssSanitization: true,
        strictCors: true,
        rateLimiting: true,
        accountSuspensionEnforced: true,
        rbacEnforced: true,
        bcryptSaltRounds: 10,
        cookieHttpOnly: true,
        cookieSecure: env.isProd,
        cookieSameSite: env.isProd ? 'strict' : 'lax'
      },
      sandboxSimulationActive: store.isSandboxMode,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export async function resetSandboxData(req: Request, res: Response, next: NextFunction) {
  try {
    // Only allow reset if in sandbox mode OR if authenticated caller is an ADMIN
    const isAuthorized = env.isSandbox || (req.user && req.user.role === UserRole.ADMIN);

    if (!isAuthorized) {
      return next(new AppError('Sandbox reset is prohibited in production mode without administrator authorization.', 403));
    }

    const result = store.resetSandbox();

    return res.json({
      success: true,
      message: 'Sandbox environment successfully restored to factory demo state.',
      timestamp: result.timestamp,
      environment: 'sandbox'
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleSandboxMode(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.isSandbox) {
      return next(new AppError('Sandbox controls are disabled outside the sandbox environment.', 404));
    }
    const { enabled } = req.body;
    store.isSandboxMode = Boolean(enabled);

    return res.json({
      success: true,
      message: `Sandbox simulation mode is now ${store.isSandboxMode ? 'ENABLED' : 'DISABLED'}.`,
      sandboxSimulationActive: store.isSandboxMode
    });
  } catch (error) {
    next(error);
  }
}
