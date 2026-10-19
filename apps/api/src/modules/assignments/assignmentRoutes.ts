import { Router } from 'express';
import { getAssignments, getAssignmentById, submitAssignment } from './assignmentController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getAssignments);
router.get('/:assignmentId', requireAuth, getAssignmentById);
router.post('/:assignmentId/submissions', requireAuth, submitAssignment);

export default router;
