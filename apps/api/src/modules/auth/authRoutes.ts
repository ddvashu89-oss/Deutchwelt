import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail } from './authController.js';
import { validateBody } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, emailVerificationSchema } from '@deutschwelt/shared';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/verify-email', authRateLimiter, validateBody(emailVerificationSchema), verifyEmail);
router.post('/resend-verification', requireAuth, authRateLimiter, resendVerificationEmail);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', getMe);
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;
