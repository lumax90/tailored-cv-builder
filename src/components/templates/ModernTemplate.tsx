import { forwardRef } from 'react';
import type { CVProfile, LayoutStrategy } from '../../types';

interface Props {
    data: CVProfile;
    layoutStrategy?: LayoutStrategy;
    verticalFill?: boolean;
    smartPagination?: boolean;
}

/**
 * Modern CV Template
 * - Clean two-column layout
 * - Sidebar with contact info and skills
 * - Main content area with experience and education
 * - Accent color for visual interest
 */
const ModernTemplate = forwardRef<HTMLDivElement, Props>(({ data, verticalFill, smartPagination }, ref) => {
    const {
        personal = { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '', summary: '' },
        experience = [],
        education = [],
        skills = [],
        projects = [],
        certifications = [],
        languages = []
    } = data || {};

    const accentColor = '#2563EB'; // Blue-600

    return (
        <div ref={ref} className="modern-cv" style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '10pt',
            lineHeight: 1.5,
            maxWidth: '8.5in',
            margin: '0 auto',
            background: '#fff',
            color: '#1F2937'
        }}>
            <style>{`
                @media print {
                    .modern-cv { 
                        width: 8.5in; 
                        margin: 0; 
                        box-shadow: none !important;
                        padding: 0 !important; 
                        height: ${verticalFill ? '11in' : 'auto'} !important;
                    }
                    .modern-cv * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    /* Smart Pagination Logic */
                    ${smartPagination ? `
                        .cv-section-item { break-inside: avoid; page-break-inside: avoid; }
                        h2, h3 { break-after: avoid; page-break-after: avoid; }
                    ` : ''}
                }
                @page { 
                    margin: 0; 
                    size: letter;
                }
                @media print {
                   .modern-cv-grid { min-height: ${verticalFill ? '11in' : '0'} !important; }
                   .main-content-column {
                       display: flex; 
                       flex-direction: column; 
                       ${verticalFill ? 'justify-content: space-between;' : ''}
                       padding: 24px 32px;
                       -webkit-box-decoration-break: clone;
                       box-decoration-break: clone;
                   }
                }
            `}</style>

            <div className="modern-cv-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '11in' }}>
                {/* Sidebar */}
                <div style={{
                    background: '#F3F4F6',
                    padding: '24px',
                    borderRight: `3px solid ${accentColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    ...(verticalFill ? { justifyContent: 'space-between' } : {})
                }}>
                    {/* Name & Title */}
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{
                            fontSize: '20pt',
                            fontWeight: 700,
                            color: '#111827',
                            marginBottom: '4px',
                            lineHeight: 1.2
                        }}>
                            {personal.fullName || 'Your Name'}
                        </h1>
                        {personal.title && (
                            <p style={{
                                color: accentColor,
                                fontWeight: 500,
                                fontSize: '11pt'
                            }}>
                                {personal.title}
                            </p>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            fontSize: '9pt',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#6B7280',
                            marginBottom: '8px',
                            fontWeight: 600
                        }}>
                            Contact
                        </h3>
                        <div style={{ fontSize: '9pt', color: '#374151' }}>
                            {personal.email && <p style={{ marginBottom: '4px' }}>{personal.email}</p>}
                            {personal.phone && <p style={{ marginBottom: '4px' }}>{personal.phone}</p>}
                            {personal.location && <p style={{ marginBottom: '4px' }}>{personal.location}</p>}
                            {personal.linkedin && <p style={{ marginBottom: '4px', wordBreak: 'break-all' }}>{personal.linkedin}</p>}
                            {personal.website && <p style={{ marginBottom: '4px', wordBreak: 'break-all' }}>{personal.website}</p>}
                        </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{
                                fontSize: '9pt',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: '#6B7280',
                                marginBottom: '8px',
                                fontWeight: 600
                            }}>
                                Skills
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {skills.slice(0, 15).map((skill, idx) => (
                                    <span key={idx} style={{
                                        background: '#E5E7EB',
                                        color: '#374151',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '8pt'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {languages.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{
                                fontSize: '9pt',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: '#6B7280',
                                marginBottom: '8px',
                                fontWeight: 600
                            }}>
                                Languages
                            </h3>
                            {languages.map((lang, idx) => (
                                <p key={idx} style={{ fontSize: '9pt', marginBottom: '2px' }}>
                                    <strong>{lang.language}</strong>
                                    {lang.proficiency && <span style={{ color: '#6B7280' }}> - {lang.proficiency}</span>}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <div>
                            <h3 style={{
                                fontSize: '9pt',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: '#6B7280',
                                marginBottom: '8px',
                                fontWeight: 600
                            }}>
                                Certifications
                            </h3>
                            {certifications.map((cert, idx) => (
                                <p key={idx} style={{ fontSize: '9pt', marginBottom: '4px' }}>
                                    {cert.name}
                                    {cert.issuer && <span style={{ color: '#6B7280' }}> - {cert.issuer}</span>}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="main-content-column" style={{ padding: '24px 32px' }}>
                    {/* Summary */}
                    {personal.summary && (
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{
                                fontSize: '10pt',
                                color: '#4B5563',
                                lineHeight: 1.6,
                                borderLeft: `3px solid ${accentColor}`,
                                paddingLeft: '12px'
                            }}>
                                {personal.summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{
                                fontSize: '12pt',
                                fontWeight: 700,
                                color: accentColor,
                                borderBottom: `2px solid ${accentColor}`,
                                paddingBottom: '6px',
                                marginBottom: '16px'
                            }}>
                                Experience
                            </h2>
                            {experience.map((exp, idx) => (
                                <div key={exp.id || idx} className="cv-section-item" style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '11pt', fontWeight: 600, color: '#111827' }}>
                                                {exp.role}
                                            </h3>
                                            <p style={{ fontSize: '10pt', color: '#4B5563' }}>
                                                {exp.company}{exp.location && `, ${exp.location}`}
                                            </p>
                                        </div>
                                        <span style={{ fontSize: '9pt', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <p style={{ fontSize: '9pt', color: '#4B5563', marginTop: '6px', whiteSpace: 'pre-line' }}>
                                            {exp.description}
                                        </p>
                                    )}
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {exp.technologies.map((tech, i) => (
                                                <span key={i} style={{
                                                    background: `${accentColor}20`,
                                                    color: accentColor,
                                                    padding: '1px 6px',
                                                    borderRadius: '3px',
                                                    fontSize: '8pt'
                                                }}>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{
                                fontSize: '12pt',
                                fontWeight: 700,
                                color: accentColor,
                                borderBottom: `2px solid ${accentColor}`,
                                paddingBottom: '6px',
                                marginBottom: '16px'
                            }}>
                                Education
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={edu.id || idx} className="cv-section-item" style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '11pt', fontWeight: 600, color: '#111827' }}>
                                                {edu.degree}
                                            </h3>
                                            <p style={{ fontSize: '10pt', color: '#4B5563' }}>
                                                {edu.institution}
                                            </p>
                                        </div>
                                        <span style={{ fontSize: '9pt', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                            {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                                        </span>
                                    </div>
                                    {edu.gpa && (
                                        <p style={{ fontSize: '9pt', color: '#6B7280', marginTop: '2px' }}>GPA: {edu.gpa}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            <h2 style={{
                                fontSize: '12pt',
                                fontWeight: 700,
                                color: accentColor,
                                borderBottom: `2px solid ${accentColor}`,
                                paddingBottom: '6px',
                                marginBottom: '16px'
                            }}>
                                Projects
                            </h2>
                            {projects.slice(0, 3).map((project, idx) => (
                                <div key={project.id || idx} className="cv-section-item" style={{ marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '10pt', fontWeight: 600, color: '#111827' }}>
                                        {project.name}
                                    </h3>
                                    {project.description && (
                                        <p style={{ fontSize: '9pt', color: '#4B5563', marginTop: '4px' }}>
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

ModernTemplate.displayName = 'ModernTemplate';

export default ModernTemplate;
