import { Router } from 'express';
import { getEnvironmentStatus, resetSandboxData, toggleSandboxMode } from './systemController.js';

const router = Router();

router.get('/environment', getEnvironmentStatus);
router.post('/sandbox/reset', resetSandboxData);
router.post('/sandbox/toggle', toggleSandboxMode);

export default router;
