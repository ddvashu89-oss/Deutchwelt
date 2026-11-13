import { Router } from 'express';
import {
  getAdminAnalytics,
  getStudents,
  reviewStudentRegistration,
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
  getSystemLogs,
  getIpAccessLogs,
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
import {
  decideTeacherApplication,
  downloadTeacherApplicationDocument,
  getTeacherApplication,
  listTeacherApplications,
  resendTeacherInvitation,
  scheduleTeacherInterview,
  updateTeacherApplication
} from '../teacherApplications/teacherApplicationController.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN));

// Analytics
router.get('/analytics', getAdminAnalytics);

// Students CRUD
router.get('/students', getStudents);
router.post('/students/:studentId/registration-review', reviewStudentRegistration);
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
router.get('/teacher-applications', listTeacherApplications);
router.get('/teacher-applications/:applicationId/documents/:documentType/:index?', downloadTeacherApplicationDocument);
router.get('/teacher-applications/:applicationId', getTeacherApplication);
router.patch('/teacher-applications/:applicationId', updateTeacherApplication);
router.post('/teacher-applications/:applicationId/interview', scheduleTeacherInterview);
router.post('/teacher-applications/:applicationId/decision', decideTeacherApplication);
router.post('/teacher-applications/:applicationId/invite', resendTeacherInvitation);

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
router.get('/system-logs', getSystemLogs);
router.get('/ip-access-logs', getIpAccessLogs);
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
