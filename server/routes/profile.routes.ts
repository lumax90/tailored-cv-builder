import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = Router();

router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, updateProfile);

export default router;
