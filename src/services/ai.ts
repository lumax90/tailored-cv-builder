import type { CVProfile, JobAnalysis, AnalysisOptions } from '../types';

// API Configuration - All AI calls now go through the backend
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Analyze a job description and tailor the CV profile
 * AI processing happens server-side (OpenAI or Gemini based on server config)
 */
export const analyzeJobMatch = async (
    profile: CVProfile,
    jobDescription: string,
    options: AnalysisOptions & { templateStyle?: string } = { mode: 'creative' }
): Promise<JobAnalysis> => {
    const res = await fetch(`${API_BASE_URL}/cv/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include auth cookies
        body: JSON.stringify({
            profile,
            jobDescription,
            options: {
                mode: options.mode,
                customInstructions: options.customInstructions,
                templateStyle: options.templateStyle || 'harvard'
            }
        })
    });

    if (!res.ok) {
        const err = await res.json();

        // Handle specific error cases
        if (res.status === 403 && err.error?.includes('limit')) {
            throw new Error(`Usage limit reached. Please upgrade your plan.`);
        }
        if (res.status === 401) {
            throw new Error('Please log in to use this feature.');
        }

        throw new Error(err.error || 'Failed to generate CV');
    }

    const data = await res.json();

    // Return in JobAnalysis format expected by frontend
    return {
        originalDescription: data.originalDescription || jobDescription,
        tailoredProfile: data.tailoredProfile,
        suggestions: data.suggestions || [],
        layoutStrategy: data.layoutStrategy,
        matchScore: data.matchScore
    };
};

/**
 * Parse raw text (from PDF) into a structured profile
 * This is now handled server-side
 */
export const parseProfileFromText = async (rawText: string): Promise<Partial<CVProfile>> => {
    const res = await fetch(`${API_BASE_URL}/cv/parse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rawText })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse profile');
    }

    const data = await res.json();
    return data.profile;
};
