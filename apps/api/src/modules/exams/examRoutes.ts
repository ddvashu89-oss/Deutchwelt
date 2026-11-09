import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  createTeacherExam,
  getExamAttempt,
  getStudentExams,
  getTeacherExamAttempts,
  getTeacherExams,
  gradeTeacherExamAttempt,
  saveExamAnswers,
  startExam,
  submitExam,
  updateTeacherExamStatus
} from './examController.js';

const router = Router();
router.use(requireAuth);

router.get('/', getStudentExams);
router.post('/:examId/start', startExam);
router.get('/attempts/:attemptId', getExamAttempt);
router.put('/attempts/:attemptId/answers', saveExamAnswers);
router.post('/attempts/:attemptId/submit', submitExam);

router.get('/teacher', getTeacherExams);
router.post('/teacher', createTeacherExam);
router.get('/teacher/:examId/attempts', getTeacherExamAttempts);
router.post('/teacher/attempts/:attemptId/grade', gradeTeacherExamAttempt);
router.patch('/teacher/:examId/status', updateTeacherExamStatus);

export default router;
