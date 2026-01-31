import { forwardRef } from 'react';
import type { CVProfile, LayoutStrategy } from '../../types';

interface Props {
    data: CVProfile;
    layoutStrategy?: LayoutStrategy;
}

/**
 * Minimal CV Template
 * - Ultra-clean, whitespace-focused design
 * - Single column layout
 * - Subtle typography hierarchy
 * - Perfect for senior/executive roles
 */
const MinimalTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    const {
        personal = { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '', summary: '' },
        experience = [],
        education = [],
        skills = [],
        projects = [],
        certifications = [],
        languages = []
    } = data || {};

    return (
        <div ref={ref} className="minimal-cv" style={{
            fontFamily: "'EB Garamond', 'Crimson Text', Georgia, serif",
            fontSize: '11pt',
            lineHeight: 1.7,
            maxWidth: '7in',
            margin: '0 auto',
            padding: '48px',
            background: '#fff',
            color: '#2D2D2D'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap');
                @media print {
                    .minimal-cv { 
                        width: 8.5in; 
                        padding: 0.75in;
                        margin: 0; 
                    }
                    .minimal-cv * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                @page { margin: 0.5in; size: letter; }
            `}</style>

            {/* Header - Centered */}
            <header style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '24pt',
                    fontWeight: 400,
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    color: '#1A1A1A'
                }}>
                    {personal.fullName || 'Your Name'}
                </h1>
                {personal.title && (
                    <p style={{
                        fontSize: '12pt',
                        color: '#666',
                        fontStyle: 'italic',
                        marginBottom: '16px'
                    }}>
                        {personal.title}
                    </p>
                )}

                {/* Contact Line */}
                <div style={{
                    fontSize: '9pt',
                    color: '#888',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <><span>·</span><span>{personal.phone}</span></>}
                    {personal.location && <><span>·</span><span>{personal.location}</span></>}
                    {personal.linkedin && <><span>·</span><span>LinkedIn</span></>}
                </div>
            </header>

            {/* Thin divider */}
            <hr style={{
                border: 'none',
                borderTop: '1px solid #E5E5E5',
                marginBottom: '32px'
            }} />

            {/* Summary */}
            {personal.summary && (
                <section style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <p style={{
                        fontSize: '10.5pt',
                        color: '#555',
                        maxWidth: '85%',
                        margin: '0 auto',
                        fontStyle: 'italic'
                    }}>
                        {personal.summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{
                        fontSize: '10pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: '#888',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        Experience
                    </h2>
                    {experience.map((exp, idx) => (
                        <div key={exp.id || idx} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                <h3 style={{ fontSize: '11pt', fontWeight: 600 }}>
                                    {exp.role}
                                </h3>
                                <span style={{ fontSize: '9pt', color: '#888' }}>
                                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                                </span>
                            </div>
                            <p style={{ fontSize: '10pt', color: '#666', marginBottom: '6px' }}>
                                {exp.company}{exp.location && `, ${exp.location}`}
                            </p>
                            {exp.description && (
                                <p style={{
                                    fontSize: '10pt',
                                    color: '#444',
                                    whiteSpace: 'pre-line',
                                    paddingLeft: '16px',
                                    borderLeft: '1px solid #DDD'
                                }}>
                                    {exp.description}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{
                        fontSize: '10pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: '#888',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        Education
                    </h2>
                    {education.map((edu, idx) => (
                        <div key={edu.id || idx} style={{ marginBottom: '14px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11pt', fontWeight: 600 }}>
                                {edu.degree}
                            </h3>
                            <p style={{ fontSize: '10pt', color: '#666' }}>
                                {edu.institution}
                                <span style={{ color: '#999' }}> · {edu.startDate} — {edu.current ? 'Present' : edu.endDate}</span>
                            </p>
                        </div>
                    ))}
                </section>
            )}

            {/* Skills - Simple inline */}
            {skills.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{
                        fontSize: '10pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: '#888',
                        marginBottom: '12px',
                        textAlign: 'center'
                    }}>
                        Expertise
                    </h2>
                    <p style={{ textAlign: 'center', color: '#555', fontSize: '10pt' }}>
                        {skills.join(' · ')}
                    </p>
                </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{
                        fontSize: '10pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: '#888',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        Notable Projects
                    </h2>
                    {projects.slice(0, 3).map((project, idx) => (
                        <div key={project.id || idx} style={{ marginBottom: '14px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '11pt', fontWeight: 600 }}>{project.name}</h3>
                            {project.description && (
                                <p style={{ fontSize: '10pt', color: '#666', fontStyle: 'italic' }}>
                                    {project.description}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Languages & Certifications in footer */}
            {(languages.length > 0 || certifications.length > 0) && (
                <footer style={{
                    borderTop: '1px solid #E5E5E5',
                    paddingTop: '20px',
                    marginTop: '32px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '32px',
                    fontSize: '9pt',
                    color: '#888'
                }}>
                    {languages.length > 0 && (
                        <div>
                            <strong>Languages:</strong> {languages.map(l => l.language).join(', ')}
                        </div>
                    )}
                    {certifications.length > 0 && (
                        <div>
                            <strong>Certifications:</strong> {certifications.map(c => c.name).join(', ')}
                        </div>
                    )}
                </footer>
            )}
        </div>
    );
});

MinimalTemplate.displayName = 'MinimalTemplate';

export default MinimalTemplate;
