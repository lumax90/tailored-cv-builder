import OpenAI from 'openai';
import type { CVProfile, LayoutStrategy } from '../../src/types';

// Type definitions for AI service
export interface JobAnalysisResult {
    tailoredProfile: CVProfile;
    layoutStrategy: LayoutStrategy;
    matchScore: number;
    suggestions: string[];
}

export interface AnalysisOptions {
    mode: 'strict' | 'creative';
    customInstructions?: string;
    templateStyle?: 'harvard' | 'modern' | 'creative' | 'minimal';
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert CV/Resume consultant and ATS optimization specialist. Your job is to analyze job descriptions and tailor candidate profiles to maximize their chances of getting an interview.

Your response MUST be valid JSON with this exact structure:
{
    "tailoredProfile": { /* CVProfile object with tailored content */ },
    "layoutStrategy": {
        "sectionOrder": ["experience", "education", "skills", ...],
        "hasIntro": true/false,
        "reasoning": "Brief explanation of why this layout works for this job"
    },
    "matchScore": 0-100,
    "suggestions": ["suggestion1", "suggestion2", ...]
}

IMPORTANT RULES:
1. NEVER fabricate experience or skills the candidate doesn't have
2. Reword existing experience to match job description keywords when truthful
3. Prioritize sections and experiences most relevant to the job
4. In "creative" mode, you can infer transferable skills; in "strict" mode, stick to facts
5. The summary should be tailored to this specific role
6. Match score should reflect how well the candidate fits the role (0-100)
7. Suggestions should be actionable advice for the candidate`;

export async function analyzeAndTailor(
    profile: CVProfile,
    jobDescription: string,
    options: AnalysisOptions = { mode: 'creative' }
): Promise<JobAnalysisResult> {
    const modeInstructions = options.mode === 'strict'
        ? 'STRICT MODE: Only use facts directly stated in the profile. No inference or embellishment.'
        : 'CREATIVE MODE: You may infer transferable skills and adapt tone, but never fabricate experience.';

    const customInstructions = options.customInstructions
        ? `\n\nADDITIONAL USER INSTRUCTIONS: ${options.customInstructions}`
        : '';

    const templateInstructions = options.templateStyle
        ? `\n\nTEMPLATE STYLE: User prefers "${options.templateStyle}" style. Adjust section order and content density accordingly.`
        : '';

    const userPrompt = `
${modeInstructions}${customInstructions}${templateInstructions}

=== CANDIDATE PROFILE ===
${JSON.stringify(profile, null, 2)}

=== JOB DESCRIPTION ===
${jobDescription}

Analyze the job description, identify key requirements, and tailor the candidate's profile to maximize their chances. Return ONLY valid JSON.`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: options.mode === 'strict' ? 0.3 : 0.7,
            max_tokens: 4000,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error('No response from OpenAI');
        }

        const result = JSON.parse(responseText) as JobAnalysisResult;

        // Validate and sanitize the response
        if (!result.tailoredProfile || !result.layoutStrategy) {
            throw new Error('Invalid response structure from AI');
        }

        // Ensure matchScore is within bounds
        result.matchScore = Math.max(0, Math.min(100, result.matchScore || 0));

        // Ensure suggestions is an array
        if (!Array.isArray(result.suggestions)) {
            result.suggestions = [];
        }

        // Ensure layoutStrategy has required fields
        if (!Array.isArray(result.layoutStrategy.sectionOrder)) {
            result.layoutStrategy.sectionOrder = ['experience', 'education', 'skills', 'projects'];
        }
        if (typeof result.layoutStrategy.hasIntro !== 'boolean') {
            result.layoutStrategy.hasIntro = true;
        }

        return result;
    } catch (error: any) {
        console.error('OpenAI API Error:', error);

        // Check for specific error types
        if (error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing.');
        }
        if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key configured on server.');
        }

        throw new Error(`AI analysis failed: ${error.message}`);
    }
}

// Parse profile from raw text (for PDF imports)
export async function parseProfileFromText(rawText: string): Promise<Partial<CVProfile>> {
    const parsePrompt = `Extract structured CV/Resume data from the following text. Return a JSON object matching this CVProfile structure:
{
    "personal": { "fullName": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "github": "", "summary": "" },
    "experience": [{ "id": "uuid", "company": "", "role": "", "location": "", "locationType": "", "startDate": "", "endDate": "", "current": false, "description": "", "technologies": [] }],
    "education": [{ "id": "uuid", "institution": "", "degree": "", "location": "", "startDate": "", "endDate": "", "current": false, "gpa": "", "description": "" }],
    "skills": ["skill1", "skill2"],
    "projects": [],
    "certifications": [],
    "languages": [],
    "volunteer": [],
    "awards": [],
    "publications": []
}

Generate unique IDs for array items. Extract as much information as possible.

TEXT TO PARSE:
${rawText}`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a CV/Resume parser. Extract structured data from text. Return ONLY valid JSON.' },
                { role: 'user', content: parsePrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 4000,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error('No response from OpenAI');
        }

        return JSON.parse(responseText);
    } catch (error: any) {
        console.error('Profile parsing error:', error);
        throw new Error(`Failed to parse profile: ${error.message}`);
    }
}
