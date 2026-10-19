import { Router } from 'express';
import { getVocabulary, getCategories, getFlashcards, updateWordProgress } from './vocabularyController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getVocabulary);
router.get('/categories', getCategories);
router.get('/flashcards', getFlashcards);
router.post('/:wordId/progress', requireAuth, updateWordProgress);

export default router;
