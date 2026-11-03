import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@deutschwelt/shared';
import { prisma, isDatabaseConnected } from '../../services/prisma.js';
import { notifyBatchStudents } from '../../services/notifications.js';
import { AppError } from '../../middleware/errorHandler.js';

const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

function requireDb(next: NextFunction) {
  if (!isDatabaseConnected) return next(new AppError('Class scheduling requires the connected MySQL database.', 503));
  return null;
}

async function teacherProfileIdFor(req: Request) {
  if (req.user?.role === UserRole.ADMIN) return null;
  if (req.user?.teacherProfile?.id) return req.user.teacherProfile.id;
  if (!req.user) return null;
  const profile = await prisma.teacherProfile.findUnique({ where: { userId: req.user.id }, select: { id: true } });
  return profile?.id || null;
}

export async function getStudentSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    if (requireDb(next)) return;
    if (!req.user) return next(new AppError('Authentication required.', 401));
    const memberships = await prisma.batchMembership.findMany({ where: { userId: req.user.id, status: 'ACTIVE' }, select: { batchId: true } });
    const classes = await prisma.liveClass.findMany({
      where: { batchId: { in: memberships.map((membership: any) => membership.batchId) }, startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { startsAt: 'asc' },
      take: 80,
      include: {
        batch: { select: { id: true, name: true, level: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        attendance: { where: { studentId: req.user.id }, select: { status: true, markedAt: true } }
      }
    });
    return res.json({ success: true, classes: classes.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startsAt: item.startsAt,
      durationMinutes: item.durationMinutes,
      meetingUrl: item.meetingUrl,
      batch: item.batch,
      teacherName: `${item.teacher.user.firstName} ${item.teacher.user.lastName}`,
      attendanceStatus: item.attendance[0]?.status || null,
      canCheckIn: Date.now() >= item.startsAt.getTime() - 15 * 60 * 1000 && Date.now() <= item.startsAt.getTime() + (item.durationMinutes + 15) * 60 * 1000
    })) });
  } catch (error) { next(error); }
}

export async function studentCheckIn(req: Request, res: Response, next: NextFunction) {
  try {
    if (requireDb(next)) return;
    if (!req.user || req.user.role !== UserRole.STUDENT) return next(new AppError('Only students can check in to their own classes.', 403));
    const liveClass = await prisma.liveClass.findUnique({ where: { id: req.params.classId } });
    if (!liveClass) return next(new AppError('Class not found.', 404));
    const member = await prisma.batchMembership.findUnique({ where: { batchId_userId: { batchId: liveClass.batchId, userId: req.user.id } } });
    if (!member || member.status !== 'ACTIVE') return next(new AppError('You are not enrolled in this class batch.', 403));
    const now = Date.now();
    if (now < liveClass.startsAt.getTime() - 15 * 60 * 1000 || now > liveClass.startsAt.getTime() + (liveClass.durationMinutes + 15) * 60 * 1000) {
      return next(new AppError('Check-in opens 15 minutes before class and closes 15 minutes after it ends.', 409));
    }
    const attendance = await prisma.liveClassAttendance.upsert({
      where: { sessionId_studentId: { sessionId: liveClass.id, studentId: req.user.id } },
      create: { sessionId: liveClass.id, studentId: req.user.id, markedById: req.user.id, status: 'PRESENT' },
      update: { markedById: req.user.id, status: 'PRESENT', markedAt: new Date() }
    });
    return res.json({ success: true, attendance });
  } catch (error) { next(error); }
}

export async function getTeacherClasses(req: Request, res: Response, next: NextFunction) {
  try {
    if (requireDb(next)) return;
    const teacherProfileId = await teacherProfileIdFor(req);
    if (req.user?.role !== UserRole.ADMIN && !teacherProfileId) return next(new AppError('Teacher profile not found.', 403));
    const classes = await prisma.liveClass.findMany({
      where: teacherProfileId ? { teacherProfileId } : {},
      orderBy: { startsAt: 'asc' },
      take: 100,
      include: { batch: { select: { id: true, name: true, level: true } }, _count: { select: { attendance: true } } }
    });
    return res.json({ success: true, classes });
  } catch (error) { next(error); }
}

export async function createLiveClass(req: Request, res: Response, next: NextFunction) {
  try {
    if (requireDb(next)) return;
    if (!req.user) return next(new AppError('Authentication required.', 401));
    const teacherProfileId = await teacherProfileIdFor(req);
    if (!teacherProfileId) return next(new AppError('Teacher profile not found.', 403));
    const batchId = typeof req.body?.batchId === 'string' ? req.body.batchId : '';
    const title = typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 180) : '';
    const startsAt = new Date(req.body?.startsAt);
    const durationMinutes = Math.max(15, Math.min(240, Math.round(Number(req.body?.durationMinutes) || 45)));
    const meetingUrl = typeof req.body?.meetingUrl === 'string' ? req.body.meetingUrl.trim() : '';
    let validMeetingUrl = false;
    try { validMeetingUrl = new URL(meetingUrl).protocol === 'https:'; } catch { /* invalid link */ }
    if (!batchId || title.length < 4 || !Number.isFinite(startsAt.getTime()) || startsAt.getTime() < Date.now() || startsAt.getTime() > Date.now() + 365 * 86400000 || !validMeetingUrl) {
      return next(new AppError('Add a title, future date, duration and valid HTTPS meeting link.', 400));
    }
    const assigned = req.user.role === UserRole.ADMIN || await prisma.teacherBatchAssignment.findUnique({ where: { batchId_teacherId: { batchId, teacherId: teacherProfileId } }, select: { id: true } });
    if (!assigned) return next(new AppError('You can schedule classes only for your assigned batches.', 403));
    const batch = await prisma.teacherBatch.findUnique({ where: { id: batchId }, select: { id: true, name: true } });
    if (!batch) return next(new AppError('Batch not found.', 404));
    const liveClass = await prisma.liveClass.create({
      data: { batchId, teacherProfileId, title, description: String(req.body?.description || '').trim().slice(0, 2000) || null, startsAt, durationMinutes, meetingUrl },
      include: { batch: { select: { id: true, name: true, level: true } } }
    });
    await notifyBatchStudents(batchId, 'Live class scheduled', `${liveClass.title} for ${batch.name} is scheduled for ${startsAt.toLocaleString()}.`, '/student/schedule').catch(error => console.warn('[Class notification] Could not notify every batch member:', error?.message));
    return res.status(201).json({ success: true, liveClass });
  } catch (error) { next(error); }
}

async function getAuthorizedClass(req: Request, next: NextFunction) {
  const teacherProfileId = await teacherProfileIdFor(req);
  if (req.user?.role !== UserRole.ADMIN && !teacherProfileId) { next(new AppError('Teacher profile not found.', 403)); return null; }
  const liveClass = await prisma.liveClass.findFirst({ where: { id: req.params.classId, ...(teacherProfileId ? { teacherProfileId } : {}) } });
  if (!liveClass) { next(new AppError('Class not found or unauthorized.', 404)); return null; }
  return liveClass;
}

export async function getClassRoster(req: Request, res: Response, next: NextFunction) {
  try {
    if (requireDb(next)) return;
    const liveClass = await getAuthorizedClass(req, next);
    if (!liveClass) return;
    const members = await prisma.batchMembership.findMany({
      where: { batchId: liveClass.batchId, status: 'ACTIVE' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { joinedAt: 'asc' }
    });
    const attendance = await prisma.liveClassAttendance.findMany({ where: { sessionId: liveClass.id } });
    const byStudent = new Map(attendance.map((record: any) => [record.studentId, record]));
    return res.json({ success: true, liveClass, students: members.map((membership: any) => ({ ...membership.user, attendance: byStudent.get(membership.user.id) || null })) });
  } catch (error) { next(error); }
}

export async function saveClassAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    if (requireDb(next)) return;
    const liveClass = await getAuthorizedClass(req, next);
    if (!liveClass) return;
    const records = Array.isArray(req.body?.records) ? req.body.records.slice(0, 250) : [];
    if (!records.length) return next(new AppError('Choose attendance for at least one student.', 400));
    const memberships = await prisma.batchMembership.findMany({ where: { batchId: liveClass.batchId, status: 'ACTIVE', userId: { in: records.map((record: any) => String(record.userId)) } }, select: { userId: true } });
    const validIds = new Set(memberships.map((membership: any) => membership.userId));
    const normalized = records.filter((record: any) => validIds.has(String(record.userId)) && attendanceStatuses.includes(record.status));
    if (normalized.length !== records.length) return next(new AppError('Attendance includes an invalid student or status.', 400));
    await prisma.$transaction(normalized.map((record: any) => prisma.liveClassAttendance.upsert({
      where: { sessionId_studentId: { sessionId: liveClass.id, studentId: String(record.userId) } },
      create: { sessionId: liveClass.id, studentId: String(record.userId), status: record.status, markedById: req.user!.id },
      update: { status: record.status, markedById: req.user!.id, markedAt: new Date() }
    })));
    return res.json({ success: true, saved: normalized.length });
  } catch (error) { next(error); }
}
