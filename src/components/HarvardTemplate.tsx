
import { forwardRef } from 'react';
import type { CVProfile, LayoutStrategy } from '../types';

interface Props {
    data: CVProfile;
    layoutStrategy?: LayoutStrategy;
}

const HarvardTemplate = forwardRef<HTMLDivElement, Props>(({ data, layoutStrategy }, ref) => {
    // Defensive destructuring: AI might return partial objects, so we default arrays to []
    const {
        personal = { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '', medium: '', summary: '' },
        experience = [],
        education = [],
        skills = [],
        projects = [],
        languages = [],
        certifications = [],
        volunteer = [],
        awards = [],
        publications = []
    } = data || {};

    return (
        <div ref={ref} className="harvard-cv">
            {/* Header */}
            <header style={{ borderBottom: '1px solid black', paddingBottom: '0.25rem', marginBottom: '1rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{personal.fullName}</h1>
                {personal.title && <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{personal.title}</div>}
                <div style={{ fontSize: '0.9rem' }}>
                    {personal.location && <span>{personal.location}</span>}
                    {personal.phone && <span> • {personal.phone}</span>}
                    {personal.email && <span> • {personal.email}</span>}
                    {personal.linkedin && <span> • <a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></span>}
                    {personal.website && <span> • <a href={personal.website} target="_blank" rel="noreferrer">Portfolio</a></span>}
                    {personal.github && <span> • <a href={personal.github} target="_blank" rel="noreferrer">GitHub</a></span>}
                </div>
            </header>

            {/* Summary - Conditional */}
            {(!layoutStrategy || layoutStrategy.hasIntro) && personal.summary && (
                <section className="cv-section">
                    <h2 className="cv-header">Professional Summary</h2>
                    <div className="cv-description">{personal.summary}</div>
                </section>
            )}

            {/* Dynamic Sections */}
            {(layoutStrategy?.sectionOrder || ['education', 'experience', 'projects', 'skills', 'certifications', 'publications', 'awards', 'volunteer']).map(sectionId => {
                const sectionIdLower = sectionId.toLowerCase();

                if (sectionIdLower === 'education' && education.length > 0) {
                    return (
                        <section key="education" className="cv-section">
                            <h2 className="cv-header">Education</h2>
                            {education.map(edu => (
                                <div key={edu.id} className="cv-item">
                                    <div className="cv-row">
                                        <strong>{edu.institution}</strong>, {edu.location}
                                        <span className="cv-date">{edu.endDate}</span>
                                    </div>
                                    <div className="cv-row" style={{ marginBottom: '0.1rem' }}>
                                        <span>{edu.degree}</span>
                                    </div>
                                    {edu.gpa && <div className="cv-description">GPA: {edu.gpa}</div>}
                                    {edu.coursework && <div className="cv-description">Relevant Coursework: {edu.coursework}</div>}
                                    {edu.description && <div className="cv-description">{edu.description}</div>}
                                </div>
                            ))}
                        </section>
                    );
                }

                if (sectionIdLower === 'experience' && experience.length > 0) {
                    return (
                        <section key="experience" className="cv-section">
                            <h2 className="cv-header">Experience</h2>
                            {experience.map(exp => (
                                <div key={exp.id} className="cv-item">
                                    <div className="cv-row">
                                        <strong>{exp.company}</strong>, {exp.location}
                                        <span className="cv-date">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                                    </div>
                                    <div className="cv-row" style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>
                                        {exp.role}
                                    </div>
                                    {exp.description && <div className="cv-description" style={{ whiteSpace: 'pre-line' }}>{exp.description}</div>}
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <div className="cv-description" style={{ marginTop: '2px', fontStyle: 'italic', fontSize: '0.85em' }}>
                                            Stack: {exp.technologies.join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    );
                }

                if (sectionIdLower === 'projects' && projects.length > 0) {
                    return (
                        <section key="projects" className="cv-section">
                            <h2 className="cv-header">Projects</h2>
                            {projects.map(proj => (
                                <div key={proj.id} className="cv-item">
                                    <div className="cv-row">
                                        <strong>{proj.name}</strong>
                                        {proj.link && <span style={{ fontSize: '0.9em' }}> (<a href={proj.link} target="_blank" rel="noreferrer">Link</a>)</span>}
                                    </div>
                                    <div className="cv-row" style={{ fontStyle: 'italic', marginBottom: '0.1rem' }}>
                                        {proj.role}
                                    </div>
                                    <div className="cv-description">{proj.description}</div>
                                    {proj.technologies.length > 0 && <div className="cv-description" style={{ fontSize: '0.85em', fontStyle: 'italic' }}>Stack: {proj.technologies.join(', ')}</div>}
                                </div>
                            ))}
                        </section>
                    );
                }

                if ((sectionIdLower === 'skills' || sectionIdLower === 'languages') && (skills.length > 0 || languages.length > 0)) {
                    // Combined Skills & Languages usually, but we can separate if strictly requested. 
                    // For Harvard template, they are often combined or adjacent.
                    // To avoid duplicating if 'skills' and 'languages' are both in the list, we'll check if we already rendered it?
                    // Or usually AI will send them as separate items. Let's handle 'skills' as the main trigger for the block.
                    if (sectionIdLower === 'skills') {
                        return (
                            <section key="skills" className="cv-section">
                                <h2 className="cv-header">Skills & Interests</h2>
                                <div className="cv-description">
                                    <div style={{ marginBottom: '4px' }}><strong>Skills:</strong> {skills.join(', ')}</div>
                                    {languages && languages.length > 0 && (
                                        <div>
                                            <strong>Languages:</strong> {languages.map(l => `${l.language} (${l.proficiency})`).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    }
                    // If AI sends 'languages' separately, we might want to handle it, but for now Harvard template groups them.
                    return null;
                }

                if (sectionIdLower === 'certifications' && certifications.length > 0) {
                    return (
                        <section key="certifications" className="cv-section">
                            <h2 className="cv-header">Certifications</h2>
                            {certifications.map(cert => (
                                <div key={cert.id} className="cv-item" style={{ marginBottom: '0.25rem' }}>
                                    <div className="cv-row">
                                        <span><strong>{cert.name}</strong>, {cert.issuer}</span>
                                        <span className="cv-date">{cert.date}</span>
                                    </div>
                                </div>
                            ))}
                        </section>
                    );
                }

                if (sectionIdLower === 'publications' && publications.length > 0) {
                    return (
                        <section key="publications" className="cv-section">
                            <h2 className="cv-header">Publications</h2>
                            {publications.map(pub => (
                                <div key={pub.id} className="cv-item" style={{ marginBottom: '0.25rem' }}>
                                    <div className="cv-description">
                                        <strong>{pub.title}</strong>, {pub.publisher} ({pub.date})
                                    </div>
                                </div>
                            ))}
                        </section>
                    );
                }

                if (sectionIdLower === 'awards' && awards.length > 0) {
                    return (
                        <section key="awards" className="cv-section">
                            <h2 className="cv-header">Honors & Awards</h2>
                            {awards.map(award => (
                                <div key={award.id} className="cv-item" style={{ marginBottom: '0.25rem' }}>
                                    <div className="cv-row">
                                        <span><strong>{award.title}</strong>, {award.issuer}</span>
                                        <span className="cv-date">{award.date}</span>
                                    </div>
                                </div>
                            ))}
                        </section>
                    );
                }

                if (sectionIdLower === 'volunteer' && volunteer.length > 0) {
                    return (
                        <section key="volunteer" className="cv-section">
                            <h2 className="cv-header">Volunteering</h2>
                            {volunteer.map(vol => (
                                <div key={vol.id} className="cv-item">
                                    <div className="cv-row">
                                        <strong>{vol.organization}</strong>
                                        <span className="cv-date">{vol.startDate} – {vol.endDate || 'Present'}</span>
                                    </div>
                                    <div className="cv-row" style={{ fontStyle: 'italic' }}>{vol.role}</div>
                                    <div className="cv-description">{vol.description}</div>
                                </div>
                            ))}
                        </section>
                    );
                }

                return null;
            })}

            <style>{`
        .harvard-cv {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
          padding: 0.5in;
          max-width: 8.5in;
          margin: 0 auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .cv-section {
          margin-bottom: 0.75rem;
        }
        .cv-header {
          font-size: 11pt;
          text-transform: uppercase;
          border-bottom: 1px solid black;
          margin-bottom: 0.4rem;
          font-weight: bold;
        }
        .cv-item {
          margin-bottom: 0.5rem;
        }
        .cv-row {
          display: flex;
          justify-content: space-between;
        }
        .cv-date {
          white-space: nowrap;
        }
        .cv-description {
          font-size: 10.5pt;
          text-align: justify;
        }
        a { color: inherit; text-decoration: none; }
        
        @media print {
          .harvard-cv {
            padding: 0;
            box-shadow: none;
            width: 100%;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      `}</style>
        </div>
    );
});

export default HarvardTemplate;

