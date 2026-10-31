import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { streamAuthorizedDriveFile } from './fileController.js';

const router = Router();

router.get('/:fileId', requireAuth, streamAuthorizedDriveFile);

export default router;
