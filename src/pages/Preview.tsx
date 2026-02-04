import React, { useRef, useState } from 'react';
import { useCV } from '../store/CVContext';
import HarvardTemplate from '../components/HarvardTemplate';
import { ModernTemplate, CreativeTemplate, MinimalTemplate } from '../components/templates';
import Modal from '../components/Modal';
import { Printer, AlertCircle, FileText, ChevronDown, AlignVerticalSpaceAround, Split, RefreshCw, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TemplateStyle = 'harvard' | 'modern' | 'creative' | 'minimal';

const templateOptions: { id: TemplateStyle; name: string; description: string }[] = [
    { id: 'harvard', name: 'Harvard Classic', description: 'Traditional, ATS-friendly' },
    { id: 'modern', name: 'Modern', description: 'Clean two-column layout' },
    { id: 'creative', name: 'Creative', description: 'Bold design for creative roles' },
    { id: 'minimal', name: 'Minimal', description: 'Elegant, whitespace-focused' }
];

const Preview: React.FC = () => {
    const { profile, features } = useCV();
    // const { user } = useAuth(); // Not needed if cookie handles auth
    const templateRef = useRef<HTMLDivElement>(null);
    const [activeTemplate, setActiveTemplate] = useState<TemplateStyle>('harvard');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Output Options
    const [verticalFill, setVerticalFill] = useState(false);
    const [smartPagination, setSmartPagination] = useState(true);

    // Regeneration State
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [customInstructions, setCustomInstructions] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Use tailored profile if available, otherwise master profile
    const dataToRender = features.currentJobAnalysis?.tailoredProfile || profile;
    const isTailored = !!features.currentJobAnalysis;

    const handlePrint = () => {
        window.print();
    };

    const handleRegenerate = async () => {
        if (!features.currentJobAnalysis?.originalDescription) {
            alert("No job description found to regenerate from.");
            return;
        }

        setIsRegenerating(true);
        try {
            const API_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

            // We use the MASTER profile as base, but tailored logic uses it anyway
            const response = await fetch(`${API_URL}/cv/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    profile: profile, // Always regenerate from master profile to avoid degradation
                    jobDescription: features.currentJobAnalysis.originalDescription,
                    options: {
                        mode: 'creative', // Defaulting to creative as per previous flow, or could make selectable
                        customInstructions: customInstructions
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Regeneration failed');
            }

            const result = await response.json();

            // Update Context
            features.setJobAnalysis(result);

            // Close Modal & Reset
            setShowRegenerateModal(false);
            setCustomInstructions('');

        } catch (error) {
            console.error("Regeneration error:", error);
            alert("Failed to regenerate resume. Please try again.");
        } finally {
            setIsRegenerating(false);
        }
    };

    const renderTemplate = () => {
        const props = {
            data: dataToRender,
            layoutStrategy: features.currentJobAnalysis?.layoutStrategy,
            ref: templateRef,
            verticalFill,
            smartPagination
        };

        switch (activeTemplate) {
            case 'modern':
                return <ModernTemplate {...props} />;
            case 'creative':
                return <CreativeTemplate {...props} />;
            case 'minimal':
                return <MinimalTemplate {...props} />;
            case 'harvard':
            default:
                return <HarvardTemplate {...props} />;
        }
    };

    const currentTemplateInfo = templateOptions.find(t => t.id === activeTemplate);

    return (
        <div className="animate-fade-in">
            <header className="no-print" style={{
                marginBottom: 'var(--spacing-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 className="section-title">
                        Preview & Export
                        {isTailored && (
                            <span style={{
                                fontSize: '0.875rem',
                                marginLeft: '12px',
                                fontWeight: 'normal',
                                background: '#DCFCE7',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                color: '#166534'
                            }}>
                                Tailored Job Match
                            </span>
                        )}
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Review your resume below. Select a template and print to save as PDF.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Layout Controls */}
                    <div style={{ display: 'flex', gap: '6px', marginRight: '8px' }}>
                        {/* Regenerate Button (Only if tailored) */}
                        {isTailored && (
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowRegenerateModal(true)}
                                title="Regenerate with AI"
                                style={{ height: '36px', padding: '0 10px', marginRight: '8px', borderColor: '#8B5CF6', color: '#7C3AED' }}
                            >
                                <RefreshCw size={16} />
                                <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Regenerate</span>
                            </button>
                        )}

                        <button
                            className={`btn btn-sm ${verticalFill ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setVerticalFill(!verticalFill)}
                            title="Vertical Fill: Distribute content to fill empty space"
                            style={{ height: '36px', padding: '0 10px' }}
                        >
                            <AlignVerticalSpaceAround size={16} />
                            <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Fit Page</span>
                        </button>
                        <button
                            className={`btn btn-sm ${smartPagination ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSmartPagination(!smartPagination)}
                            title="Smart Pagination: Improve breaks between pages"
                            style={{ height: '36px', padding: '0 10px' }}
                        >
                            <Split size={16} />
                            <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Smart Break</span>
                        </button>
                    </div>

                    {/* Template Selector Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FileText size={18} />
                            {currentTemplateInfo?.name}
                            <ChevronDown size={16} style={{
                                transform: showTemplateSelector ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s'
                            }} />
                        </button>

                        {showTemplateSelector && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '4px',
                                background: 'white',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '220px',
                                overflow: 'hidden'
                            }}>
                                {templateOptions.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setActiveTemplate(template.id);
                                            setShowTemplateSelector(false);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            border: 'none',
                                            background: activeTemplate === template.id ? 'var(--color-accent-bg)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                            {template.name}
                                            {activeTemplate === template.id && (
                                                <span style={{ marginLeft: '8px', color: 'var(--color-primary)' }}>✓</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {template.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary" onClick={handlePrint}>
                        <Printer size={18} /> Export PDF
                    </button>
                </div>
            </header>

            {!profile.personal.fullName && (
                <div className="no-print" style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    borderRadius: '6px',
                    display: 'flex',
                    gap: '10px',
                    color: '#C2410C'
                }}>
                    <AlertCircle />
                    Your profile seems empty. Go to the <strong>Profile</strong> tab to add details.
                </div>
            )}

            {/* Template Quick Switcher - Mini buttons */}
            <div className="no-print" style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                justifyContent: 'center'
            }}>
                {templateOptions.map(template => (
                    <button
                        key={template.id}
                        onClick={() => setActiveTemplate(template.id)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: activeTemplate === template.id
                                ? '2px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                            background: activeTemplate === template.id
                                ? 'var(--color-accent-bg)'
                                : 'white',
                            color: activeTemplate === template.id
                                ? 'var(--color-primary)'
                                : 'var(--color-text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: activeTemplate === template.id ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        {template.name}
                    </button>
                ))}
            </div>

            {/* The Resume Preview */}
            <div className="print-preview-container" style={{
                overflowX: 'auto',
                paddingBottom: '2rem',
                background: '#F1F5F9',
                padding: '24px',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div className="print-preview-wrapper" style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    margin: '0 auto',
                    width: 'fit-content'
                }}>
                    {renderTemplate()}
                </div>
            </div>

            {/* Regeneration Modal */}
            <Modal
                isOpen={showRegenerateModal}
                onClose={() => setShowRegenerateModal(false)}
                title="Regenerate Resume"
                width="600px"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        padding: '16px',
                        background: '#F0F9FF',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        color: '#0369A1',
                        fontSize: '0.9rem'
                    }}>
                        <Wand2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <strong>Refine your Resume with AI</strong>
                            <p style={{ margin: '4px 0 0', opacity: 0.9 }}>
                                Add specific instructions to guide the AI. For example: "Emphasize my leadership skills", "Make the summary more concise", or "Focus on React experience".
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                            Custom Instructions (Optional)
                        </label>
                        <textarea
                            className="form-input"
                            rows={4}
                            placeholder="e.g. Please highlight my project management experience..."
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '12px',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowRegenerateModal(false)}
                            disabled={isRegenerating}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '140px',
                                justifyContent: 'center'
                            }}
                        >
                            {isRegenerating ? (
                                <>
                                    <div className="spinner-small" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} /> Regenerate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Preview;
