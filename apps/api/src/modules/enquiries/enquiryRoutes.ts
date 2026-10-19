import { Router } from 'express';
import { submitEnquiry } from './enquiryController.js';
import { validateBody } from '../../middleware/validate.js';
import { contactEnquirySchema } from '@deutschwelt/shared';

const router = Router();

router.post('/', validateBody(contactEnquirySchema), submitEnquiry);

export default router;
