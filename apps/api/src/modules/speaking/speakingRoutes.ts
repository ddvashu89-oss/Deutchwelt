import { Router } from 'express';
import {
  getSpeakingPrompts,
  getSpeakingPromptById,
  submitSpeakingAttempt,
  getUserSpeakingAttempts,
  analyzeSpeakingAudio
} from './speakingController.js';
import { requireAuth } from '../../middleware/auth.js';
import { uploadAudio } from '../../middleware/upload.js';

const router = Router();

router.get('/prompts', getSpeakingPrompts);
router.get('/prompts/:promptId', getSpeakingPromptById);
router.post('/prompts/:promptId/attempts', requireAuth, uploadAudio.single('audio'), submitSpeakingAttempt);
router.post('/analyze', requireAuth, uploadAudio.single('audio'), analyzeSpeakingAudio);
router.get('/my-attempts', requireAuth, getUserSpeakingAttempts);

export default router;
