import { Router } from 'express';
import { generateCV, parseCV, getApplications, deleteApplication, createApplication, updateApplicationStatus, generateCoverLetter, generateInterviewPrep } from '../controllers/cv.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';
import { checkUsageLimit } from '../middleware/usage.middleware.ts';

const router = Router();

// Protected Routes
router.post('/generate', authenticateToken, checkUsageLimit, generateCV);
router.post('/parse', authenticateToken, checkUsageLimit, parseCV);
router.post('/cover-letter', authenticateToken, checkUsageLimit, generateCoverLetter);
router.post('/interview-prep', authenticateToken, checkUsageLimit, generateInterviewPrep);
router.get('/applications', authenticateToken, getApplications);
router.post('/applications', authenticateToken, createApplication);
router.patch('/applications/:id', authenticateToken, updateApplicationStatus);
router.delete('/applications/:id', authenticateToken, deleteApplication);

export default router;
