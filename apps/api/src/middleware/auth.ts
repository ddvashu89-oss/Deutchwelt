import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../services/prisma.js';
import { store } from '../services/store.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  studentProfile?: any;
  teacherProfile?: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.dw_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);

    if (!token) {
      return next();
    }

    req.sessionToken = token;

    if (isDatabaseConnected) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              studentProfile: true,
              teacherProfile: true
            }
          }
        }
      });

      if (session && session.expiresAt > new Date() && session.user.isActive) {
        req.user = {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role as UserRole,
          isActive: session.user.isActive,
          isEmailVerified: session.user.isEmailVerified,
          studentProfile: session.user.studentProfile,
          teacherProfile: session.user.teacherProfile
        };
      }
    } else {
      // Memory store fallback
      const session = store.sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
      if (session) {
        const user = store.users.find(u => u.id === session.userId && u.isActive);
        if (user) {
          const studentProfile = store.studentProfiles.find(sp => sp.userId === user.id);
          const teacherProfile = store.teacherProfiles.find(tp => tp.userId === user.id);
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            studentProfile,
            teacherProfile
          };
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required. Please log in to continue.', 401, 'UNAUTHORIZED'));
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }
    next();
  };
}
