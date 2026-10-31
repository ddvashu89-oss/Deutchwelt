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
  updatePlatformSetting,
  getAdminBatches,
  createAdminBatch,
  getAdminPayments,
  createAdminFeePlan,
  getAdminAttendance,
  getAdminAnnouncements,
  createAdminAnnouncement
} from './adminController.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@deutschwelt/shared';
import {
  connectGoogleDrive,
  getGoogleDrivePickerConfig,
  getGoogleDriveStatus,
  saveGoogleDriveFolder
} from './driveController.js';

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
router.get('/drive/connect', connectGoogleDrive);
router.get('/drive/status', getGoogleDriveStatus);
router.get('/drive/picker-config', getGoogleDrivePickerConfig);
router.post('/drive/folder', saveGoogleDriveFolder);

// Batches, Payments, Attendance & Announcements
router.get('/batches', getAdminBatches);
router.post('/batches', createAdminBatch);
router.get('/payments', getAdminPayments);
router.post('/fee-plans', createAdminFeePlan);
router.get('/attendance', getAdminAttendance);
router.get('/announcements', getAdminAnnouncements);
router.post('/announcements', createAdminAnnouncement);

export default router;
