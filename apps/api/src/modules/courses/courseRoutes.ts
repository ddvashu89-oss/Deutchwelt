import { Router } from 'express';
import { getAllCourses, getCourseBySlug, enrollInCourse } from './courseController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getAllCourses);
router.get('/:slug', getCourseBySlug);
router.post('/:courseId/enroll', requireAuth, enrollInCourse);

export default router;
