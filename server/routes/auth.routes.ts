import { Router } from 'express';
import { register, login, logout, me, verifyEmail, resendVerification } from '../controllers/auth.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
