import React, { useRef, useState } from 'react';
import { useCV } from '../store/CVContext';
import HarvardTemplate from '../components/HarvardTemplate';
import { ModernTemplate, CreativeTemplate, MinimalTemplate } from '../components/templates';
import { Printer, AlertCircle, FileText, ChevronDown, AlignVerticalSpaceAround, Split } from 'lucide-react';

type TemplateStyle = 'harvard' | 'modern' | 'creative' | 'minimal';

const templateOptions: { id: TemplateStyle; name: string; description: string }[] = [
    { id: 'harvard', name: 'Harvard Classic', description: 'Traditional, ATS-friendly' },
    { id: 'modern', name: 'Modern', description: 'Clean two-column layout' },
    { id: 'creative', name: 'Creative', description: 'Bold design for creative roles' },
    { id: 'minimal', name: 'Minimal', description: 'Elegant, whitespace-focused' }
];

const Preview: React.FC = () => {
    const { profile, features } = useCV();
    const templateRef = useRef<HTMLDivElement>(null);
    const [activeTemplate, setActiveTemplate] = useState<TemplateStyle>('harvard');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Output Options
    const [verticalFill, setVerticalFill] = useState(false);
    const [smartPagination, setSmartPagination] = useState(true);

    // Use tailored profile if available, otherwise master profile
    const dataToRender = features.currentJobAnalysis?.tailoredProfile || profile;
    const isTailored = !!features.currentJobAnalysis;

    const handlePrint = () => {
        window.print();
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
        </div>
    );
};

export default Preview;
