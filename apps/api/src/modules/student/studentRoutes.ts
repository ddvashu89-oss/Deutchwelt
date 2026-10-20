import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentNotifications,
  markNotificationRead,
  updateProfile,
  getStudentBatchMaterials,
  getStudentBatchLectures,
  getStudentCertificates,
  claimCourseCertificate,
  verifyCertificate
} from './studentController.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { updateProfileSchema } from '@deutschwelt/shared';

const router = Router();

router.get('/dashboard', requireAuth, getStudentDashboard);
router.get('/notifications', requireAuth, getStudentNotifications);
router.patch('/notifications/:notificationId/read', requireAuth, markNotificationRead);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), updateProfile);
router.get('/materials', requireAuth, getStudentBatchMaterials);
router.get('/lectures', requireAuth, getStudentBatchLectures);
router.get('/certificates', requireAuth, getStudentCertificates);
router.post('/courses/:courseId/claim-certificate', requireAuth, claimCourseCertificate);
router.get('/certificates/verify/:certificateNumber', verifyCertificate);

export default router;
