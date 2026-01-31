import { Router, raw } from 'express';
import { createCheckoutSession, handleWebhook, createPortalSession } from '../controllers/stripe.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = Router();

// Authenticated routes
router.post('/checkout', authenticateToken, createCheckoutSession);
router.post('/portal', authenticateToken, createPortalSession);

// Webhook route - needs raw body for signature verification
router.post('/webhook', raw({ type: 'application/json' }), handleWebhook);

export default router;
