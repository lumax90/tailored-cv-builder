import React, { useState } from 'react';
import { useCV } from '../store/CVContext';
import { FileText, Sparkles, Copy, Download, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../components/Toast';

const CoverLetter: React.FC = () => {
    const { profile, features } = useCV();
    const { showToast } = useToast();

    const [jobDescription, setJobDescription] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'confident'>('professional');
    const [showOptions, setShowOptions] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    // Pre-fill from current job analysis if available
    React.useEffect(() => {
        if (features.currentJobAnalysis?.originalDescription) {
            setJobDescription(features.currentJobAnalysis.originalDescription);
        }
    }, [features.currentJobAnalysis]);

    const handleGenerate = async () => {
        if (!jobDescription.trim()) {
            showToast('error', 'Please paste a job description first.');
            return;
        }

        if (!profile.personal.fullName) {
            showToast('error', 'Complete your profile first.');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('http://localhost:3000/api/cv/cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    profile,
                    jobDescription,
                    options: { tone, companyName, jobTitle }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Generation failed');
            }

            const data = await response.json();
            setCoverLetter(data.coverLetter);
            showToast('success', 'Cover letter generated!');
        } catch (error: any) {
            showToast('error', error.message || 'Failed to generate cover letter');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        showToast('success', 'Copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([coverLetter], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cover_letter_${companyName || 'draft'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', 'Downloaded!');
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: 'var(--spacing-6)' }}>
                <h2 className="section-title">Cover Letter Generator</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Generate a tailored cover letter based on your profile and the job description.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
                {/* Input Section */}
                <div>
                    <div className="card">
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                className="form-input"
                                placeholder="e.g., Google, Microsoft..."
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Title</label>
                            <input
                                className="form-input"
                                placeholder="e.g., Senior Software Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Description</label>
                            <textarea
                                className="form-textarea"
                                rows={10}
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        {/* Tone Options */}
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowOptions(!showOptions)}
                            style={{ marginBottom: 'var(--spacing-4)' }}
                        >
                            {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Tone Settings
                        </button>

                        {showOptions && (
                            <div className="animate-fade-in" style={{
                                padding: 'var(--spacing-3)',
                                background: 'var(--color-bg-subtle)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                <label className="form-label">Writing Tone</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['professional', 'enthusiastic', 'confident'] as const).map(t => (
                                        <button
                                            key={t}
                                            className={`btn btn-sm ${tone === t ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setTone(t)}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{ width: '100%' }}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Generate Cover Letter
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div>
                    <div className="card" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={20} color="var(--color-primary)" />
                                <h3 style={{ fontWeight: 600 }}>Generated Letter</h3>
                            </div>
                            {coverLetter && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-outline btn-sm" onClick={handleCopy}>
                                        <Copy size={14} /> Copy
                                    </button>
                                    <button className="btn btn-outline btn-sm" onClick={handleDownload}>
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                            )}
                        </div>

                        {coverLetter ? (
                            <textarea
                                className="form-textarea"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                style={{
                                    flex: 1,
                                    fontFamily: 'Georgia, serif',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.7,
                                    resize: 'none'
                                }}
                            />
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-muted)',
                                textAlign: 'center',
                                padding: 'var(--spacing-6)'
                            }}>
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: 'var(--spacing-3)' }} />
                                <p>Your cover letter will appear here.</p>
                                <p style={{ fontSize: '0.85rem' }}>Fill in the details and click generate.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverLetter;
