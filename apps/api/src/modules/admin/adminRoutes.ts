import { Router } from 'express';
import {
  getAdminAnalytics,
  getStudents,
  getTeachers,
  createTeacher,
  assignTeacherToBatch,
  unassignTeacherFromBatch,
  getAdminCourses,
  createCourse,
  getAdminEnquiries,
  updateEnquiryStatus,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSetting
} from './adminController.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@deutschwelt/shared';

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN));

router.get('/analytics', getAdminAnalytics);
router.get('/students', getStudents);
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.post('/teachers/:teacherId/batches', assignTeacherToBatch);
router.delete('/teachers/:teacherId/batches/:batchId', unassignTeacherFromBatch);
router.get('/courses', getAdminCourses);
router.post('/courses', createCourse);
router.get('/enquiries', getAdminEnquiries);
router.patch('/enquiries/:enquiryId', updateEnquiryStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getPlatformSettings);
router.patch('/settings/:key', updatePlatformSetting);

export default router;
