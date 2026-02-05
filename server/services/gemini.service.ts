import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import type { CVProfile, LayoutStrategy } from '../../src/types';

// Helper to generate unique IDs for array items
const generateId = (): string => crypto.randomUUID();

// Maximum job description length to prevent token overflow
const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export interface JobAnalysisResult {
    tailoredProfile: CVProfile;
    layoutStrategy: LayoutStrategy;
    matchScore: number;
    suggestions: string[];
    jobTitle?: string;
    companyName?: string;
}

export interface AnalysisOptions {
    mode: 'strict' | 'creative';
    customInstructions?: string;
    templateStyle?: 'harvard' | 'modern' | 'creative' | 'minimal';
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are an elite CV/Resume consultant and ATS optimization specialist. Your mission is to TRANSFORM candidate profiles into highly targeted, compelling resumes that maximize interview chances.

Your response MUST be valid JSON with this exact structure:
{
    "tailoredProfile": { /* CVProfile object with ACTIVELY TAILORED content */ },
    "layoutStrategy": {
        "sectionOrder": ["experience", "education", "skills", ...],
        "hasIntro": true/false,
        "reasoning": "Brief explanation of why this layout works for this job"
    },
    "matchScore": 0-100,
    "suggestions": ["suggestion1", "suggestion2", ...],
    "jobTitle": "Exact job title from the job description",
    "companyName": "Company name from the job description"
}

=== CRITICAL TRANSFORMATION RULES ===

**LANGUAGE (MANDATORY):**
- DETECT the language of the Job Description (German, French, English, Turkish, etc.)
- Write the ENTIRE tailoredProfile in THAT SAME LANGUAGE
- This includes: summary, experience descriptions, skill names, project descriptions - EVERYTHING
- EXCEPTION: Personal data (name, email, phone, URLs) stays unchanged
- If job is in German → entire CV in German. If in French → entire CV in French. NO EXCEPTIONS.

**ACTIVE TAILORING (MANDATORY):**
You MUST actively transform the content, not just copy it. For each section:

1. **Summary/Intro**: Write a NEW, compelling 3-5 sentence summary that:
   - Opens with years of experience + core expertise aligned to the job
   - Highlights 2-3 achievements most relevant to THIS specific role
   - Uses keywords from the job description naturally
   - Ends with career goal matching the position

2. **Experience**: For EACH experience entry:
   - Rewrite descriptions using ACTION VERBS + METRICS where possible
   - Incorporate relevant keywords from job description
   - Emphasize achievements that match job requirements
   - Add context that shows relevance to target role
   - Each description should be 3-6 bullet points or 4-8 lines minimum

3. **Skills**: 
   - Reorder skills to put job-relevant ones FIRST
   - Add related/transferable skills the candidate likely has based on their experience
   - Group skills logically (e.g., Programming Languages, Frameworks, Tools)

4. **Projects**: Enhance descriptions to highlight relevant technologies and outcomes

**CONTENT DEPTH (MANDATORY):**
- The tailored CV MUST be a FULL professional document (minimum 1-2 pages worth of content)
- NEVER produce a half-page or skeleton CV
- Each experience entry needs substantial description (not 1-2 lines)
- Include ALL relevant experiences from the source profile
- If source has 5 experiences, output should have 5 experiences (unless truly irrelevant)

**WHAT YOU MUST NOT DO:**
- Do NOT copy the profile unchanged - that defeats the purpose
- Do NOT fabricate jobs, companies, or degrees that don't exist
- Do NOT shorten or summarize content into a skeleton
- Do NOT ignore the job description language
- Do NOT remove experiences without good reason

**VALUE-ADD REQUIREMENT:**
Every tailored CV should be NOTICEABLY BETTER than the input:
- More compelling language
- Better keyword optimization
- Clearer achievement focus
- Stronger relevance to the target job`;

/**
 * Sanitize and validate AI response to ensure all required fields exist
 * and arrays have proper IDs for React rendering
 */
function sanitizeTailoredProfile(aiProfile: any, originalProfile: CVProfile): CVProfile {
    const ensureIds = <T extends { id?: string }>(arr: T[] | undefined): T[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => ({
            ...item,
            id: item.id || generateId()
        }));
    };

    // Preserve personal data from original profile
    const personal = {
        fullName: originalProfile.personal.fullName,
        email: originalProfile.personal.email,
        phone: originalProfile.personal.phone,
        linkedin: originalProfile.personal.linkedin || '',
        website: originalProfile.personal.website || '',
        github: originalProfile.personal.github || '',
        medium: originalProfile.personal.medium || '',
        location: originalProfile.personal.location || aiProfile?.personal?.location || '',
        title: aiProfile?.personal?.title || originalProfile.personal.title || '',
        summary: aiProfile?.personal?.summary || originalProfile.personal.summary || ''
    };

    return {
        personal,
        experience: ensureIds(aiProfile?.experience || originalProfile.experience),
        education: ensureIds(aiProfile?.education || originalProfile.education),
        skills: Array.isArray(aiProfile?.skills) ? aiProfile.skills : (originalProfile.skills || []),
        languages: ensureIds(aiProfile?.languages || originalProfile.languages),
        projects: ensureIds(aiProfile?.projects || originalProfile.projects),
        certifications: ensureIds(aiProfile?.certifications || originalProfile.certifications),
        volunteer: ensureIds(aiProfile?.volunteer || originalProfile.volunteer),
        awards: ensureIds(aiProfile?.awards || originalProfile.awards),
        publications: ensureIds(aiProfile?.publications || originalProfile.publications),
        references: ensureIds(aiProfile?.references || originalProfile.references)
    };
}

/**
 * Check if AI actually transformed the content or just copied it
 * Returns unchanged=true if the summary is identical (most important indicator)
 */
function detectUnchangedContent(aiProfile: any, originalProfile: CVProfile): { unchanged: boolean; details: string[] } {
    const issues: string[] = [];
    
    // Check summary - THIS IS THE CRITICAL ONE
    const summaryUnchanged = aiProfile?.personal?.summary === originalProfile.personal.summary && 
                             originalProfile.personal.summary && 
                             originalProfile.personal.summary.length > 20;
    if (summaryUnchanged) {
        issues.push('summary');
    }
    
    if (aiProfile?.experience?.[0]?.description && originalProfile.experience?.[0]?.description) {
        if (aiProfile.experience[0].description === originalProfile.experience[0].description) {
            issues.push('experience[0].description');
        }
    }
    
    if (aiProfile?.personal?.title === originalProfile.personal.title && originalProfile.personal.title) {
        issues.push('title');
    }
    
    // Summary unchanged alone is enough to trigger retry
    return { unchanged: summaryUnchanged || issues.length >= 2, details: issues };
}

export async function analyzeAndTailorWithGemini(
    profile: CVProfile,
    jobDescription: string,
    options: AnalysisOptions = { mode: 'creative' },
    isRetry: boolean = false
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

    const retryInstruction = isRetry
        ? `\n\n⚠️ CRITICAL: Your previous attempt just COPIED the original text without transformation. This is WRONG. You MUST REWRITE every section in your own words, tailored to the job. DO NOT copy text verbatim from the input profile.`
        : '';

    // Truncate job description if too long to prevent token overflow
    const truncatedJobDescription = jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH
        ? jobDescription.substring(0, MAX_JOB_DESCRIPTION_LENGTH) + '\n\n[Job description truncated for processing]'
        : jobDescription;

    const userPrompt = `
${SYSTEM_PROMPT}

${modeInstructions}${customInstructions}${templateInstructions}${retryInstruction}

=== CANDIDATE'S MASTER PROFILE (SOURCE DATA) ===
${JSON.stringify(profile, null, 2)}

=== TARGET JOB DESCRIPTION ===
${truncatedJobDescription}

=== YOUR TASK ===
1. DETECT the language of the job description above
2. ANALYZE the key requirements, skills, and keywords from the job
3. TRANSFORM the candidate's profile into a TAILORED, COMPELLING CV that:
   - Is written ENTIRELY in the job description's language
   - Actively REWRITES content (DO NOT just copy the original text!)
   - Emphasizes relevant experience and skills
   - Uses keywords from the job naturally
   - Maintains full professional depth (NOT a skeleton/half-page)

⚠️ IMPORTANT: The summary and experience descriptions MUST be REWRITTEN - not copied verbatim from the input!

REMEMBER:
- Personal info (name, email, phone, URLs) = keep unchanged
- Content language = MATCH the job description language
- Each experience = substantial description with achievements
- The output CV must be NOTICEABLY BETTER and DIFFERENT from the input

Return ONLY valid JSON.`;

    try {
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: isRetry ? 0.9 : (options.mode === 'strict' ? 0.3 : 0.7),
                maxOutputTokens: 8000,
            }
        });

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();

        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        const parsed = JSON.parse(responseText) as JobAnalysisResult;

        // Validate basic response structure
        if (!parsed.tailoredProfile) {
            throw new Error('Invalid response structure from AI: missing tailoredProfile');
        }

        // Check if AI actually transformed the content or just copied it
        const unchangedCheck = detectUnchangedContent(parsed.tailoredProfile, profile);
        
        console.log('[Gemini Debug] Content transformation check:', {
            unchanged: unchangedCheck.unchanged,
            details: unchangedCheck.details,
            isRetry
        });

        // If content is unchanged and this is not already a retry, retry once with stronger instructions
        if (unchangedCheck.unchanged && !isRetry) {
            console.warn('[Gemini Warning] AI copied content without transformation. Retrying with stronger instructions...');
            return analyzeAndTailorWithGemini(profile, jobDescription, options, true);
        }

        if (unchangedCheck.unchanged && isRetry) {
            console.error('[Gemini Error] AI still copied content after retry. Proceeding anyway but content may not be tailored.');
        }

        // CRITICAL: Sanitize the tailored profile to ensure all fields exist and have IDs
        parsed.tailoredProfile = sanitizeTailoredProfile(parsed.tailoredProfile, profile);

        parsed.matchScore = Math.max(0, Math.min(100, parsed.matchScore || 0));
        if (!Array.isArray(parsed.suggestions)) {
            parsed.suggestions = [];
        }

        // Ensure layoutStrategy exists and has required fields
        if (!parsed.layoutStrategy) {
            parsed.layoutStrategy = {
                sectionOrder: ['experience', 'education', 'skills', 'projects'],
                hasIntro: true,
                reasoning: 'Default layout'
            };
        }
        if (!Array.isArray(parsed.layoutStrategy.sectionOrder)) {
            parsed.layoutStrategy.sectionOrder = ['experience', 'education', 'skills', 'projects'];
        }
        if (typeof parsed.layoutStrategy.hasIntro !== 'boolean') {
            parsed.layoutStrategy.hasIntro = true;
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
