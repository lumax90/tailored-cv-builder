import React, { useState } from 'react';
import { useCV } from '../store/CVContext';
import { MessageSquare, Sparkles, RefreshCw, ChevronDown, ChevronUp, Lightbulb, Target } from 'lucide-react';
import { useToast } from '../components/Toast';

interface InterviewQuestion {
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    tip: string;
}

const InterviewPrep: React.FC = () => {
    const { profile, features } = useCV();
    const { showToast } = useToast();

    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [questionType, setQuestionType] = useState<'all' | 'behavioral' | 'technical'>('all');
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    // Pre-fill from current job analysis
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

        setIsGenerating(true);

        try {
            const response = await fetch('http://localhost:3000/api/cv/interview-prep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    profile,
                    jobDescription,
                    questionType
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Generation failed');
            }

            const data = await response.json();
            setQuestions(data.questions);
            showToast('success', `Generated ${data.questions.length} interview questions!`);
        } catch (error: any) {
            showToast('error', error.message || 'Failed to generate questions');
        } finally {
            setIsGenerating(false);
        }
    };

    const typeColors = {
        behavioral: { bg: '#DBEAFE', text: '#1E40AF', label: 'Behavioral' },
        technical: { bg: '#D1FAE5', text: '#065F46', label: 'Technical' },
        situational: { bg: '#FEF3C7', text: '#92400E', label: 'Situational' }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: 'var(--spacing-6)' }}>
                <h2 className="section-title">Interview Prep</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Generate personalized interview questions based on the job and your profile.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--spacing-6)' }}>
                {/* Input Panel */}
                <div>
                    <div className="card">
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

                        <div className="form-group">
                            <label className="form-label">Question Type</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['all', 'behavioral', 'technical'] as const).map(t => (
                                    <button
                                        key={t}
                                        className={`btn btn-sm ${questionType === t ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setQuestionType(t)}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                    <Sparkles size={18} /> Generate Questions
                                </>
                            )}
                        </button>
                    </div>

                    {/* Tips Card */}
                    <div className="card" style={{ marginTop: 'var(--spacing-4)', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-3)' }}>
                            <Lightbulb size={20} color="#D97706" />
                            <strong style={{ color: '#92400E' }}>Interview Tips</strong>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#78350F' }}>
                            <li style={{ marginBottom: '8px' }}>Use the STAR method for behavioral questions</li>
                            <li style={{ marginBottom: '8px' }}>Prepare 2-3 specific examples from your experience</li>
                            <li>Practice speaking your answers out loud</li>
                        </ul>
                    </div>
                </div>

                {/* Questions Panel */}
                <div>
                    <div className="card" style={{ minHeight: '500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-4)' }}>
                            <MessageSquare size={20} color="var(--color-primary)" />
                            <h3 style={{ fontWeight: 600 }}>Interview Questions</h3>
                            {questions.length > 0 && (
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.8rem',
                                    color: 'var(--color-text-muted)',
                                    background: 'var(--color-bg-subtle)',
                                    padding: '4px 10px',
                                    borderRadius: '20px'
                                }}>
                                    {questions.length} questions
                                </span>
                            )}
                        </div>

                        {questions.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'var(--spacing-8)',
                                color: 'var(--color-text-muted)',
                                textAlign: 'center'
                            }}>
                                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 'var(--spacing-3)' }} />
                                <p>Questions will appear here.</p>
                                <p style={{ fontSize: '0.85rem' }}>Paste a job description and click generate.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                                {questions.map((q, idx) => {
                                    const typeStyle = typeColors[q.type];
                                    const isExpanded = expandedQuestion === idx;
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: 'var(--spacing-3)',
                                                background: 'var(--color-bg-subtle)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--color-border-subtle)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    background: typeStyle.bg,
                                                    color: typeStyle.text,
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {typeStyle.label}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 500, marginBottom: isExpanded ? '10px' : 0 }}>
                                                        {q.question}
                                                    </p>
                                                    {isExpanded && (
                                                        <div className="animate-fade-in" style={{
                                                            padding: 'var(--spacing-3)',
                                                            background: '#F0FDF4',
                                                            borderRadius: 'var(--radius-sm)',
                                                            borderLeft: '3px solid #10B981'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#059669', fontSize: '0.8rem' }}>
                                                                <Target size={14} />
                                                                <strong>Tip</strong>
                                                            </div>
                                                            <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0 }}>{q.tip}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewPrep;
