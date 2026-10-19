import { Router } from 'express';
import { getLessonExercises, submitExerciseAttempt } from './exerciseController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/lesson/:lessonId', getLessonExercises);
router.post('/:exerciseId/attempts', requireAuth, submitExerciseAttempt);

export default router;
