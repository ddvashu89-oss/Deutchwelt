import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { driveFileUrl, isGoogleDriveConfigured, trashDriveFile, uploadDriveFile } from './googleDrive.js';

export type StoredUpload = {
  fileUrl: string;
  driveFileId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export async function discardTemporaryUpload(file: Express.Multer.File | undefined) {
  if (file?.path) await fs.unlink(file.path).catch(() => undefined);
}

function localUploadUrl(file: Express.Multer.File) {
  const relative = path.relative(env.UPLOAD_DIR, file.path).split(path.sep).join('/');
  return `/uploads/${relative}`;
}

export async function persistUploadedFile(file: Express.Multer.File): Promise<StoredUpload> {
  if (!isGoogleDriveConfigured()) {
    return {
      fileUrl: localUploadUrl(file),
      driveFileId: null,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    };
  }

  try {
    const driveFile = await uploadDriveFile(file.path, file.originalname, file.mimetype);
    return {
      fileUrl: driveFileUrl(driveFile.driveFileId),
      driveFileId: driveFile.driveFileId,
      fileName: driveFile.fileName,
      mimeType: driveFile.mimeType,
      sizeBytes: driveFile.sizeBytes
    };
  } finally {
    await discardTemporaryUpload(file);
  }
}

export async function removeStoredFile(fileUrl: string | null | undefined) {
  if (!fileUrl) return;
  const driveMatch = fileUrl.match(/^\/api\/v1\/files\/([a-zA-Z0-9_-]+)$/);
  if (driveMatch) {
    await trashDriveFile(driveMatch[1]);
    return;
  }

  if (!fileUrl.startsWith('/uploads/')) return;
  const filePath = path.resolve(env.UPLOAD_DIR, fileUrl.slice('/uploads/'.length));
  const root = path.resolve(env.UPLOAD_DIR) + path.sep;
  if (!filePath.startsWith(root)) return;
  await fs.unlink(filePath).catch(() => undefined);
}
