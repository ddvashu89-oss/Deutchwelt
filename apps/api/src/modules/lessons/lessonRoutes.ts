import { Router } from 'express';
import { getLessonById, markLessonComplete } from './lessonController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/:lessonId', getLessonById);
router.post('/:lessonId/complete', requireAuth, markLessonComplete);

export default router;
