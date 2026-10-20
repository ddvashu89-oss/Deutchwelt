import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

import authRoutes from './modules/auth/authRoutes.js';
import courseRoutes from './modules/courses/courseRoutes.js';
import lessonRoutes from './modules/lessons/lessonRoutes.js';
import exerciseRoutes from './modules/exercises/exerciseRoutes.js';
import vocabularyRoutes from './modules/vocabulary/vocabularyRoutes.js';
import speakingRoutes from './modules/speaking/speakingRoutes.js';
import assignmentRoutes from './modules/assignments/assignmentRoutes.js';
import studentRoutes from './modules/student/studentRoutes.js';
import teacherRoutes from './modules/teacher/teacherRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';
import enquiryRoutes from './modules/enquiries/enquiryRoutes.js';

const app = express();

// Security Headers Hardening
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  xContentTypeOptions: true,
  xFrameOptions: { action: 'deny' },
  xXssProtection: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true } : false
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === env.FRONTEND_URL ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsers
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging
if (!env.isTest) {
  app.use(morgan('dev'));
}

// Static Uploads Serving with Security Controls
app.use('/uploads', express.static(env.UPLOAD_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (filePath.endsWith('.html') || filePath.endsWith('.htm') || filePath.endsWith('.svg') || filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

// Session Authentication
app.use(authenticate);

// API Rate Limiting
app.use('/api/', apiRateLimiter);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DeutschWelt API',
    version: '1.0.0',
    environment: env.NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/vocabulary', vocabularyRoutes);
app.use('/api/v1/speaking', speakingRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/enquiries', enquiryRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
