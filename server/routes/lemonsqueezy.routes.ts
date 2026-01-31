import { Router } from 'express';
import { createCheckout, getCustomerPortal, handleWebhook } from '../controllers/lemonsqueezy.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = Router();

// Protected routes (require authentication)
router.post('/checkout', authenticateToken, createCheckout);
router.post('/portal', authenticateToken, getCustomerPortal);

// Webhook (public, verified by signature)
router.post('/webhook', handleWebhook);

export default router;
