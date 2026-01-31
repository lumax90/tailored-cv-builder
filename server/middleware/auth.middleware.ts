import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface JwtPayload {
    userId: string;
    email: string;
    tier: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Check cookie first (preferred), then Authorization header
    const token = req.cookies?.auth_token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
