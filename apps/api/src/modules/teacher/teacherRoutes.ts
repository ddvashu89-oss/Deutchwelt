import { Router } from 'express';
import {
  getTeacherDashboard,
  getTeacherBatches,
  getTeacherStudents,
  getTeacherSubmissions,
  createAssignment,
  gradeWritingSubmission,
  gradeSpeakingAttempt,
  getTeacherLectures,
  createTeacherLecture,
  deleteTeacherLecture,
  getTeacherMaterials,
  createTeacherMaterial,
  deleteTeacherMaterial,
  getTeacherAnnouncements,
  createBatchAnnouncement,
  enrollStudentInBatch
} from './teacherController.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@deutschwelt/shared';

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.TEACHER, UserRole.ADMIN));

// Teacher Dashboard, Batches & Students
router.get('/dashboard', getTeacherDashboard);
router.get('/batches', getTeacherBatches);
router.post('/batches/:batchId/enroll', enrollStudentInBatch);
router.get('/students', getTeacherStudents);

// Submissions Review & Grading
router.get('/submissions', getTeacherSubmissions);
router.post('/assignments', createAssignment);
router.post('/submissions/:submissionId/grade', gradeWritingSubmission);
router.post('/speaking/:attemptId/grade', gradeSpeakingAttempt);

// Lectures & Live Sessions
router.get('/lectures', getTeacherLectures);
router.post('/lectures', createTeacherLecture);
router.delete('/lectures/:lectureId', deleteTeacherLecture);

// Study Materials & Worksheets
router.get('/materials', getTeacherMaterials);
router.post('/materials', createTeacherMaterial);
router.delete('/materials/:materialId', deleteTeacherMaterial);

// Noticeboard Announcements
router.get('/announcements', getTeacherAnnouncements);
router.post('/announcements', createBatchAnnouncement);

export default router;
