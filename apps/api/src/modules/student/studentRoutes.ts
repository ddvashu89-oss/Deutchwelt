import { Router } from 'express';
import { getStudentDashboard, getStudentNotifications, markNotificationRead, updateProfile } from './studentController.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { updateProfileSchema } from '@deutschwelt/shared';

const router = Router();

router.get('/dashboard', requireAuth, getStudentDashboard);
router.get('/notifications', requireAuth, getStudentNotifications);
router.patch('/notifications/:notificationId/read', requireAuth, markNotificationRead);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), updateProfile);

export default router;
