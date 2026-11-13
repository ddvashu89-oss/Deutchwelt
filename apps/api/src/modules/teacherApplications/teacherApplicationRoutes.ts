import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { uploadApplicationDocuments } from '../../middleware/upload.js';
import { submitTeacherApplication } from './teacherApplicationController.js';

const router = Router();

router.post('/', authRateLimiter, uploadApplicationDocuments, submitTeacherApplication);

export default router;
