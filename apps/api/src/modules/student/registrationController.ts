import { NextFunction, Request, Response } from 'express';
import { StudentRegistrationStatus } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';

function currentProfile(userId: string) {
  return store.studentProfiles.find(profile => profile.userId === userId);
}

export async function getRegistrationState(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (isDatabaseConnected) {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      return res.json({ success: true, isEmailVerified: req.user.isEmailVerified, phone: req.user.phone || '', profile });
    }
    return res.json({ success: true, isEmailVerified: req.user.isEmailVerified, phone: req.user.phone || '', profile: currentProfile(req.user.id) || null });
  } catch (error) { next(error); }
}

export async function updateRegistrationOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (req.user.isEmailVerified === false) return next(new AppError('Verify your email before submitting your student application.', 403, 'EMAIL_VERIFICATION_REQUIRED'));
    const { phone, currentLevel, learningGoal, preferredLanguage } = req.body;
    if (isDatabaseConnected) {
      const profile = await prisma.studentProfile.update({
        where: { userId: req.user.id },
        data: { currentLevel, learningGoal, preferredLanguage }
      });
      if (phone !== undefined) await prisma.user.update({ where: { id: req.user.id }, data: { phone: phone || null } });
      return res.json({ success: true, profile });
    }

    const profile = currentProfile(req.user.id);
    const user = store.users.find(item => item.id === req.user!.id);
    if (!profile || !user) return next(new AppError('Student registration profile was not found.', 404));
    Object.assign(profile, { currentLevel, learningGoal, preferredLanguage, updatedAt: new Date().toISOString() });
    if (phone !== undefined) user.phone = phone || null;
    return res.json({ success: true, profile });
  } catch (error) { next(error); }
}

export async function requestRegistrationApproval(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    if (!req.user.isEmailVerified) return next(new AppError('Verify your email before requesting admin approval.', 403, 'EMAIL_VERIFICATION_REQUIRED'));
    const now = new Date();

    if (isDatabaseConnected) {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) return next(new AppError('Student registration profile was not found.', 404));
      if (!profile.learningGoal?.trim()) return next(new AppError('Complete your learning goal before submitting for approval.', 400, 'ONBOARDING_INCOMPLETE'));
      if (profile.registrationStatus === StudentRegistrationStatus.PENDING_APPROVAL) {
        return res.json({ success: true, profile, alreadyPending: true });
      }
      if (profile.registrationStatus === StudentRegistrationStatus.APPROVED) {
        return next(new AppError('This student registration has already been approved.', 409));
      }
      const updated = await prisma.studentProfile.update({
        where: { userId: req.user.id },
        data: {
          registrationStatus: StudentRegistrationStatus.PENDING_APPROVAL,
          registrationRequestedAt: now,
          registrationReviewedAt: null,
          registrationReviewedById: null,
          registrationReviewNote: null
        }
      });
      return res.json({ success: true, profile: updated, message: 'Your registration is with the academy admin for review.' });
    }

    const profile = currentProfile(req.user.id);
    if (!profile) return next(new AppError('Student registration profile was not found.', 404));
    if (!profile.learningGoal?.trim()) return next(new AppError('Complete your learning goal before submitting for approval.', 400, 'ONBOARDING_INCOMPLETE'));
    if (profile.registrationStatus === StudentRegistrationStatus.PENDING_APPROVAL) return res.json({ success: true, profile, alreadyPending: true });
    if (profile.registrationStatus === StudentRegistrationStatus.APPROVED) return next(new AppError('This student registration has already been approved.', 409));
    Object.assign(profile, {
      registrationStatus: StudentRegistrationStatus.PENDING_APPROVAL,
      registrationRequestedAt: now.toISOString(),
      registrationReviewedAt: null,
      registrationReviewedById: null,
      registrationReviewNote: null,
      updatedAt: now.toISOString()
    });
    return res.json({ success: true, profile, message: 'Your registration is with the academy admin for review.' });
  } catch (error) { next(error); }
}
