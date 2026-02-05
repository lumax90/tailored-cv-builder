import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_STORE_SUBDOMAIN = process.env.LEMONSQUEEZY_STORE_SUBDOMAIN || 'tailoredairesume';
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

// Variant IDs - Replace with your actual LemonSqueezy Product Variant IDs
const VARIANT_IDS: Record<string, string> = {
    'LEMON_STARTER_MONTHLY': process.env.LEMON_STARTER_MONTHLY || '',
    'LEMON_STARTER_ANNUAL': process.env.LEMON_STARTER_ANNUAL || '',
    'LEMON_PRO_MONTHLY': process.env.LEMON_PRO_MONTHLY || '',
    'LEMON_PRO_ANNUAL': process.env.LEMON_PRO_ANNUAL || '',
    'LEMON_UNLIMITED_MONTHLY': process.env.LEMON_UNLIMITED_MONTHLY || '',
    'LEMON_UNLIMITED_ANNUAL': process.env.LEMON_UNLIMITED_ANNUAL || ''
};

/**
 * Create a LemonSqueezy checkout session
 * POST /api/lemonsqueezy/checkout
 */
export const createCheckout = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { variantId, tier, billingCycle } = req.body;

        if (!LEMONSQUEEZY_API_KEY) {
            return res.status(500).json({ error: 'Payment provider not configured' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the actual variant ID from env
        const actualVariantId = VARIANT_IDS[variantId];
        console.log(`🍋 LemonSqueezy Checkout Request:`, { variantId, actualVariantId, tier, billingCycle });

        if (!actualVariantId) {
            console.error('❌ Invalid variant - available:', Object.keys(VARIANT_IDS));
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?success=true&tier=${tier}`;

        // Create checkout via LemonSqueezy API with minimal required fields
        const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        custom_price: null,
                        product_options: {
                            enabled_variants: [parseInt(actualVariantId)],
                            redirect_url: successUrl
                        },
                        checkout_data: {
                            email: user.email,
                            custom: {
                                user_id: userId,
                                tier: tier,
                                billing_cycle: billingCycle
                            }
                        }
                    },
                    relationships: {
                        store: {
                            data: {
                                type: 'stores',
                                id: LEMONSQUEEZY_STORE_ID
                            }
                        },
                        variant: {
                            data: {
                                type: 'variants',
                                id: actualVariantId
                            }
                        }
                    }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('LemonSqueezy Checkout Error:', JSON.stringify(data, null, 2));
            throw new Error('Failed to create checkout session');
        }

        const checkoutUrl = data.data.attributes.url;
        console.log(`✅ Checkout URL created: ${checkoutUrl}`);

        res.json({ url: checkoutUrl });

    } catch (error: any) {
        console.error('LemonSqueezy Error:', error);
        res.status(500).json({ error: error.message || 'Checkout creation failed' });
    }
};

/**
 * Get customer portal URL
 * POST /api/lemonsqueezy/portal
 */
export const getCustomerPortal = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.lemonCustomerId) {
            return res.status(404).json({ error: 'No subscription found' });
        }

        // Get customer portal URL
        const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${user.lemonCustomerId}`, {
            headers: {
                'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
                'Accept': 'application/vnd.api+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get customer data');
        }

        const data = await response.json();
        const portalUrl = data.data.attributes.urls.customer_portal;

        res.json({ url: portalUrl });

    } catch (error: any) {
        console.error('Portal Error:', error);
        res.status(500).json({ error: error.message || 'Failed to open portal' });
    }
};

/**
 * Handle LemonSqueezy webhooks
 * POST /api/lemonsqueezy/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-signature'] as string;
        const rawBody = JSON.stringify(req.body);

        // Verify webhook signature using timing-safe comparison
        if (LEMONSQUEEZY_WEBHOOK_SECRET) {
            const crypto = await import('crypto');
            const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
            hmac.update(rawBody);
            const digest = hmac.digest('hex');

            // Use timing-safe comparison to prevent timing attacks
            const digestBuffer = Buffer.from(digest, 'hex');
            const signatureBuffer = Buffer.from(signature || '', 'hex');
            
            if (digestBuffer.length !== signatureBuffer.length || 
                !crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
                console.error('Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        const event = req.body;
        const eventName = event.meta.event_name;
        const customData = event.meta.custom_data || {};
        const userId = customData.user_id;
        const tier = customData.tier;

        console.log(`LemonSqueezy Webhook: ${eventName}`, { userId, tier });

        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated':
                if (userId && tier) {
                    const subscriptionId = event.data.id;
                    const customerId = event.data.attributes.customer_id;

                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionTier: tier,
                            lemonCustomerId: String(customerId),
                            lemonSubscriptionId: String(subscriptionId),
                            usageCount: 0 // Reset usage on new subscription
                        }
                    });
                    console.log(`Updated user ${userId} to tier ${tier}`);
                }
                break;

            case 'subscription_cancelled':
            case 'subscription_expired':
                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionTier: 'FREE',
                            lemonSubscriptionId: null
                        }
                    });
                    console.log(`Cancelled subscription for user ${userId}`);
                }
                break;

            case 'subscription_payment_success':
                if (userId) {
                    // Reset usage count on successful payment (new billing period)
                    await prisma.user.update({
                        where: { id: userId },
                        data: { usageCount: 0 }
                    });
                }
                break;

            default:
                console.log(`Unhandled event: ${eventName}`);
        }

        res.json({ received: true });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
};
