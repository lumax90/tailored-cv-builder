import React, { useState } from 'react';
import { useCV } from '../store/CVContext';
import { Sparkles, ArrowRight, CheckCircle, Save, ChevronDown, ChevronUp, Settings2, FileText } from 'lucide-react';
import { analyzeJobMatch } from '../services/ai';
import { useNavigate } from 'react-router-dom';
import type { AnalysisMode } from '../types';
import AnalysisProgressModal from '../components/AnalysisProgressModal';

type TemplateStyle = 'harvard' | 'modern' | 'creative' | 'minimal';

const templateOptions: { id: TemplateStyle; name: string; description: string }[] = [
    { id: 'harvard', name: 'Harvard Classic', description: 'Traditional, ATS-friendly format' },
    { id: 'modern', name: 'Modern', description: 'Clean two-column layout' },
    { id: 'creative', name: 'Creative', description: 'Bold design for creative roles' },
    { id: 'minimal', name: 'Minimal', description: 'Ultra-clean, whitespace-focused' }
];

const JobMatch: React.FC = () => {
    const { profile, features, addApplication } = useCV();
    const { setJobAnalysis } = features;
    const navigate = useNavigate();
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI Customization State
    const [mode, setMode] = useState<AnalysisMode>('creative');
    const [customInstructions, setCustomInstructions] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('harvard');

    // Save Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            setError("Please paste a job description.");
            return;
        }

        // Check if profile has minimum data
        if (!profile.personal.fullName) {
            setError("Please complete your profile first. At minimum, add your name.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await analyzeJobMatch(profile, jobDescription, {
                mode,
                customInstructions,
                templateStyle
            });
            setJobAnalysis(result);
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveApplication = () => {
        if (!jobTitle || !companyName) {
            alert("Please enter Job Title and Company Name");
            return;
        }

        if (!features.currentJobAnalysis) return;

        addApplication({
            id: Math.random().toString(36).substring(7),
            jobTitle,
            companyName,
            dateApplied: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: 'applied',
            jobDescription: features.currentJobAnalysis.originalDescription,
            tailoredProfile: features.currentJobAnalysis.tailoredProfile,
            matchScore: features.currentJobAnalysis.matchScore
        });

        setShowSaveModal(false);
        navigate('/');
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: 'var(--spacing-8)' }}>
                <h2 className="section-title">Job Analysis</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Paste a job description below. Our AI will analyze it against your profile and tailor your resume.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-8)' }}>

                {/* Input Section */}
                <section className="card">
                    <div className="form-group">
                        <label className="form-label">Job Description</label>
                        <textarea
                            className="form-textarea"
                            rows={12}
                            placeholder="Paste the full job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                    </div>

                    {/* Template Selection */}
                    <div className="form-group">
                        <label className="form-label">CV Template</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                            {templateOptions.map(template => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => setTemplateStyle(template.id)}
                                    style={{
                                        padding: '12px',
                                        border: templateStyle === template.id
                                            ? '2px solid var(--color-primary)'
                                            : '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        background: templateStyle === template.id
                                            ? 'var(--color-accent-bg)'
                                            : 'var(--color-surface)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <FileText size={16} color={templateStyle === template.id ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                                        <strong style={{ fontSize: '0.9rem' }}>{template.name}</strong>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                        {template.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setShowOptions(!showOptions)}
                            style={{ fontSize: '0.85rem' }}
                        >
                            <Settings2 size={14} />
                            {showOptions ? 'Hide AI Settings' : 'Advanced AI Settings'}
                            {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {/* Advanced Options Panel */}
                    {showOptions && (
                        <div className="animate-fade-in" style={{
                            background: 'var(--color-bg-subtle)',
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-4)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div className="grid-2" style={{ marginBottom: 'var(--spacing-4)' }}>
                                <div className="form-group">
                                    <label className="form-label" title="Controls how much the AI can infer or adapt your profile.">
                                        Optimization Mode
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className={`btn btn-sm ${mode === 'creative' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setMode('creative')}
                                            style={{ flex: 1 }}
                                        >
                                            ✨ Creative
                                        </button>
                                        <button
                                            className={`btn btn-sm ${mode === 'strict' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setMode('strict')}
                                            style={{ flex: 1 }}
                                        >
                                            🔒 Strict
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {mode === 'creative'
                                            ? "Permits inference of transferrable skills and tone adaptation."
                                            : "Strictly adheres to Master Profile facts. No embellishments."}
                                    </p>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Custom Instructions (Optional)</label>
                                <textarea
                                    className="form-input"
                                    rows={2}
                                    placeholder="e.g. 'Focus heavily on my leadership experience' or 'Keep the summary under 3 sentences'."
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            style={{ opacity: isAnalyzing ? 0.7 : 1 }}
                        >
                            <Sparkles size={18} />
                            Analyze & Tailor Resume
                        </button>
                        {error && <span style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>{error}</span>}
                    </div>
                </section>

                <AnalysisProgressModal isOpen={isAnalyzing} />

                {/* Results Section - Only show if we have results */}
                {features.currentJobAnalysis && (
                    <section className="card" style={{ border: '1px solid var(--color-accent)', background: '#F8FAFC' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-4)', fontFamily: 'var(--font-serif)', color: 'var(--color-accent)' }}>
                            Analysis Results
                        </h3>

                        {/* Match Score Badge */}
                        {features.currentJobAnalysis.matchScore !== undefined && (
                            <div style={{
                                marginBottom: 'var(--spacing-4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: features.currentJobAnalysis.matchScore >= 70 ? '#DCFCE7' : features.currentJobAnalysis.matchScore >= 40 ? '#FEF9C3' : '#FEE2E2',
                                borderRadius: '100px',
                                color: features.currentJobAnalysis.matchScore >= 70 ? '#166534' : features.currentJobAnalysis.matchScore >= 40 ? '#854D0E' : '#991B1B'
                            }}>
                                <strong>{features.currentJobAnalysis.matchScore}%</strong> Match Score
                            </div>
                        )}

                        {features.currentJobAnalysis.layoutStrategy && (
                            <div style={{ marginBottom: 'var(--spacing-6)', padding: '12px', background: '#eff6ff', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>AI Strategy</h4>
                                <p style={{ fontSize: '0.9rem', color: '#1e3a8a', fontStyle: 'italic' }}>
                                    "{features.currentJobAnalysis.layoutStrategy.reasoning}"
                                </p>
                            </div>
                        )}

                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>Key Suggestions</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {features.currentJobAnalysis.suggestions.map((suggestion, idx) => (
                                    <li key={idx} style={{
                                        marginBottom: 'var(--spacing-2)',
                                        paddingLeft: 'var(--spacing-6)',
                                        position: 'relative'
                                    }}>
                                        <CheckCircle size={16} style={{ position: 'absolute', left: 0, top: '4px', color: 'var(--color-success)' }} />
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{
                            padding: 'var(--spacing-4)',
                            background: '#fff',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            gap: 'var(--spacing-4)',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowSaveModal(true)}
                                style={{ flex: 1 }}
                            >
                                <Save size={18} /> Save Application
                            </button>
                            <a href="/preview" className="btn btn-outline" style={{ flex: 1, textDecoration: 'none' }}>
                                Preview & Download <ArrowRight size={16} />
                            </a>
                        </div>
                    </section>
                )}
            </div>

            {/* Save Application Modal */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Save Application</h3>

                        <div className="form-group">
                            <label className="form-label">Job Title</label>
                            <input
                                className="form-input"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                                placeholder="e.g. Senior Frontend Developer"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                className="form-input"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                placeholder="e.g. Google"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-6)' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveApplication}>Save</button>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowSaveModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobMatch;
