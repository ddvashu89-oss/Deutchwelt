import { Router } from 'express';
import { submitEnquiry } from './enquiryController.js';
import { validateBody } from '../../middleware/validate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { contactEnquirySchema } from '@deutschwelt/shared';

const router = Router();

router.post('/', authRateLimiter, validateBody(contactEnquirySchema), submitEnquiry);

export default router;
