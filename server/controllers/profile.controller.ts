import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        let masterProfile = await prisma.masterProfile.findUnique({
            where: { userId }
        });

        if (!masterProfile) {
            // Return empty/initial structure if not found
            return res.json({ profile: null });
        }

        res.json({ profile: masterProfile.data });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { profile } = req.body;

        const masterProfile = await prisma.masterProfile.upsert({
            where: { userId },
            update: { data: profile },
            create: {
                userId,
                data: profile
            }
        });

        res.json({ success: true, profile: masterProfile.data });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
