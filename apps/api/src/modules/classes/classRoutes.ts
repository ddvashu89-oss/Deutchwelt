import { Router } from 'express';
import { UserRole } from '@deutschwelt/shared';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { createLiveClass, getClassRoster, getStudentSchedule, getTeacherClasses, saveClassAttendance, studentCheckIn } from './classController.js';

export const studentClassRoutes = Router();
studentClassRoutes.get('/schedule', requireAuth, getStudentSchedule);
studentClassRoutes.post('/live-classes/:classId/check-in', requireAuth, authRateLimiter, studentCheckIn);

export const teacherClassRoutes = Router();
teacherClassRoutes.use(requireAuth, requireRole(UserRole.TEACHER, UserRole.ADMIN));
teacherClassRoutes.get('/live-classes', getTeacherClasses);
teacherClassRoutes.post('/live-classes', createLiveClass);
teacherClassRoutes.get('/live-classes/:classId/attendance', getClassRoster);
teacherClassRoutes.put('/live-classes/:classId/attendance', saveClassAttendance);
