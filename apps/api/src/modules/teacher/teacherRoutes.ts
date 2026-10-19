import { Router } from 'express';
import {
  getTeacherDashboard,
  getTeacherBatches,
  getTeacherSubmissions,
  createAssignment,
  gradeWritingSubmission,
  gradeSpeakingAttempt
} from './teacherController.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@deutschwelt/shared';

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.TEACHER, UserRole.ADMIN));

router.get('/dashboard', getTeacherDashboard);
router.get('/batches', getTeacherBatches);
router.get('/submissions', getTeacherSubmissions);
router.post('/assignments', createAssignment);
router.post('/submissions/:submissionId/grade', gradeWritingSubmission);
router.post('/speaking/:attemptId/grade', gradeSpeakingAttempt);

export default router;
