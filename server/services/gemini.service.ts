import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CVProfile, LayoutStrategy } from '../../src/types';

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

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function analyzeAndTailorWithGemini(
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
${SYSTEM_PROMPT}

${modeInstructions}${customInstructions}${templateInstructions}

=== CANDIDATE PROFILE ===
${JSON.stringify(profile, null, 2)}

=== JOB DESCRIPTION ===
${jobDescription}

Analyze the job description, identify key requirements, and tailor the candidate's profile to maximize their chances. Return ONLY valid JSON.`;

    try {
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: options.mode === 'strict' ? 0.3 : 0.7,
            }
        });

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();

        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        const parsed = JSON.parse(responseText) as JobAnalysisResult;

        // Validate and sanitize
        if (!parsed.tailoredProfile || !parsed.layoutStrategy) {
            throw new Error('Invalid response structure from AI');
        }

        parsed.matchScore = Math.max(0, Math.min(100, parsed.matchScore || 0));
        if (!Array.isArray(parsed.suggestions)) {
            parsed.suggestions = [];
        }

        return parsed;
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw new Error(`Gemini analysis failed: ${error.message}`);
    }
}

export async function parseProfileFromTextWithGemini(rawText: string): Promise<Partial<CVProfile>> {
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
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
            }
        });

        const result = await model.generateContent(parsePrompt);
        const responseText = result.response.text();

        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        return JSON.parse(responseText);
    } catch (error: any) {
        console.error('Gemini parsing error:', error);
        throw new Error(`Failed to parse profile with Gemini: ${error.message}`);
    }
}
