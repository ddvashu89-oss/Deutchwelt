import { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { UserRole } from '@deutschwelt/shared';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthenticatedUser } from '../../middleware/auth.js';
import { driveFileUrl, streamDriveFile } from '../../services/googleDrive.js';
import { isDatabaseConnected, prisma } from '../../services/prisma.js';
import { store } from '../../services/store.js';

type AuthorizedAsset = { fileName?: string; mimeType?: string };

function teacherProfileId(user: AuthenticatedUser) {
  return user.teacherProfile?.id || (user.id === 'user-teacher-1' ? 'profile-teacher-1' : user.id === 'user-teacher-2' ? 'profile-teacher-2' : `profile-${user.id}`);
}

async function isAuthorizedForSpeakingAttempt(user: AuthenticatedUser, attempt: any) {
  if (user.role === UserRole.ADMIN || attempt.userId === user.id) return true;
  if (user.role !== UserRole.TEACHER) return false;

  if (isDatabaseConnected) {
    const [memberships, assignments] = await Promise.all([
      prisma.batchMembership.findMany({ where: { userId: attempt.userId, status: 'ACTIVE' }, select: { batchId: true } }),
      prisma.teacherBatchAssignment.findMany({ where: { teacherId: teacherProfileId(user) }, select: { batchId: true } })
    ]);
    const teacherBatches = new Set(assignments.map((item: any) => item.batchId));
    return memberships.some((item: any) => teacherBatches.has(item.batchId));
  }

  const studentBatches = store.batchMemberships.filter(item => item.userId === attempt.userId).map(item => item.batchId);
  const teacherBatches = store.teacherBatchAssignments
    .filter(item => item.teacherId === teacherProfileId(user))
    .map(item => item.batchId);
  return studentBatches.some(batchId => teacherBatches.includes(batchId));
}

async function authorizeDriveAsset(req: Request, fileId: string): Promise<AuthorizedAsset | null> {
  const user = req.user!;
  const url = driveFileUrl(fileId);

  if (isDatabaseConnected) {
    const asset = await prisma.driveAsset.findUnique({ where: { driveFileId: fileId } });
    if (asset) {
      if (user.role === UserRole.ADMIN || asset.ownerId === user.id) {
        return { fileName: asset.fileName, mimeType: asset.mimeType };
      }

      if (user.role === UserRole.STUDENT) {
        const membership = await prisma.batchMembership.findFirst({
          where: { batchId: asset.batchId, userId: user.id, status: 'ACTIVE' },
          select: { id: true }
        });
        return membership ? { fileName: asset.fileName, mimeType: asset.mimeType } : null;
      }

      if (user.role === UserRole.TEACHER) {
        const assignment = await prisma.teacherBatchAssignment.findFirst({
          where: { teacherId: teacherProfileId(user), batchId: asset.batchId },
          select: { id: true }
        });
        return assignment ? { fileName: asset.fileName, mimeType: asset.mimeType } : null;
      }
      return null;
    }

    const attempt = await prisma.speakingAttempt.findFirst({ where: { audioUrl: url } });
    if (attempt && await isAuthorizedForSpeakingAttempt(user, attempt)) return { fileName: `speaking-${attempt.id}.webm` };
    return null;
  }

  const material = store.teacherMaterials.find(item => item.fileUrl === url);
  const lecture = store.teacherLectures.find(item => item.videoUrl === url);
  const resource = material || lecture;
  if (resource) {
    if (user.role === UserRole.ADMIN || resource.teacherId === teacherProfileId(user)) {
      return { fileName: material?.originalFilename || lecture?.originalFilename || resource.title, mimeType: material ? undefined : 'video/mp4' };
    }
    if (user.role === UserRole.STUDENT) {
      const hasBatchAccess = store.batchMemberships.some(item => item.userId === user.id && item.batchId === resource.batchId) ||
        (user.id === 'user-student-1' && resource.batchId === 'batch-1');
      return hasBatchAccess ? { fileName: material?.originalFilename || lecture?.originalFilename || resource.title } : null;
    }
    if (user.role === UserRole.TEACHER) {
      const assigned = store.teacherBatchAssignments.some(item => item.teacherId === teacherProfileId(user) && item.batchId === resource.batchId);
      return assigned ? { fileName: material?.originalFilename || lecture?.originalFilename || resource.title } : null;
    }
    return null;
  }

  const attempt = store.speakingAttempts.find(item => item.audioUrl === url);
  if (attempt && await isAuthorizedForSpeakingAttempt(user, attempt)) return { fileName: `speaking-${attempt.id}.webm` };
  return null;
}

export async function streamAuthorizedDriveFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));
    const { fileId } = req.params;
    if (!fileId || fileId.length > 200 || /[^a-zA-Z0-9_-]/.test(fileId)) {
      return next(new AppError('File not found.', 404));
    }

    const asset = await authorizeDriveAsset(req, fileId);
    if (!asset) return next(new AppError('File not found or you do not have permission to view it.', 404));

    const upstream = await streamDriveFile(fileId, req.headers.range);
    res.status(upstream.status);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', asset.mimeType || upstream.headers.get('content-type') || 'application/octet-stream');
    const filename = path.basename(asset.fileName || 'download').replace(/[\r\n"\\]/g, '_');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(filename)}`);
    for (const header of ['content-length', 'content-range', 'accept-ranges', 'etag']) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    if (!upstream.body) return res.end();
    await pipeline(Readable.fromWeb(upstream.body as any), res);
  } catch (error) {
    if (!res.headersSent) return next(error);
    res.destroy(error as Error);
  }
}
