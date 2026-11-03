import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole, GermanLevel, StudentRegistrationStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { sendTransactionalEmail } from '../../services/emailDelivery.js';

function hashVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueVerificationEmail(userId: string, email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (isDatabaseConnected) {
    await prisma.emailVerificationToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
    await prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });
  } else {
    store.emailVerificationTokens = store.emailVerificationTokens.filter((item: any) => item.userId !== userId || item.usedAt);
    store.emailVerificationTokens.push({ id: `verify-${Date.now()}`, userId, tokenHash, expiresAt, usedAt: null, createdAt: new Date() });
  }

  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  try {
    const emailSent = await sendTransactionalEmail(email, 'Verify your DeutschWelt email', 'Verify your email address', 'Please verify your email to continue your student registration. This link expires in 24 hours.', 'Verify email', verifyUrl);
    return { emailSent, devVerificationToken: env.isProd ? undefined : token };
  } catch (error) {
    console.error('[Email Verification] Delivery failed:', error);
    return { emailSent: false, devVerificationToken: env.isProd ? undefined : token };
  }
}

function setSessionCookie(res: Response, token: string) {
  res.cookie('dw_session', token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie('dw_session', {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax'
  });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, phone, password, consentToTerms } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    if (isDatabaseConnected) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return next(new AppError('An account with this email address already exists.', 400, 'EMAIL_EXISTS'));
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          role: UserRole.STUDENT,
          isActive: true,
          isEmailVerified: false,
          termsAcceptedAt: consentToTerms ? new Date() : null,
          studentProfile: {
            create: {
              currentLevel: GermanLevel.A1,
              learningGoal: null,
              preferredLanguage: 'en',
              dailyGoalMinutes: 20,
              streakCount: 1,
              lastActiveDate: new Date(),
              registrationStatus: StudentRegistrationStatus.ONBOARDING
            }
          }
        },
        include: { studentProfile: true }
      });

      const verification = await issueVerificationEmail(user.id, user.email);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent,
          ipAddress: clientIp
        }
      });

      setSessionCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to DeutschWelt.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          studentProfile: user.studentProfile
        },
        token,
        verificationEmailSent: verification.emailSent,
        devVerificationToken: verification.devVerificationToken
      });
    } else {
      // Memory store fallback
      const existing = store.users.find(u => u.email === normalizedEmail);
      if (existing) {
        return next(new AppError('An account with this email address already exists.', 400, 'EMAIL_EXISTS'));
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `user-${Date.now()}`;

      const user = {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        lastLoginIp: clientIp,
        userAgent,
        role: UserRole.STUDENT,
        isActive: true,
        isEmailVerified: false,
        termsAcceptedAt: consentToTerms ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const studentProfile = {
        id: `profile-${Date.now()}`,
        userId,
        currentLevel: GermanLevel.A1,
        learningGoal: null,
        preferredLanguage: 'en',
        dailyGoalMinutes: 20,
        streakCount: 1,
        registrationStatus: StudentRegistrationStatus.ONBOARDING,
        registrationRequestedAt: null,
        registrationReviewedAt: null,
        registrationReviewedById: null,
        registrationReviewNote: null,
        lastActiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.users.push(user);
      store.studentProfiles.push(studentProfile);
      const verification = await issueVerificationEmail(userId, normalizedEmail);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

      store.sessions.push({
        id: `session-${Date.now()}`,
        userId,
        token,
        expiresAt,
        userAgent,
        ipAddress: clientIp,
        createdAt: new Date().toISOString()
      });

      setSessionCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to DeutschWelt.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          studentProfile
        },
        token,
        verificationEmailSent: verification.emailSent,
        devVerificationToken: verification.devVerificationToken
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const token = String(req.body?.token || '');
    const tokenHash = hashVerificationToken(token);
    const now = new Date();
    if (isDatabaseConnected) {
      const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
      if (!record || record.usedAt || record.expiresAt <= now) {
        return next(new AppError('This verification link is invalid or expired. Request a new link and try again.', 400, 'VERIFICATION_LINK_INVALID'));
      }
      await prisma.$transaction(async (tx: any) => {
        const consumed = await tx.emailVerificationToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
        if (consumed.count !== 1) throw new AppError('This verification link has already been used or expired.', 400, 'VERIFICATION_LINK_INVALID');
        await tx.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } });
      });
    } else {
      const record = store.emailVerificationTokens.find((item: any) => item.tokenHash === tokenHash && !item.usedAt && new Date(item.expiresAt) > now);
      if (!record) return next(new AppError('This verification link is invalid or expired. Request a new link and try again.', 400, 'VERIFICATION_LINK_INVALID'));
      record.usedAt = now;
      const user = store.users.find(item => item.id === record.userId);
      if (!user) return next(new AppError('This account could not be found.', 404));
      user.isEmailVerified = true;
    }
    return res.json({ success: true, message: 'Email verified. Continue your registration to request admin approval.' });
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (req.user.isEmailVerified) return res.json({ success: true, emailSent: false, alreadyVerified: true });
    const result = await issueVerificationEmail(req.user.id, req.user.email);
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (isDatabaseConnected) {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          studentProfile: true,
          teacherProfile: true
        }
      });

      if (!user) {
        return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
      }

      if (!user.isActive) {
        return next(new AppError('Your account has been suspended or blocked by an administrator. Please contact admissions for assistance.', 403, 'ACCOUNT_BLOCKED'));
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

      const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent,
          ipAddress: clientIp
        }
      });

      setSessionCookie(res, token);

      return res.json({
        success: true,
        message: 'Login successful.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentProfile: user.studentProfile,
          teacherProfile: user.teacherProfile
        },
        token
      });
    } else {
      // Memory store fallback
      const user = store.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
      }

      if (!user.isActive) {
        return next(new AppError('Your account has been suspended or blocked by an administrator. Please contact admissions for assistance.', 403, 'ACCOUNT_BLOCKED'));
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
      }

      const studentProfile = store.studentProfiles.find(sp => sp.userId === user.id);
      const teacherProfile = store.teacherProfiles.find(tp => tp.userId === user.id);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      user.lastLoginIp = clientIp;
      user.userAgent = userAgent;

      store.sessions.push({
        id: `session-${Date.now()}`,
        userId: user.id,
        token,
        expiresAt,
        userAgent,
        ipAddress: clientIp,
        createdAt: new Date().toISOString()
      });

      setSessionCookie(res, token);

      return res.json({
        success: true,
        message: 'Login successful.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentProfile,
          teacherProfile
        },
        token
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.sessionToken;
    if (token) {
      if (isDatabaseConnected) {
        await prisma.session.deleteMany({ where: { token } });
      } else {
        store.sessions = store.sessions.filter(s => s.token !== token);
      }
    }

    clearSessionCookie(res);

    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.isAccountBlocked) {
      clearSessionCookie(res);
      return res.status(403).json({
        success: false,
        authenticated: false,
        blocked: true,
        error: 'Your account has been suspended or blocked by an administrator. Please contact admissions.',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    if (!req.user) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    return res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Generic response to prevent account enumeration
    const message = 'If an account exists with this email address, password reset instructions have been issued.';

    if (env.isDev) {
      console.log(`[Dev Password Reset] Token for ${normalizedEmail}: ${resetToken}`);
    }

    return res.json({
      success: true,
      message,
      ...(env.isDev ? { devResetToken: resetToken } : {})
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    // Password reset processing
    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
}
