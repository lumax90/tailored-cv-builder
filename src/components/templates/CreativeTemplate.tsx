import { forwardRef } from 'react';
import type { CVProfile, LayoutStrategy } from '../../types';

interface Props {
    data: CVProfile;
    layoutStrategy?: LayoutStrategy;
}

/**
 * Creative CV Template
 * - Bold, colorful design for creative roles
 * - Large header with gradient
 * - Card-based sections
 * - Unique typography
 */
const CreativeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
    const {
        personal = { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '', summary: '' },
        experience = [],
        education = [],
        skills = [],
        projects = [],
    } = data || {};

    return (
        <div ref={ref} className="creative-cv" style={{
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontSize: '10pt',
            lineHeight: 1.6,
            maxWidth: '8.5in',
            margin: '0 auto',
            background: '#fff',
            color: '#1a1a2e'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
                @media print {
                    .creative-cv { 
                        width: 8.5in; 
                        margin: 0; 
                        box-shadow: none !important; 
                    }
                    .creative-cv * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                @page { margin: 0; size: letter; }
            `}</style>

            {/* Bold Header */}
            <div style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
                color: 'white',
                padding: '40px 32px 32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '30%',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '50%'
                }} />

                <h1 style={{
                    fontSize: '32pt',
                    fontWeight: 700,
                    marginBottom: '4px',
                    letterSpacing: '-1px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {personal.fullName || 'Your Name'}
                </h1>
                {personal.title && (
                    <p style={{
                        fontSize: '14pt',
                        fontWeight: 300,
                        opacity: 0.9,
                        marginBottom: '16px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {personal.title}
                    </p>
                )}

                {/* Contact Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', position: 'relative', zIndex: 1 }}>
                    {personal.email && (
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '9pt' }}>
                            {personal.email}
                        </span>
                    )}
                    {personal.phone && (
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '9pt' }}>
                            {personal.phone}
                        </span>
                    )}
                    {personal.location && (
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '9pt' }}>
                            {personal.location}
                        </span>
                    )}
                    {personal.linkedin && (
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '9pt' }}>
                            LinkedIn
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px 32px' }}>
                {/* Summary */}
                {personal.summary && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%)',
                        borderRadius: '12px'
                    }}>
                        <p style={{
                            fontSize: '11pt',
                            color: '#4B5563',
                            fontStyle: 'italic'
                        }}>
                            "{personal.summary}"
                        </p>
                    </div>
                )}

                {/* Skills as visual tags */}
                {skills.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: '14pt',
                            fontWeight: 600,
                            color: '#6366F1',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>🎯</span> Skills
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {skills.map((skill, idx) => (
                                <span key={idx} style={{
                                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                    color: 'white',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '9pt',
                                    fontWeight: 500
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience Cards */}
                {experience.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: '14pt',
                            fontWeight: 600,
                            color: '#6366F1',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>💼</span> Experience
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {experience.map((exp, idx) => (
                                <div key={exp.id || idx} style={{
                                    padding: '16px',
                                    background: '#F9FAFB',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #6366F1'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '12pt', fontWeight: 600, color: '#1a1a2e' }}>
                                                {exp.role}
                                            </h3>
                                            <p style={{ fontSize: '10pt', color: '#6B7280' }}>
                                                {exp.company}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: '#E5E7EB',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '8pt',
                                            color: '#4B5563'
                                        }}>
                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <p style={{ fontSize: '9pt', color: '#4B5563', whiteSpace: 'pre-line' }}>
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education & Projects Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Education */}
                    {education.length > 0 && (
                        <div>
                            <h2 style={{
                                fontSize: '14pt',
                                fontWeight: 600,
                                color: '#6366F1',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>🎓</span> Education
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={edu.id || idx} style={{ marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '11pt', fontWeight: 600 }}>{edu.degree}</h3>
                                    <p style={{ fontSize: '9pt', color: '#6B7280' }}>{edu.institution}</p>
                                    <p style={{ fontSize: '8pt', color: '#9CA3AF' }}>
                                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            <h2 style={{
                                fontSize: '14pt',
                                fontWeight: 600,
                                color: '#6366F1',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>🚀</span> Projects
                            </h2>
                            {projects.slice(0, 3).map((project, idx) => (
                                <div key={project.id || idx} style={{ marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '11pt', fontWeight: 600 }}>{project.name}</h3>
                                    {project.description && (
                                        <p style={{ fontSize: '9pt', color: '#6B7280' }}>{project.description}</p>
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

CreativeTemplate.displayName = 'CreativeTemplate';

export default CreativeTemplate;
