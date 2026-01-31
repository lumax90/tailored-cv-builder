import type { CVProfile } from '../types';

interface ATSResult {
    score: number; // 0-100
    breakdown: {
        keywords: number;
        formatting: number;
        sections: number;
        length: number;
        contact: number;
    };
    suggestions: string[];
}

/**
 * Calculate ATS (Applicant Tracking System) compatibility score
 * Returns a score from 0-100 and suggestions for improvement
 */
export function calculateATSScore(profile: CVProfile, jobDescription?: string): ATSResult {
    const suggestions: string[] = [];
    let keywords = 0;
    let formatting = 0;
    let sections = 0;
    let length = 0;
    let contact = 0;

    // 1. Contact Information Score (20 points max)
    if (profile.personal.fullName) contact += 5;
    if (profile.personal.email) contact += 5;
    if (profile.personal.phone) contact += 4;
    if (profile.personal.location) contact += 3;
    if (profile.personal.linkedin) contact += 3;

    if (!profile.personal.email) suggestions.push('Add your email address');
    if (!profile.personal.phone) suggestions.push('Add your phone number');
    if (!profile.personal.linkedin) suggestions.push('Add your LinkedIn profile URL');

    // 2. Sections Score (20 points max)
    if (profile.experience.length > 0) sections += 7;
    if (profile.education.length > 0) sections += 5;
    if (profile.skills.length > 0) sections += 5;
    if (profile.personal.summary) sections += 3;

    if (profile.experience.length === 0) suggestions.push('Add at least one work experience');
    if (profile.skills.length === 0) suggestions.push('Add relevant skills to match job requirements');
    if (!profile.personal.summary) suggestions.push('Write a professional summary (2-3 sentences)');

    // 3. Content Length Score (20 points max)
    const summaryLength = profile.personal.summary?.split(' ').length || 0;
    if (summaryLength >= 20 && summaryLength <= 80) length += 5;
    else if (summaryLength > 0) length += 2;

    profile.experience.forEach(exp => {
        const descLength = exp.description?.split(' ').length || 0;
        if (descLength >= 30 && descLength <= 150) length += 3;
        else if (descLength > 0) length += 1;
    });
    length = Math.min(length, 20);

    if (summaryLength < 20 && summaryLength > 0) {
        suggestions.push('Expand your summary to 20-80 words');
    }

    // 4. Formatting Score (20 points max)
    // Check for bullet points, dates, consistency
    let hasActionVerbs = false;
    let hasMetrics = false;

    profile.experience.forEach(exp => {
        const desc = exp.description?.toLowerCase() || '';
        // Check for action verbs
        const actionVerbs = ['led', 'developed', 'created', 'improved', 'managed', 'increased', 'reduced', 'implemented', 'designed', 'built', 'launched', 'achieved'];
        if (actionVerbs.some(verb => desc.includes(verb))) hasActionVerbs = true;

        // Check for metrics/numbers
        if (/\d+%|\$\d+|\d+ (users|customers|projects|team|million|billion)/i.test(desc)) hasMetrics = true;

        // Check for dates
        if (exp.startDate && exp.endDate) formatting += 2;
    });

    if (hasActionVerbs) formatting += 5;
    if (hasMetrics) formatting += 5;
    formatting = Math.min(formatting, 20);

    if (!hasActionVerbs) suggestions.push('Use action verbs (led, developed, improved) in experience descriptions');
    if (!hasMetrics) suggestions.push('Add quantifiable achievements (%, $, numbers)');

    // 5. Keyword Match Score (20 points max) - Only if job description provided
    if (jobDescription) {
        const jobWords = jobDescription.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const profileContent = [
            profile.personal.summary,
            ...profile.skills,
            ...profile.experience.map(e => `${e.role} ${e.description}`),
            ...profile.projects.map(p => `${p.name} ${p.description}`)
        ].join(' ').toLowerCase();

        const uniqueJobWords = [...new Set(jobWords)];
        const matchedWords = uniqueJobWords.filter(word => profileContent.includes(word));
        const matchRatio = matchedWords.length / Math.min(uniqueJobWords.length, 50);

        keywords = Math.min(Math.round(matchRatio * 20), 20);

        if (keywords < 10) {
            suggestions.push('Add more keywords from the job description to your profile');
        }
    } else {
        // Without job description, give partial score based on skill count
        keywords = Math.min(profile.skills.length * 2, 20);
        if (profile.skills.length < 5) {
            suggestions.push('Add more skills (aim for 8-15 relevant skills)');
        }
    }

    const totalScore = contact + sections + length + formatting + keywords;

    return {
        score: totalScore,
        breakdown: {
            keywords,
            formatting,
            sections,
            length,
            contact
        },
        suggestions: suggestions.slice(0, 5) // Top 5 suggestions
    };
}

/**
 * Get a color based on ATS score
 */
export function getATSScoreColor(score: number): string {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Amber
    if (score >= 40) return '#F97316'; // Orange
    return '#EF4444'; // Red
}

/**
 * Get a label for the ATS score
 */
export function getATSScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
}
