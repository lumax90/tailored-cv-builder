import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.ts';
import { SubscriptionTier } from '@prisma/client';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Price ID to Subscription Tier mapping
const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
    [process.env.STRIPE_STARTER_PRICE_ID || '']: SubscriptionTier.STARTER,
    [process.env.STRIPE_PRO_PRICE_ID || '']: SubscriptionTier.PRO,
    [process.env.STRIPE_UNLIMITED_PRICE_ID || '']: SubscriptionTier.UNLIMITED
};

/**
 * Create a Stripe Checkout Session
 * POST /api/stripe/checkout
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { priceId, tier } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        // Get or create Stripe customer
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id }
            });
            customerId = customer.id;

            // Save customer ID
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/billing?success=true&tier=${tier}`,
            cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
            metadata: {
                userId: user.id,
                tier: tier
            },
            subscription_data: {
                metadata: {
                    userId: user.id
                }
            }
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Checkout Session Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
};

/**
 * Handle Stripe Webhooks
 * POST /api/stripe/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle specific event types
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCanceled(subscription);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

/**
 * Create Customer Portal Session
 * POST /api/stripe/portal
 */
export const createPortalSession = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user?.stripeCustomerId) {
            return res.status(400).json({ error: 'No billing account found. Please subscribe to a plan first.' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/billing`
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Portal Session Error:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
};

// ==========================================
// Webhook Event Handlers
// ==========================================

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string;

    if (!userId) {
        console.error('No userId in checkout session metadata');
        return;
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const tier = PRICE_TO_TIER[priceId] || SubscriptionTier.STARTER;

    // Update user's subscription
    await prisma.user.update({
        where: { id: userId },
        data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionTier: tier,
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
            usageCount: 0 // Reset usage on new subscription
        }
    });

    console.log(`User ${userId} upgraded to ${tier}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const priceId = subscription.items.data[0]?.price.id;
    const tier = PRICE_TO_TIER[priceId] || SubscriptionTier.STARTER;

    await prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionTier: tier,
            subscriptionEndDate: new Date(subscription.current_period_end * 1000)
        }
    });

    console.log(`User ${userId} subscription updated to ${tier}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Downgrade to FREE tier
    await prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionTier: SubscriptionTier.FREE,
            stripeSubscriptionId: null,
            subscriptionEndDate: null
        }
    });

    console.log(`User ${userId} subscription canceled, downgraded to FREE`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    // Find user by customer ID
    const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId }
    });

    if (user) {
        // Could send an email notification here
        console.log(`Payment failed for user ${user.id}`);
    }
}
