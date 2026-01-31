import 'dotenv/config'; // Must be first!
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Headers (Production)
if (isProduction) {
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    });
}

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000' // For production where frontend is served from same origin
].filter(Boolean);

app.use(cors({
    origin: isProduction ? allowedOrigins : true,
    credentials: true
}));

// Body Parsing
app.use(express.json({ limit: '5mb' })); // Allow larger payloads for PDF imports
app.use(cookieParser());

// Request Logging (Development)
if (!isProduction) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
import authRoutes from './routes/auth.routes.ts';
import cvRoutes from './routes/cv.routes.ts';
import profileRoutes from './routes/profile.routes.ts';
import lemonSqueezyRoutes from './routes/lemonsqueezy.routes.ts';

app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/lemonsqueezy', lemonSqueezyRoutes);

// Serve Static Frontend (Production)
if (isProduction) {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: isProduction ? 'Internal server error' : err.message
    });
});

export { app };

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
