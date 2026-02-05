import type { Request, Response, NextFunction } from 'express';
import { PrismaClient, SubscriptionTier } from '@prisma/client';

import { prisma } from '../lib/prisma.ts';

// Define quotas for each tier
const TIER_LIMITS: Record<SubscriptionTier, number> = {
    [SubscriptionTier.FREE]: 0,        // No access - must upgrade
    [SubscriptionTier.STARTER]: 20,    // 15 + 5 bonus
    [SubscriptionTier.PRO]: 70,        // 50 + 20 bonus
    [SubscriptionTier.UNLIMITED]: 1000 // Soft cap (effectively unlimited)
};

export const checkUsageLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // User is attached to req by authMiddleware (which runs before this)
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if usage should be reset (monthly reset based on lastResetDate)
        const now = new Date();
        const lastReset = new Date(user.lastResetDate);
        const shouldReset = 
            now.getMonth() !== lastReset.getMonth() || 
            now.getFullYear() !== lastReset.getFullYear();

        let currentUsage = user.usageCount;

        if (shouldReset) {
            // Reset usage for the new month
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    usageCount: 0, 
                    lastResetDate: now 
                }
            });
            currentUsage = 0;
        }

        const limit = TIER_LIMITS[user.subscriptionTier];

        if (currentUsage >= limit) {
            return res.status(403).json({
                error: 'Monthly usage limit reached',
                tier: user.subscriptionTier,
                limit: limit,
                current: user.usageCount,
                upgradeUrl: '/settings/billing'
            });
        }

        // Attach user to req for next step if needed, or just proceed
        // Ideally, we increment usage AFTER successful generation, not here.
        // But checking here prevents wasted processing.
        next();
    } catch (error) {
        console.error('Usage Check Error:', error);
        res.status(500).json({ error: 'Failed to verify usage limits' });
    }
};
