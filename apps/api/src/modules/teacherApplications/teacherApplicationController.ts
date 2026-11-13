import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { TeacherApplicationStatus, UserRole } from '@deutschwelt/shared';
import { teacherApplicationSchema } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { store } from '../../services/store.js';
import { AppError } from '../../middleware/errorHandler.js';
import { uploadDriveFile, streamDriveFile, trashDriveFile, driveFileUrl, isGoogleDriveConfigured, getSelectedDriveFolder } from '../../services/googleDrive.js';
import { sendTransactionalEmail } from '../../services/emailDelivery.js';
import { env } from '../../config/env.js';
import { recordAuditLog } from '../../services/auditService.js';

type ApplicationDocument = { driveFileId?: string; fileName: string; mimeType: string; sizeBytes: number; localData?: string };
type ApplicationDocuments = { cv: ApplicationDocument; certificates: ApplicationDocument[] };
type UploadedFiles = { cv?: Express.Multer.File[]; certificates?: Express.Multer.File[] };

const activeStatuses = [
  TeacherApplicationStatus.SUBMITTED,
  TeacherApplicationStatus.IN_REVIEW,
  TeacherApplicationStatus.INTERVIEW_SCHEDULED,
  TeacherApplicationStatus.INTERVIEWED
];

function languageText(language: string | undefined, en: string, de: string) {
  return language === 'de' ? de : en;
}

function publicApplication(application: any) {
  const { documents, ...safe } = application;
  return {
    ...safe,
    documents: documents ? {
      cv: { fileName: documents.cv?.fileName, sizeBytes: documents.cv?.sizeBytes },
      certificates: (documents.certificates || []).map((item: ApplicationDocument) => ({ fileName: item.fileName, sizeBytes: item.sizeBytes }))
    } : undefined
  };
}

async function sendApplicationEmail(email: string, language: string | undefined, subject: string, enHeading: string, deHeading: string, enMessage: string, deMessage: string, actionLabel: string, actionUrl: string) {
  try {
    return await sendTransactionalEmail(email, subject, languageText(language, enHeading, deHeading), languageText(language, enMessage, deMessage), actionLabel, actionUrl);
  } catch (error) {
    console.error('[Teacher Application Email] Delivery failed:', error);
    return false;
  }
}

async function removeTemporaryFiles(files: UploadedFiles) {
  for (const file of [...(files.cv || []), ...(files.certificates || [])]) {
    await fs.unlink(file.path).catch(() => undefined);
  }
}

async function persistApplicationDocuments(files: UploadedFiles): Promise<ApplicationDocuments> {
  const cv = files.cv?.[0];
  if (!cv) throw new AppError('Upload your CV to submit the application.', 400, 'CV_REQUIRED');
  const certificates = files.certificates || [];

  if (!isDatabaseConnected) {
    const saveInMemory = async (file: Express.Multer.File): Promise<ApplicationDocument> => ({
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      localData: (await fs.readFile(file.path)).toString('base64')
    });
    return { cv: await saveInMemory(cv), certificates: await Promise.all(certificates.map(saveInMemory)) };
  }

  if (!isGoogleDriveConfigured() || !await getSelectedDriveFolder()) {
    throw new AppError('Teacher application document storage is not configured. Please try again later.', 503, 'APPLICATION_STORAGE_UNAVAILABLE');
  }

  const savedIds: string[] = [];
  try {
    const saveToDrive = async (file: Express.Multer.File): Promise<ApplicationDocument> => {
      const stored = await uploadDriveFile(file.path, file.originalname, file.mimetype);
      savedIds.push(stored.driveFileId);
      return { driveFileId: stored.driveFileId, fileName: stored.fileName, mimeType: stored.mimeType, sizeBytes: stored.sizeBytes };
    };
    const savedCv = await saveToDrive(cv);
    const savedCertificates: ApplicationDocument[] = [];
    for (const certificate of certificates) savedCertificates.push(await saveToDrive(certificate));
    return { cv: savedCv, certificates: savedCertificates };
  } catch (error) {
    await Promise.all(savedIds.map(id => trashDriveFile(id).catch(() => undefined)));
    throw error;
  }
}

export async function submitTeacherApplication(req: Request, res: Response, next: NextFunction) {
  const files = (req.files || {}) as UploadedFiles;
  let documents: ApplicationDocuments | undefined;
  try {
    let payload: unknown;
    try { payload = JSON.parse(String(req.body.application || '')); }
    catch { return next(new AppError('Application details are missing or invalid.', 400, 'APPLICATION_INVALID')); }
    const parsed = teacherApplicationSchema.safeParse(payload);
    if (!parsed.success) return next(new AppError(parsed.error.issues[0]?.message || 'Check the application form.', 400, 'APPLICATION_INVALID'));
    if (!files.cv?.[0]) return next(new AppError('Upload your CV to submit the application.', 400, 'CV_REQUIRED'));

    const application = parsed.data;
    if (isDatabaseConnected) {
      const [existingUser, existingApplication] = await Promise.all([
        prisma.user.findUnique({ where: { email: application.email }, select: { id: true } }),
        prisma.teacherApplication.findFirst({ where: { email: application.email, status: { in: activeStatuses } }, select: { id: true } })
      ]);
      if (existingUser) return next(new AppError('An account already uses this email address. Please contact the academy team.', 409, 'EMAIL_ALREADY_REGISTERED'));
      if (existingApplication) return next(new AppError('An application with this email is already being reviewed.', 409, 'APPLICATION_ALREADY_EXISTS'));
    } else if (store.users.some((user: any) => user.email === application.email)) {
      return next(new AppError('An account already uses this email address. Please contact the academy team.', 409, 'EMAIL_ALREADY_REGISTERED'));
    } else if (store.teacherApplications.some((item: any) => item.email === application.email && activeStatuses.includes(item.status))) {
      return next(new AppError('An application with this email is already being reviewed.', 409, 'APPLICATION_ALREADY_EXISTS'));
    }

    documents = await persistApplicationDocuments(files);
    const recordData = {
      ...application,
      consentToPrivacy: undefined,
      phone: application.phone || null,
      privacyConsentAt: new Date(),
      documents: documents as any,
      status: TeacherApplicationStatus.SUBMITTED
    };
    let created: any;
    if (isDatabaseConnected) {
      created = await prisma.teacherApplication.create({ data: recordData });
    } else {
      created = { id: `application-${crypto.randomUUID()}`, ...recordData, createdAt: new Date(), updatedAt: new Date(), adminNotes: null, interviewAt: null, interviewTimezone: null, interviewLocation: null, interviewNotes: null, decisionNote: null, teacherUserId: null, invitationSentAt: null };
      store.teacherApplications.unshift(created);
    }
    const emailSent = await sendApplicationEmail(
      application.email, application.preferredLanguage,
      languageText(application.preferredLanguage, 'We received your DeutschWelt teaching application', 'Wir haben Ihre DeutschWelt-Bewerbung erhalten'),
      'Application received', 'Bewerbung eingegangen',
      'Thank you for applying to teach German at DeutschWelt. Our team will review your profile and contact you about the next steps.',
      'Vielen Dank für Ihre Bewerbung als Deutschlehrkraft bei DeutschWelt. Unser Team prüft Ihr Profil und meldet sich zu den nächsten Schritten.',
      languageText(application.preferredLanguage, 'Visit DeutschWelt', 'DeutschWelt besuchen'), env.FRONTEND_URL
    );
    return res.status(201).json({ success: true, message: 'Application received.', emailSent });
  } catch (error) {
    if (documents && isDatabaseConnected) {
      const ids = [documents.cv, ...documents.certificates].map(item => item.driveFileId).filter((id): id is string => Boolean(id));
      await Promise.all(ids.map(id => trashDriveFile(id).catch(() => undefined)));
    }
    next(error);
  } finally {
    await removeTemporaryFiles(files);
  }
}

export async function listTeacherApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const status = typeof req.query.status === 'string' && Object.values(TeacherApplicationStatus).includes(req.query.status as any)
      ? req.query.status as TeacherApplicationStatus : undefined;
    const applications = isDatabaseConnected
      ? await prisma.teacherApplication.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: 'desc' } })
      : store.teacherApplications.filter((item: any) => !status || item.status === status).sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return res.json({ success: true, applications: applications.map(publicApplication) });
  } catch (error) { next(error); }
}

export async function getTeacherApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const application = isDatabaseConnected
      ? await prisma.teacherApplication.findUnique({ where: { id: req.params.applicationId } })
      : store.teacherApplications.find((item: any) => item.id === req.params.applicationId);
    if (!application) return next(new AppError('Teacher application not found.', 404));
    return res.json({ success: true, application: publicApplication(application) });
  } catch (error) { next(error); }
}

export async function updateTeacherApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.body?.status;
    if (![TeacherApplicationStatus.IN_REVIEW, TeacherApplicationStatus.INTERVIEWED].includes(status)) {
      return next(new AppError('Choose a valid review status.', 400));
    }
    const adminNotes = typeof req.body.adminNotes === 'string' ? req.body.adminNotes.trim().slice(0, 4000) : undefined;
    const existing = isDatabaseConnected
      ? await prisma.teacherApplication.findUnique({ where: { id: req.params.applicationId } })
      : store.teacherApplications.find((item: any) => item.id === req.params.applicationId);
    if (!existing) return next(new AppError('Teacher application not found.', 404));
    if ([TeacherApplicationStatus.HIRED, TeacherApplicationStatus.DECLINED].includes(existing.status)) return next(new AppError('A final decision has already been recorded.', 409));
    const updated = isDatabaseConnected
      ? await prisma.teacherApplication.update({ where: { id: existing.id }, data: { status, adminNotes, reviewedById: req.user!.id } })
      : Object.assign(existing, { status, adminNotes: adminNotes ?? existing.adminNotes, reviewedById: req.user!.id, updatedAt: new Date() });
    return res.json({ success: true, application: publicApplication(updated) });
  } catch (error) { next(error); }
}

export async function scheduleTeacherInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const interviewAt = new Date(req.body?.interviewAt);
    const timezone = typeof req.body?.timezone === 'string' ? req.body.timezone.trim() : '';
    const location = typeof req.body?.location === 'string' ? req.body.location.trim().slice(0, 1000) : '';
    const interviewNotes = typeof req.body?.notes === 'string' ? req.body.notes.trim().slice(0, 3000) : '';
    if (!Number.isFinite(interviewAt.getTime()) || interviewAt.getTime() < Date.now() - 60_000) return next(new AppError('Choose an upcoming interview date and time.', 400));
    if (!timezone || timezone.length > 100 || !validTimezone(timezone)) return next(new AppError('Enter a valid time zone, such as Europe/Berlin.', 400));
    const existing = isDatabaseConnected
      ? await prisma.teacherApplication.findUnique({ where: { id: req.params.applicationId } })
      : store.teacherApplications.find((item: any) => item.id === req.params.applicationId);
    if (!existing) return next(new AppError('Teacher application not found.', 404));
    if ([TeacherApplicationStatus.HIRED, TeacherApplicationStatus.DECLINED].includes(existing.status)) return next(new AppError('A final decision has already been recorded.', 409));
    const updated = isDatabaseConnected
      ? await prisma.teacherApplication.update({ where: { id: existing.id }, data: { status: TeacherApplicationStatus.INTERVIEW_SCHEDULED, interviewAt, interviewTimezone: timezone, interviewLocation: location || null, interviewNotes: interviewNotes || null, reviewedById: req.user!.id } })
      : Object.assign(existing, { status: TeacherApplicationStatus.INTERVIEW_SCHEDULED, interviewAt, interviewTimezone: timezone, interviewLocation: location || null, interviewNotes: interviewNotes || null, reviewedById: req.user!.id, updatedAt: new Date() });

    const formattedDate = new Intl.DateTimeFormat(updated.preferredLanguage === 'de' ? 'de-DE' : 'en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(interviewAt);
    const emailSent = await sendApplicationEmail(
      updated.email, updated.preferredLanguage,
      languageText(updated.preferredLanguage, 'DeutschWelt teacher interview scheduled', 'DeutschWelt-Interview vereinbart'),
      'Your interview is scheduled', 'Ihr Vorstellungsgespräch ist geplant',
      `We would like to meet with you on ${formattedDate} (${timezone}). ${location ? `Interview details: ${location}.` : ''} ${interviewNotes ? `Note: ${interviewNotes}` : ''}`,
      `Wir möchten Sie am ${formattedDate} (${timezone}) kennenlernen. ${location ? `Details zum Gespräch: ${location}.` : ''} ${interviewNotes ? `Hinweis: ${interviewNotes}` : ''}`,
      languageText(updated.preferredLanguage, 'Open DeutschWelt', 'DeutschWelt öffnen'), env.FRONTEND_URL
    );
    return res.json({ success: true, application: publicApplication(updated), emailSent });
  } catch (error) { next(error); }
}

function validTimezone(timezone: string) {
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); return true; } catch { return false; }
}

async function createTeacherAccount(application: any, adminId: string) {
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('base64url'), 10);
  if (isDatabaseConnected) {
    const existingUser = await prisma.user.findUnique({ where: { email: application.email }, select: { id: true } });
    if (existingUser) throw new AppError('This applicant email already belongs to an account. Review the existing account before hiring.', 409, 'EMAIL_ALREADY_REGISTERED');
    return prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          firstName: application.firstName, lastName: application.lastName, email: application.email,
          phone: application.phone || null, passwordHash, role: UserRole.TEACHER, isActive: true, isEmailVerified: true,
          teacherProfile: { create: { bio: application.motivation, qualifications: application.qualifications, specialization: application.specialization, maxBatches: 5 } }
        }
      });
      const updated = await tx.teacherApplication.update({ where: { id: application.id }, data: { status: TeacherApplicationStatus.HIRED, teacherUserId: user.id, reviewedById: adminId } });
      return { userId: user.id, updated };
    });
  }
  if (store.users.some((user: any) => user.email === application.email)) throw new AppError('This applicant email already belongs to an account. Review the existing account before hiring.', 409, 'EMAIL_ALREADY_REGISTERED');
  const now = new Date().toISOString();
  const user = { id: `teacher-${crypto.randomUUID()}`, firstName: application.firstName, lastName: application.lastName, email: application.email, phone: application.phone, passwordHash, role: UserRole.TEACHER, isActive: true, isEmailVerified: true, createdAt: now, updatedAt: now };
  const profile = { id: `profile-${crypto.randomUUID()}`, userId: user.id, bio: application.motivation, qualifications: application.qualifications, specialization: application.specialization, maxBatches: 5, createdAt: now, updatedAt: now };
  store.users.push(user);
  store.teacherProfiles.push(profile);
  const updated = Object.assign(application, { status: TeacherApplicationStatus.HIRED, teacherUserId: user.id, reviewedById: adminId, updatedAt: now });
  return { userId: user.id, updated };
}

async function issueTeacherPasswordInvite(userId: string, application: any) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (isDatabaseConnected) {
    await prisma.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
    await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  } else {
    store.passwordResetTokens = store.passwordResetTokens.filter((item: any) => item.userId !== userId || item.usedAt);
    store.passwordResetTokens.push({ id: `reset-${Date.now()}`, userId, tokenHash, expiresAt, usedAt: null, createdAt: new Date() });
  }
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const emailSent = await sendApplicationEmail(
    application.email, application.preferredLanguage,
    languageText(application.preferredLanguage, 'Welcome to the DeutschWelt teaching team', 'Willkommen im DeutschWelt-Lehrteam'),
    'You have been hired', 'Sie wurden eingestellt',
    'Welcome to the DeutschWelt teaching team. Set your password using the secure link below. It expires in one hour.',
    'Willkommen im DeutschWelt-Lehrteam. Legen Sie Ihr Passwort über den sicheren Link fest. Er läuft in einer Stunde ab.',
    languageText(application.preferredLanguage, 'Set your password', 'Passwort festlegen'), resetUrl
  );
  if (emailSent && isDatabaseConnected) await prisma.teacherApplication.update({ where: { id: application.id }, data: { invitationSentAt: new Date() } });
  if (emailSent && !isDatabaseConnected) application.invitationSentAt = new Date();
  return { emailSent, devResetToken: env.isDev ? token : undefined };
}

export async function decideTeacherApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const decision = req.body?.decision;
    if (decision !== TeacherApplicationStatus.HIRED && decision !== TeacherApplicationStatus.DECLINED) return next(new AppError('Choose hired or declined.', 400));
    const decisionNote = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 4000) : '';
    const application = isDatabaseConnected
      ? await prisma.teacherApplication.findUnique({ where: { id: req.params.applicationId } })
      : store.teacherApplications.find((item: any) => item.id === req.params.applicationId);
    if (!application) return next(new AppError('Teacher application not found.', 404));
    if ([TeacherApplicationStatus.HIRED, TeacherApplicationStatus.DECLINED].includes(application.status)) return next(new AppError('A final decision has already been recorded.', 409));

    let updated: any;
    let invite: { emailSent: boolean; devResetToken?: string } | undefined;
    if (decision === TeacherApplicationStatus.HIRED) {
      const created = await createTeacherAccount(application, req.user!.id);
      updated = created.updated;
      if (isDatabaseConnected) updated = await prisma.teacherApplication.update({ where: { id: updated.id }, data: { decisionNote: decisionNote || null } });
      else updated.decisionNote = decisionNote || null;
      invite = await issueTeacherPasswordInvite(created.userId, updated);
      await recordAuditLog({ userId: req.user!.id, action: 'HIRE_TEACHER_APPLICATION', entityType: 'TeacherApplication', entityId: updated.id, details: { teacherUserId: created.userId } });
    } else {
      updated = isDatabaseConnected
        ? await prisma.teacherApplication.update({ where: { id: application.id }, data: { status: decision, decisionNote: decisionNote || null, reviewedById: req.user!.id } })
        : Object.assign(application, { status: decision, decisionNote: decisionNote || null, reviewedById: req.user!.id, updatedAt: new Date() });
      await sendApplicationEmail(
        updated.email, updated.preferredLanguage,
        languageText(updated.preferredLanguage, 'Update on your DeutschWelt teaching application', 'Aktualisierung zu Ihrer DeutschWelt-Bewerbung'),
        'Application update', 'Aktualisierung Ihrer Bewerbung',
        'Thank you for taking the time to apply and meet with us. We are unable to offer you a teaching role at this time.',
        'Vielen Dank für Ihre Bewerbung und das Gespräch. Leider können wir Ihnen derzeit keine Lehrtätigkeit anbieten.',
        languageText(updated.preferredLanguage, 'Visit DeutschWelt', 'DeutschWelt besuchen'), env.FRONTEND_URL
      );
      await recordAuditLog({ userId: req.user!.id, action: 'DECLINE_TEACHER_APPLICATION', entityType: 'TeacherApplication', entityId: updated.id, details: {} });
    }
    return res.json({ success: true, application: publicApplication(updated), invitationSent: invite?.emailSent || false, devResetToken: invite?.devResetToken });
  } catch (error) { next(error); }
}

export async function resendTeacherInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const application = isDatabaseConnected
      ? await prisma.teacherApplication.findUnique({ where: { id: req.params.applicationId } })
      : store.teacherApplications.find((item: any) => item.id === req.params.applicationId);
    if (!application || application.status !== TeacherApplicationStatus.HIRED || !application.teacherUserId) return next(new AppError('A hired teacher account was not found for this application.', 404));
    const invite = await issueTeacherPasswordInvite(application.teacherUserId, application);
    return res.json({ success: true, invitationSent: invite.emailSent, devResetToken: invite.devResetToken });
  } catch (error) { next(error); }
}

export async function downloadTeacherApplicationDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const application = isDatabaseConnected
      ? await prisma.teacherApplication.findUnique({ where: { id: req.params.applicationId } })
      : store.teacherApplications.find((item: any) => item.id === req.params.applicationId);
    if (!application) return next(new AppError('Teacher application not found.', 404));
    const documents = application.documents as ApplicationDocuments;
    const document = req.params.documentType === 'cv'
      ? documents?.cv
      : req.params.documentType === 'certificate' && /^\d+$/.test(req.params.index || '')
        ? documents?.certificates?.[Number(req.params.index)] : undefined;
    if (!document) return next(new AppError('Application document not found.', 404));
    let data: Buffer;
    if (document.driveFileId) {
      const upstream = await streamDriveFile(document.driveFileId);
      data = Buffer.from(await upstream.arrayBuffer());
    } else if (document.localData && !isDatabaseConnected) {
      data = Buffer.from(document.localData, 'base64');
    } else return next(new AppError('Application document is unavailable.', 404));
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName.replace(/[\r\n"\\]/g, '_')}"`);
    return res.send(data);
  } catch (error) { next(error); }
}
