import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

// Ensure upload directories exist
const uploadDir = env.UPLOAD_DIR;
const audioDir = path.join(uploadDir, 'audio');
const videoDir = path.join(uploadDir, 'videos');
const materialsDir = path.join(uploadDir, 'materials');
const certificatesDir = path.join(uploadDir, 'certificates');

[audioDir, videoDir, materialsDir, certificatesDir].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn(`[Upload Directory Warning] Could not create directory ${dir}:`, e);
  }
});

// Audio storage (Speaking lab & audio recordings)
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `speaking-${uniqueSuffix}${ext}`);
  }
});

const allowedAudioMimeTypes = [
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
  storage: audioStorage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (allowedAudioMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file format (${file.mimetype}). Only audio files (.webm, .ogg, .wav, .mp3) are permitted.`, 400));
    }
  }
});

// Video storage (Teacher recorded lectures & video lessons)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `video-${safeBase}-${uniqueSuffix}${ext}`);
  }
});

const allowedVideoMimeTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/mpeg',
  'video/3gpp'
];

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max video file
  },
  fileFilter: (req, file, cb) => {
    if (allowedVideoMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid video format (${file.mimetype}). Please upload an MP4, WebM, MOV, or MKV file.`, 400));
    }
  }
});

// Study Materials & Worksheets storage
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, materialsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc-${safeBase}-${uniqueSuffix}${ext}`);
  }
});

const allowedMaterialExtensions = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.rtf', '.csv', '.zip', '.jpg', '.jpeg', '.png', '.webp', '.mp3'
];

const disallowedMaterialExtensions = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.html', '.htm',
  '.js', '.mjs', '.vbs', '.py', '.rb', '.pl', '.cgi', '.jar', '.msi', '.svg'
];

export const uploadMaterial = multer({
  storage: materialStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max document
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (disallowedMaterialExtensions.includes(ext)) {
      return cb(new AppError(`File type blocked for security (${ext}). Executables and scripts are strictly prohibited.`, 400));
    }
    if (allowedMaterialExtensions.includes(ext)) {
      return cb(null, true);
    }
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('image/') ||
      file.mimetype.includes('officedocument') ||
      file.mimetype.includes('msword')
    ) {
      return cb(null, true);
    }
    cb(new AppError(`File format (${ext || file.mimetype}) is not permitted. Please upload a PDF, Word, PowerPoint, Excel, or Text document.`, 400));
  }
});
