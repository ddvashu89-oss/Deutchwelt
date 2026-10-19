import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

// Ensure upload directories exist
const uploadDir = env.UPLOAD_DIR;
const audioDir = path.join(uploadDir, 'audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `speaking-${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = [
  'audio/webm',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'video/webm' // Chrome MediaRecorder often labels webm audio as video/webm
];

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file format (${file.mimetype}). Only audio files (.webm, .ogg, .wav, .mp3) are permitted.`, 400));
    }
  }
});
