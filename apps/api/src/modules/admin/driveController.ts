import { Request, Response, NextFunction } from 'express';
import {
  buildDriveAuthorizationUrl,
  completeDriveOAuth,
  createDriveOAuthState,
  driveOAuthStateUserId,
  getDrivePickerConfig,
  getDriveStatus,
  selectDriveFolder,
  verifyDriveOAuthState
} from '../../services/googleDrive.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { isDatabaseConnected, prisma } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { UserRole } from '@deutschwelt/shared';

function settingsUrl(status: string) {
  const url = new URL('/admin/settings', env.FRONTEND_URL);
  url.searchParams.set('drive', status);
  return url.toString();
}

export function connectGoogleDrive(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isDatabaseConnected) {
      return next(new AppError('Connect PostgreSQL before enabling Drive so the encrypted authorization and file access records can be saved durably.', 503));
    }
    const state = createDriveOAuthState(req.user!.id);
    res.cookie('dw_drive_oauth_state', state, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'lax',
      path: '/api/v1/admin/drive/callback',
      maxAge: 10 * 60 * 1000
    });
    return res.redirect(buildDriveAuthorizationUrl(state));
  } catch (error) {
    next(error);
  }
}

export async function googleDriveOAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const state = String(req.query.state || '');
    const code = String(req.query.code || '');
    const stateCookie = req.cookies?.dw_drive_oauth_state;
    res.clearCookie('dw_drive_oauth_state', {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'lax',
      path: '/api/v1/admin/drive/callback'
    });
    if (!stateCookie || stateCookie !== state) {
      return next(new AppError('Google Drive authorization expired or did not match your admin session. Please reconnect.', 400));
    }
    if (req.query.error) return res.redirect(settingsUrl('cancelled'));
    const adminId = driveOAuthStateUserId(state);
    if (!adminId) return next(new AppError('Google Drive authorization expired. Please reconnect.', 400));
    const isCurrentAdmin = isDatabaseConnected
      ? Boolean(await prisma.user.findFirst({ where: { id: adminId, role: UserRole.ADMIN, isActive: true }, select: { id: true } }))
      : store.users.some(user => user.id === adminId && user.role === UserRole.ADMIN && user.isActive);
    if (!isCurrentAdmin) return next(new AppError('An active administrator must connect Google Drive.', 403));
    if (!verifyDriveOAuthState(state, adminId)) return next(new AppError('Google Drive authorization state is invalid.', 400));
    if (!code) return next(new AppError('Google did not return an authorization code.', 400));
    if (!isDatabaseConnected) return res.redirect(settingsUrl('database-required'));

    await completeDriveOAuth(code);
    return res.redirect(settingsUrl('connected'));
  } catch (error) {
    next(error);
  }
}

export async function getGoogleDriveStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, drive: await getDriveStatus() });
  } catch (error) {
    next(error);
  }
}

export async function getGoogleDrivePickerConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    if (!isDatabaseConnected) return next(new AppError('Connect PostgreSQL before configuring Google Drive storage.', 503));
    return res.json({ success: true, picker: await getDrivePickerConfig() });
  } catch (error) {
    next(error);
  }
}

export async function saveGoogleDriveFolder(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isDatabaseConnected) return next(new AppError('Connect PostgreSQL before configuring Google Drive storage.', 503));
    const id = typeof req.body?.id === 'string' ? req.body.id.trim() : '';
    if (!id) return next(new AppError('Choose a Google Drive folder first.', 400));
    const folder = await selectDriveFolder(id);
    return res.json({ success: true, folder });
  } catch (error) {
    next(error);
  }
}
