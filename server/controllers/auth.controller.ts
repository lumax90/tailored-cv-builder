import type { Request, Response } from 'express';
import { SubscriptionTier } from '@prisma/client';
import { prisma } from '../lib/prisma.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/email.service.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to sanitize user return
const sanitizeUser = (user: any) => {
    const { passwordHash, verificationToken, ...rest } = user;
    return rest;
};

// Verify Cloudflare Turnstile token
const verifyTurnstile = async (token: string): Promise<boolean> => {
    if (!TURNSTILE_SECRET) {
        console.warn('Turnstile not configured, skipping verification');
        return true; // Skip in dev
    }

    console.log('🔐 Verifying Turnstile token:', token?.substring(0, 20) + '...');

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${TURNSTILE_SECRET}&response=${token}`
        });
        const data = await response.json();

        console.log('📊 Turnstile response:', JSON.stringify(data, null, 2));

        if (!data.success) {
            console.error('❌ Turnstile verification failed:', data['error-codes']);
        }

        return data.success === true;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
};

// Generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const register = async (req: Request, res: Response) => {
    const { email, password, fullName, turnstileToken } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    // Verify Turnstile (bot protection)
    if (TURNSTILE_SECRET && turnstileToken) {
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return res.status(400).json({ error: 'Bot verification failed. Please try again.' });
        }
    }

    try {
        // Check existing
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashed,
                fullName,
                subscriptionTier: SubscriptionTier.FREE,
                emailVerified: false,
                verificationToken,
                verificationExpires,
                authProvider: 'email'
            }
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken, fullName);

        // Create Token (but user needs to verify email first)
        const token = jwt.sign(
            { userId: user.id, email: user.email, tier: user.subscriptionTier },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set Cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            user: sanitizeUser(user),
            message: 'Please check your email to verify your account'
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password, turnstileToken } = req.body;

    // Verify Turnstile (bot protection)
    if (TURNSTILE_SECRET && turnstileToken) {
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return res.status(400).json({ error: 'Bot verification failed. Please try again.' });
        }
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check email verification
        if (!user.emailVerified) {
            return res.status(403).json({
                error: 'Please verify your email before logging in',
                needsVerification: true
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, tier: user.subscriptionTier },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ user: sanitizeUser(user) });
    } catch (e) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ error: 'Verification token required' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification link' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationExpires: null
            }
        });

        // Auto-login after verification
        const jwtToken = jwt.sign(
            { userId: user.id, email: user.email, tier: user.subscriptionTier },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('auth_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Verification failed' });
    }
};

export const resendVerification = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If the email exists, a verification link has been sent' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken, verificationExpires }
        });

        await sendVerificationEmail(email, verificationToken, user.fullName || undefined);

        res.json({ message: 'Verification email sent' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
};

export const me = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: sanitizeUser(user) });
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out' });
};
