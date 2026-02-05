import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.ts';
import { analyzeAndTailor, parseProfileFromText } from '../services/ai.service.ts';

/**
 * Generate a tailored CV using AI
 * POST /api/cv/generate
 */
export const generateCV = async (req: Request, res: Response) => {
    try {
        const { profile, jobDescription, options } = req.body;
        const userId = (req as any).user?.userId;

        // Validate required inputs
        if (!profile || !jobDescription) {
            return res.status(400).json({
                error: 'Missing required fields: profile and jobDescription'
            });
        }

        if (!jobDescription.trim()) {
            return res.status(400).json({
                error: 'Job description cannot be empty'
            });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'AI service not configured. Please contact support.'
            });
        }

        // Call AI service for analysis
        const result = await analyzeAndTailor(profile, jobDescription, {
            mode: options?.mode || 'creative',
            customInstructions: options?.customInstructions,
            templateStyle: options?.templateStyle || 'harvard'
        });

        // Increment usage count after successful generation
        await prisma.user.update({
            where: { id: userId },
            data: { usageCount: { increment: 1 } }
        });

        // Prevent any caching of AI responses
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        // Return the analysis result
        res.json({
            tailoredProfile: result.tailoredProfile,
            layoutStrategy: result.layoutStrategy,
            matchScore: result.matchScore,
            suggestions: result.suggestions,
            originalDescription: jobDescription,
            jobTitle: result.jobTitle || '',
            companyName: result.companyName || ''
        });

    } catch (error: any) {
        console.error('CV Generation Error:', error);

        // Return user-friendly error messages
        if (error.message?.includes('quota')) {
            return res.status(503).json({
                error: 'AI service temporarily unavailable. Please try again later.'
            });
        }

        if (error.message?.includes('API key')) {
            return res.status(500).json({
                error: 'AI service configuration error. Please contact support.'
            });
        }

        res.status(500).json({
            error: error.message || 'CV generation failed. Please try again.'
        });
    }
};

/**
 * Parse a CV/Resume from raw text (PDF/LinkedIn import)
 * POST /api/cv/parse
 */
export const parseCV = async (req: Request, res: Response) => {
    try {
        const { rawText } = req.body;

        if (!rawText || !rawText.trim()) {
            return res.status(400).json({
                error: 'No text content provided for parsing'
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'AI service not configured. Please contact support.'
            });
        }

        const parsedProfile = await parseProfileFromText(rawText);

        res.json({ profile: parsedProfile });

    } catch (error: any) {
        console.error('CV Parsing Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to parse CV content'
        });
    }
};

/**
 * Get all applications for the authenticated user
 * GET /api/cv/applications
 */
export const getApplications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        const applications = await prisma.application.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Transform to frontend format
        const formattedApplications = applications.map(app => ({
            id: app.id,
            jobTitle: app.jobTitle,
            companyName: app.company,
            dateApplied: app.createdAt.toISOString(),
            lastUpdated: app.updatedAt.toISOString(),
            status: app.status.toLowerCase(),
            jobDescription: app.originalDescription,
            tailoredProfile: app.tailoredResume,
            matchScore: app.matchScore
        }));

        res.json({ applications: formattedApplications });
    } catch (error: any) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};

/**
 * Create a new application record
 * POST /api/cv/applications
 */
export const createApplication = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { jobTitle, companyName, jobDescription, tailoredProfile, matchScore } = req.body;

        if (!jobTitle || !companyName) {
            return res.status(400).json({
                error: 'Job title and company name are required'
            });
        }

        const application = await prisma.application.create({
            data: {
                userId,
                jobTitle,
                company: companyName,
                originalDescription: jobDescription || '',
                tailoredResume: tailoredProfile || {},
                matchScore: matchScore || 0,
                status: 'APPLIED'
            }
        });

        res.status(201).json({
            application: {
                id: application.id,
                createdAt: application.createdAt.toISOString()
            }
        });
    } catch (error: any) {
        console.error('Create Application Error:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
};

/**
 * Update application status
 * PATCH /api/cv/applications/:id
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'ACCEPTED', 'ARCHIVED'];
        if (!validStatuses.includes(status?.toUpperCase())) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const appId = id as string;
        const application = await prisma.application.updateMany({
            where: { id: appId, userId: userId as string },
            data: { status: status.toUpperCase() }
        });

        if (application.count === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Update Application Status Error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
};

/**
 * Delete an application
 * DELETE /api/cv/applications/:id
 */
export const deleteApplication = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { id } = req.params;

        const appId = id as string;
        const result = await prisma.application.deleteMany({
            where: { id: appId, userId: userId as string }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete Application Error:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
};

/**
 * Generate a cover letter using AI
 * POST /api/cv/cover-letter
 */
export const generateCoverLetter = async (req: Request, res: Response) => {
    try {
        const { profile, jobDescription, options, applicationId } = req.body;
        const userId = (req as any).user?.userId;

        if (!profile || !jobDescription) {
            return res.status(400).json({ error: 'Profile and job description are required' });
        }

        // Check if application already has a cover letter
        if (applicationId && userId) {
            const existingApp = await prisma.application.findFirst({
                where: { id: applicationId, userId }
            });

            if (existingApp?.coverLetter) {
                return res.json({ coverLetter: existingApp.coverLetter, fromCache: true });
            }
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'AI service not configured' });
        }

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const toneInstructions = {
            professional: 'Write in a formal, polished tone suitable for corporate environments.',
            enthusiastic: 'Write with energy and genuine excitement about the opportunity.',
            confident: 'Write with a strong, assertive tone that highlights achievements.'
        };

        const tone = options?.tone || 'professional';
        const companyName = options?.companyName || '[Company]';
        const jobTitle = options?.jobTitle || 'the position';

        const prompt = `Generate a professional cover letter for the following candidate applying to ${companyName} for ${jobTitle}.

CANDIDATE PROFILE:
Name: ${profile.personal?.fullName || 'Candidate'}
Current Title: ${profile.personal?.title || ''}
Summary: ${profile.personal?.summary || ''}
Key Skills: ${profile.skills?.slice(0, 10).join(', ') || 'Not specified'}
Recent Experience: ${profile.experience?.[0]?.role || ''} at ${profile.experience?.[0]?.company || ''}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

TONE: ${toneInstructions[tone as keyof typeof toneInstructions]}

Write a compelling cover letter that:
1. Opens with a strong hook that shows genuine interest
2. Highlights 2-3 relevant achievements that match the job requirements
3. Shows knowledge of the company and role
4. Closes with a clear call to action
5. Is approximately 300-400 words
6. Does NOT include any salutation or signature placeholders like [Your Name]

Return ONLY the cover letter text, no additional formatting or labels.`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are an expert cover letter writer with years of HR experience.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const coverLetter = completion.choices[0]?.message?.content?.trim();

        if (!coverLetter) {
            throw new Error('No cover letter generated');
        }

        // Save to application if ID provided
        if (applicationId && userId) {
            await prisma.application.updateMany({
                where: { id: applicationId, userId },
                data: { coverLetter }
            });
        }

        // Increment usage
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { usageCount: { increment: 1 } }
            });
        }

        res.json({ coverLetter });

    } catch (error: any) {
        console.error('Cover Letter Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
    }
};

/**
 * Generate interview prep questions using AI
 * POST /api/cv/interview-prep
 */
export const generateInterviewPrep = async (req: Request, res: Response) => {
    try {
        const { profile, jobDescription, questionType, applicationId } = req.body;
        const userId = (req as any).user?.userId;

        // Check if application already has interview questions
        if (applicationId && userId) {
            const existingApp = await prisma.application.findFirst({
                where: { id: applicationId, userId }
            });

            if (existingApp?.interviewQuestions) {
                const cachedQuestions = existingApp.interviewQuestions as any[];
                if (cachedQuestions && cachedQuestions.length > 0) {
                    return res.json({ questions: cachedQuestions, fromCache: true });
                }
            }
        }

        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'AI service not configured' });
        }

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const typeFilter = questionType === 'all' ? 'behavioral, technical, and situational' : questionType;

        const prompt = `Based on the job description and candidate profile below, generate 8-10 likely interview questions.

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

CANDIDATE PROFILE:
Name: ${profile?.personal?.fullName || 'Candidate'}
Skills: ${profile?.skills?.slice(0, 10).join(', ') || 'Not specified'}
Recent Role: ${profile?.experience?.[0]?.role || 'Not specified'}

Generate ${typeFilter} questions that interviewers would likely ask.

Return a JSON object with a "questions" key containing an array of objects.
Example Format:
{
  "questions": [
    {
      "question": "The interview question",
      "type": "behavioral",
      "tip": "A brief tip on how to answer this question well"
    }
  ]
}

Focus on questions relevant to the specific job requirements.`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are an expert career coach and interview preparation specialist. You MUST return valid JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000
        });

        let questions = [];
        try {
            const content = completion.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(content);

            // Handle various likely response shapes
            if (Array.isArray(parsed)) {
                questions = parsed;
            } else if (Array.isArray(parsed.questions)) {
                questions = parsed.questions;
            } else if (Array.isArray(parsed.data)) {
                questions = parsed.data;
            } else {
                console.warn('Unexpected AI response format for interview prep:', parsed);
                // Try to find any array in the object values
                const firstArray = Object.values(parsed).find(val => Array.isArray(val));
                if (firstArray) {
                    questions = firstArray as any[];
                }
            }
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            throw new Error('Failed to parse AI response');
        }

        // Save to application if ID provided
        if (applicationId && userId) {
            await prisma.application.updateMany({
                where: { id: applicationId, userId },
                data: { interviewQuestions: questions as any }
            });
        }

        // Increment usage
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { usageCount: { increment: 1 } }
            });
        }

        res.json({ questions });

    } catch (error: any) {
        console.error('Interview Prep Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate questions' });
    }
};
