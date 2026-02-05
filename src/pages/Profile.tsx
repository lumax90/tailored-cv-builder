import React, { useState } from 'react';
import { useCV } from '../store/CVContext';
import { Plus, Trash2, Award, Briefcase, GraduationCap, Globe, BookOpen, User, Star, Medal, Users } from 'lucide-react';
import type { Experience, Education, Certification, Project, Language } from '../types';
import { TagInput } from '../components/TagInput';

const Profile: React.FC = () => {
    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <header style={{ marginBottom: 'var(--spacing-8)' }}>
                <h2 className="section-title">Master Profile</h2>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '700px' }}>
                    This is your comprehensive career database. Add <strong>everything</strong> here—every project,
                    skill, and role. Our AI will curate the perfect subset for each job application.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                <PersonalSection />
                <ExperienceSection />
                <EducationSection />
                <SkillsSection />
                <ProjectsSection />

                <h3 style={{ fontSize: '1.25rem', marginTop: 'var(--spacing-8)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                    Additional Qualifications
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-6)' }}>
                    <LanguagesSection />
                    <CertificationsSection />
                </div>

                <VolunteeringSection />
                <AwardsSection />
                <PublicationsSection />
                <ReferencesSection />
            </div>
        </div>
    );
};

// --- Helper Components ---
const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }> = ({ title, icon, children, action }) => (
    <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon && <span style={{ color: 'var(--color-accent)' }}>{icon}</span>}
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>{title}</h3>
            </div>
            {action}
        </div>
        {children}
    </section>
);

const IconButton: React.FC<{ onClick: (e: React.MouseEvent) => void; icon: React.ReactNode; title?: string; className?: string }> = ({ onClick, icon, title, className }) => (
    <button onClick={onClick} style={{ color: 'var(--color-text-muted)', padding: '4px', borderRadius: '4px' }} title={title} className={`hover-bg-accent-subtle ${className}`}>
        {icon}
    </button>
);

const CollapsibleCard: React.FC<{
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onDelete: () => void;
    defaultExpanded?: boolean;
}> = ({ title, subtitle, children, onDelete, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="item-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
                style={{
                    padding: 'var(--spacing-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--color-bg-subtle)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{title || 'New Item'}</h4>
                    {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconButton onClick={(e) => { e.stopPropagation(); onDelete(); }} icon={<Trash2 size={16} />} title="Delete" />
                    <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div style={{ padding: 'var(--spacing-4)' }} className="animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

// --- Sections ---

const PersonalSection: React.FC = () => {
    const { profile, updateProfile } = useCV();
    const { personal } = profile;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateProfile('personal', { ...personal, [e.target.name]: e.target.value });
    };

    return (
        <SectionCard title="Personal Details" icon={<User size={20} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="fullName" value={personal.fullName} onChange={handleChange} className="form-input" placeholder="e.g. Jane Doe" />
                </div>
                <div className="form-group">
                    <label className="form-label">Target Job Title</label>
                    <input name="title" value={personal.title} onChange={handleChange} className="form-input" placeholder="e.g. Senior Product Manager" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input name="email" value={personal.email} onChange={handleChange} className="form-input" placeholder="jane@example.com" />
                </div>
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" value={personal.phone} onChange={handleChange} className="form-input" placeholder="+1 234 567 890" />
                </div>
                <div className="form-group">
                    <label className="form-label">Location</label>
                    <input name="location" value={personal.location} onChange={handleChange} className="form-input" placeholder="New York, NY" />
                </div>
                <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input name="linkedin" value={personal.linkedin} onChange={handleChange} className="form-input" placeholder="linkedin.com/in/..." />
                </div>
                <div className="form-group">
                    <label className="form-label">Portfolio Website</label>
                    <input name="website" value={personal.website} onChange={handleChange} className="form-input" placeholder="janedoe.com" />
                </div>
                <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input name="github" value={personal.github} onChange={handleChange} className="form-input" placeholder="github.com/janedoe" />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Professional Summary</label>
                <textarea
                    name="summary"
                    value={personal.summary}
                    onChange={handleChange}
                    className="form-textarea"
                    rows={4}
                    placeholder="Brief overview of your professional background..."
                />
            </div>
        </SectionCard>
    );
};

const ExperienceSection: React.FC = () => {
    const { profile, updateProfile } = useCV();

    const addExperience = () => {
        const newExp: Experience = {
            id: crypto.randomUUID(),
            company: '',
            role: '',
            location: '',
            locationType: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            technologies: []
        };
        updateProfile('experience', [newExp, ...profile.experience]);
    };

    const removeExperience = (id: string) => {
        updateProfile('experience', profile.experience.filter(e => e.id !== id));
    };

    const updateExp = (id: string, field: keyof Experience, value: any) => {
        updateProfile('experience', profile.experience.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    return (
        <SectionCard
            title="Experience"
            icon={<Briefcase size={20} />}
            action={<button className="btn btn-sm btn-outline" onClick={addExperience}><Plus size={14} /> Add Position</button>}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {profile.experience.map((exp) => (
                    <CollapsibleCard
                        key={exp.id}
                        title={exp.company}
                        subtitle={`${exp.role} ${exp.startDate && exp.endDate ? `• ${exp.startDate} - ${exp.endDate}` : ''}`}
                        onDelete={() => removeExperience(exp.id)}
                        defaultExpanded={!exp.company}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                            <div className="form-group">
                                <label className="form-label">Company</label>
                                <input value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <input value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dates</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} className="form-input" placeholder="Start (MM/YYYY)" />
                                    <input value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} className="form-input" placeholder="End" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location Type</label>
                                <select value={exp.locationType} onChange={e => updateExp(exp.id, 'locationType', e.target.value)} className="form-input">
                                    <option value="">Select...</option>
                                    <option value="onsite">On-site</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description (Achievements & Responsibilities)</label>
                            <textarea
                                value={exp.description}
                                onChange={e => updateExp(exp.id, 'description', e.target.value)}
                                className="form-textarea"
                                rows={4}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tech Stack</label>
                            <TagInput
                                value={exp.technologies}
                                onChange={(tags) => updateExp(exp.id, 'technologies', tags)}
                                placeholder="Add technologies (e.g. React, Node.js)"
                            />
                        </div>
                    </CollapsibleCard>
                ))}

                {profile.experience.length > 0 && (
                    <button className="btn btn-outline" style={{ marginTop: 'var(--spacing-2)' }} onClick={addExperience}>
                        <Plus size={16} /> Add Position
                    </button>
                )}
            </div>
        </SectionCard>
    );
};

const EducationSection: React.FC = () => {
    const { profile, updateProfile } = useCV();

    const addEducation = () => {
        const newEdu: Education = {
            id: crypto.randomUUID(),
            institution: '',
            degree: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            gpa: '',
            coursework: '',
            description: ''
        };
        updateProfile('education', [newEdu, ...profile.education]);
    };

    const updateEdu = (id: string, field: keyof Education, value: any) => {
        updateProfile('education', profile.education.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    return (
        <SectionCard
            title="Education"
            icon={<GraduationCap size={20} />}
            action={<button className="btn btn-sm btn-outline" onClick={addEducation}><Plus size={14} /> Add Education</button>}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {profile.education.map((edu) => (
                    <CollapsibleCard
                        key={edu.id}
                        title={edu.institution}
                        subtitle={edu.degree}
                        onDelete={() => updateProfile('education', profile.education.filter(e => e.id !== edu.id))}
                        defaultExpanded={!edu.institution}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                            <div className="form-group">
                                <label className="form-label">Institution</label>
                                <input value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Degree</label>
                                <input value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dates</label>
                                <input value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} className="form-input" placeholder="Graduation Year" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">GPA (Optional)</label>
                                <input value={edu.gpa} onChange={e => updateEdu(edu.id, 'gpa', e.target.value)} className="form-input" placeholder="e.g. 3.8/4.0" />
                            </div>
                        </div>
                    </CollapsibleCard>
                ))}

                {profile.education.length > 0 && (
                    <button className="btn btn-outline" style={{ marginTop: 'var(--spacing-2)' }} onClick={addEducation}>
                        <Plus size={16} /> Add Education
                    </button>
                )}
            </div>
        </SectionCard>
    );
};

const SkillsSection: React.FC = () => {
    const { profile, updateProfile } = useCV();

    return (
        <SectionCard title="Skills" icon={<Star size={20} />}>
            <div className="form-group">
                <label className="form-label">Technical Skills</label>
                <TagInput
                    value={profile.skills}
                    onChange={(tags) => updateProfile('skills', tags)}
                    placeholder="Add your top skills..."
                />
            </div>
        </SectionCard>
    );
};

const LanguagesSection: React.FC = () => {
    const { profile, updateProfile } = useCV();

    const addLang = () => {
        const newLang: Language = { id: crypto.randomUUID(), language: '', proficiency: 'Fluent' };
        updateProfile('languages', [...(profile.languages || []), newLang]);
    };

    const updateLang = (id: string, field: keyof Language, value: any) => {
        updateProfile('languages', profile.languages.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    return (
        <SectionCard title="Languages" icon={<Globe size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profile.languages?.map(lang => (
                    <div key={lang.id} style={{ display: 'flex', gap: '10px' }}>
                        <input className="form-input" value={lang.language} onChange={e => updateLang(lang.id, 'language', e.target.value)} placeholder="Language" />
                        <select className="form-input" value={lang.proficiency} onChange={e => updateLang(lang.id, 'proficiency', e.target.value)}>
                            <option>Native</option>
                            <option>Fluent</option>
                            <option>Proficient</option>
                            <option>Intermediate</option>
                            <option>Basic</option>
                        </select>
                        <IconButton onClick={() => updateProfile('languages', profile.languages.filter(l => l.id !== lang.id))} icon={<Trash2 size={16} />} />
                    </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={addLang}><Plus size={14} /> Add Language</button>
            </div>
        </SectionCard>
    );
};

const CertificationsSection: React.FC = () => {
    const { profile, updateProfile } = useCV();

    const addCert = () => {
        const newCert: Certification = { id: crypto.randomUUID(), name: '', issuer: '', date: '', url: '' };
        updateProfile('certifications', [...(profile.certifications || []), newCert]);
    };

    const updateCert = (id: string, field: keyof Certification, value: any) => {
        updateProfile('certifications', profile.certifications.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <SectionCard title="Certifications" icon={<Medal size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {profile.certifications?.map(cert => (
                    <div key={cert.id} className="item-card-compact">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input className="form-input" value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} placeholder="Certificate Name" />
                            <input className="form-input" value={cert.issuer} onChange={e => updateCert(cert.id, 'issuer', e.target.value)} placeholder="Issuer" />
                            <input className="form-input" value={cert.date} onChange={e => updateCert(cert.id, 'date', e.target.value)} placeholder="Date" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                            <IconButton onClick={() => updateProfile('certifications', profile.certifications.filter(c => c.id !== cert.id))} icon={<Trash2 size={16} />} />
                        </div>
                    </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={addCert}><Plus size={14} /> Add Cert</button>
            </div>
        </SectionCard>
    );
};

// ... Remaining sections (Projects, Volunteer, Awards, Publications) would follow similar patterns.
// For brevity in this turn, I will finish the file content in the next tool call properly or just dump simpler versions now.
// I'll add them all now to be complete.

const ProjectsSection: React.FC = () => {
    const { profile, updateProfile } = useCV();

    const addProject = () => {
        const newProj: Project = { id: crypto.randomUUID(), name: '', role: '', description: '', link: '', technologies: [] };
        updateProfile('projects', [...profile.projects, newProj]);
    };

    const updateProj = (id: string, field: keyof Project, value: any) => {
        updateProfile('projects', profile.projects.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    return (
        <SectionCard
            title="Projects"
            icon={<BookOpen size={20} />}
            action={<button className="btn btn-sm btn-outline" onClick={addProject}><Plus size={14} /> Add Project</button>}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {profile.projects.map((proj) => (
                    <CollapsibleCard
                        key={proj.id}
                        title={proj.name}
                        subtitle={proj.role}
                        onDelete={() => updateProfile('projects', profile.projects.filter(p => p.id !== proj.id))}
                        defaultExpanded={!proj.name}
                    >
                        <div className="form-group">
                            <label className="form-label">Project Name</label>
                            <input value={proj.name} onChange={e => updateProj(proj.id, 'name', e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Your Role</label>
                            <input value={proj.role} onChange={e => updateProj(proj.id, 'role', e.target.value)} className="form-input" placeholder="Lead Developer, Designer..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea value={proj.description} onChange={e => updateProj(proj.id, 'description', e.target.value)} className="form-textarea" rows={3} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Technologies</label>
                            <TagInput
                                value={proj.technologies}
                                onChange={tags => updateProj(proj.id, 'technologies', tags)}
                                placeholder="Stack used..."
                            />
                        </div>
                    </CollapsibleCard>
                ))}

                {profile.projects.length > 0 && (
                    <button className="btn btn-outline" style={{ marginTop: 'var(--spacing-2)' }} onClick={addProject}>
                        <Plus size={16} /> Add Project
                    </button>
                )}
            </div>
        </SectionCard>
    );
};

const VolunteeringSection: React.FC = () => {
    const { profile, updateProfile } = useCV();
    const addVol = () => updateProfile('volunteer', [...(profile.volunteer || []), { id: crypto.randomUUID(), organization: '', role: '', startDate: '', endDate: '', current: false, description: '' }]);
    return (
        <SectionCard title="Volunteering" icon={<User size={20} />}>
            {profile.volunteer?.map(v => (
                <div key={v.id} className="item-card">
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><IconButton onClick={() => updateProfile('volunteer', profile.volunteer.filter(i => i.id !== v.id))} icon={<Trash2 size={16} />} /></div>
                    <div className="grid-2">
                        <input className="form-input" value={v.organization} onChange={e => updateProfile('volunteer', profile.volunteer.map(i => i.id === v.id ? { ...i, organization: e.target.value } : i))} placeholder="Organization" />
                        <input className="form-input" value={v.role} onChange={e => updateProfile('volunteer', profile.volunteer.map(i => i.id === v.id ? { ...i, role: e.target.value } : i))} placeholder="Role" />
                    </div>
                    <textarea className="form-textarea mt-2" rows={2} value={v.description} onChange={e => updateProfile('volunteer', profile.volunteer.map(i => i.id === v.id ? { ...i, description: e.target.value } : i))} placeholder="Description" />
                </div>
            ))}
            <button className="btn btn-outline mt-4" onClick={addVol}><Plus size={16} /> Add Volunteer Work</button>
        </SectionCard>
    );
};

const AwardsSection: React.FC = () => {
    const { profile, updateProfile } = useCV();
    const addAward = () => updateProfile('awards', [...(profile.awards || []), { id: crypto.randomUUID(), title: '', issuer: '', date: '', description: '' }]);
    return (
        <SectionCard title="Awards" icon={<Award size={20} />}>
            {profile.awards?.map(a => (
                <div key={a.id} className="item-card">
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><IconButton onClick={() => updateProfile('awards', profile.awards.filter(i => i.id !== a.id))} icon={<Trash2 size={16} />} /></div>
                    <div className="grid-2">
                        <input className="form-input" value={a.title} onChange={e => updateProfile('awards', profile.awards.map(i => i.id === a.id ? { ...i, title: e.target.value } : i))} placeholder="Award Title" />
                        <input className="form-input" value={a.issuer} onChange={e => updateProfile('awards', profile.awards.map(i => i.id === a.id ? { ...i, issuer: e.target.value } : i))} placeholder="Issuer" />
                    </div>
                </div>
            ))}
            <button className="btn btn-outline mt-4" onClick={addAward}><Plus size={16} /> Add Award</button>
        </SectionCard>
    );
};

const PublicationsSection: React.FC = () => {
    const { profile, updateProfile } = useCV();
    const addPub = () => updateProfile('publications', [...(profile.publications || []), { id: crypto.randomUUID(), title: '', publisher: '', date: '', description: '' }]);
    return (
        <SectionCard title="Publications" icon={<BookOpen size={20} />}>
            {profile.publications?.map(p => (
                <div key={p.id} className="item-card">
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><IconButton onClick={() => updateProfile('publications', profile.publications.filter(i => i.id !== p.id))} icon={<Trash2 size={16} />} /></div>
                    <input className="form-input mb-2" value={p.title} onChange={e => updateProfile('publications', profile.publications.map(i => i.id === p.id ? { ...i, title: e.target.value } : i))} placeholder="Title" />
                    <input className="form-input" value={p.publisher} onChange={e => updateProfile('publications', profile.publications.map(i => i.id === p.id ? { ...i, publisher: e.target.value } : i))} placeholder="Publisher / Link" />
                </div>
            ))}
            <button className="btn btn-outline mt-4" onClick={addPub}><Plus size={16} /> Add Publication</button>
        </SectionCard>
    );
};

const ReferencesSection: React.FC = () => {
    const { profile, updateProfile } = useCV();
    const addRef = () => updateProfile('references', [...(profile.references || []), { 
        id: crypto.randomUUID(), 
        name: '', 
        title: '', 
        company: '', 
        email: '', 
        phone: '', 
        relationship: '' 
    }]);
    return (
        <SectionCard title="References" icon={<Users size={20} />}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-4)' }}>
                Add professional references who can vouch for your work. These will only be included when explicitly requested.
            </p>
            {profile.references?.map(ref => (
                <div key={ref.id} className="item-card">
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => updateProfile('references', profile.references.filter(i => i.id !== ref.id))} icon={<Trash2 size={16} />} />
                    </div>
                    <div className="grid-2">
                        <input className="form-input" value={ref.name} onChange={e => updateProfile('references', profile.references.map(i => i.id === ref.id ? { ...i, name: e.target.value } : i))} placeholder="Full Name" />
                        <input className="form-input" value={ref.relationship} onChange={e => updateProfile('references', profile.references.map(i => i.id === ref.id ? { ...i, relationship: e.target.value } : i))} placeholder="Relationship (e.g., Former Manager)" />
                    </div>
                    <div className="grid-2 mt-2">
                        <input className="form-input" value={ref.title} onChange={e => updateProfile('references', profile.references.map(i => i.id === ref.id ? { ...i, title: e.target.value } : i))} placeholder="Job Title" />
                        <input className="form-input" value={ref.company} onChange={e => updateProfile('references', profile.references.map(i => i.id === ref.id ? { ...i, company: e.target.value } : i))} placeholder="Company" />
                    </div>
                    <div className="grid-2 mt-2">
                        <input className="form-input" type="email" value={ref.email} onChange={e => updateProfile('references', profile.references.map(i => i.id === ref.id ? { ...i, email: e.target.value } : i))} placeholder="Email" />
                        <input className="form-input" type="tel" value={ref.phone} onChange={e => updateProfile('references', profile.references.map(i => i.id === ref.id ? { ...i, phone: e.target.value } : i))} placeholder="Phone" />
                    </div>
                </div>
            ))}
            <button className="btn btn-outline mt-4" onClick={addRef}><Plus size={16} /> Add Reference</button>
        </SectionCard>
    );
};

export default Profile;
