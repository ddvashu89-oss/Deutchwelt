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
import { getPlacementTest, getPersonalLearningPlan, submitPlacementTest } from './placementController.js';
import { getNotificationPreferences, updateNotificationPreferences } from './notificationPreferenceController.js';
import { getRegistrationState, updateRegistrationOnboarding, requestRegistrationApproval } from './registrationController.js';
import { studentOnboardingSchema } from '@deutschwelt/shared';

const router = Router();

router.get('/registration', requireAuth, getRegistrationState);
router.patch('/registration', requireAuth, validateBody(studentOnboardingSchema), updateRegistrationOnboarding);
router.post('/registration/request-approval', requireAuth, requestRegistrationApproval);

router.get('/dashboard', requireAuth, getStudentDashboard);
router.get('/notifications', requireAuth, getStudentNotifications);
router.patch('/notifications/:notificationId/read', requireAuth, markNotificationRead);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), updateProfile);
router.get('/materials', requireAuth, getStudentBatchMaterials);
router.get('/lectures', requireAuth, getStudentBatchLectures);
router.get('/certificates', requireAuth, getStudentCertificates);
router.post('/courses/:courseId/claim-certificate', requireAuth, claimCourseCertificate);
router.get('/certificates/verify/:certificateNumber', verifyCertificate);
router.get('/placement-test', getPlacementTest);
router.post('/placement-test', requireAuth, submitPlacementTest);
router.get('/learning-plan', requireAuth, getPersonalLearningPlan);
router.get('/notification-preferences', requireAuth, getNotificationPreferences);
router.patch('/notification-preferences', requireAuth, updateNotificationPreferences);

export default router;
