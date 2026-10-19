import { Router } from 'express';
import {
  getAdminAnalytics,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignTeacherToBatch,
  unassignTeacherFromBatch,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleUserActiveStatus,
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

// Analytics
router.get('/analytics', getAdminAnalytics);

// Students CRUD
router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:studentId', updateStudent);
router.delete('/students/:studentId', deleteStudent);

// Teachers CRUD & Batches
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.put('/teachers/:teacherId', updateTeacher);
router.delete('/teachers/:teacherId', deleteTeacher);
router.post('/teachers/:teacherId/batches', assignTeacherToBatch);
router.delete('/teachers/:teacherId/batches/:batchId', unassignTeacherFromBatch);

// Courses CRUD
router.get('/courses', getAdminCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Global User Controls
router.post('/users/:userId/toggle-status', toggleUserActiveStatus);

// Enquiries, Settings, Logs
router.get('/enquiries', getAdminEnquiries);
router.patch('/enquiries/:enquiryId', updateEnquiryStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getPlatformSettings);
router.patch('/settings/:key', updatePlatformSetting);

export default router;
