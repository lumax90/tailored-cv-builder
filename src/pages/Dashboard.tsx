import React from 'react';
import { useCV } from '../store/CVContext';
import { Briefcase, Calendar, FileText, Trash2, TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ApplicationStatus } from '../types';
import { calculateATSScore, getATSScoreColor, getATSScoreLabel } from '../utils/atsScore';

const statusColors: Record<ApplicationStatus, string> = {
    applied: '#3B82F6',
    interviewing: '#F59E0B',
    offer: '#10B981',
    rejected: '#EF4444',
    accepted: '#059669',
    archived: '#6B7280'
};

const statusLabels: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer Received',
    rejected: 'Rejected',
    accepted: 'Accepted',
    archived: 'Archived'
};

const Dashboard: React.FC = () => {
    const { applications, deleteApplication, updateApplicationStatus, features, profile } = useCV();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    // Calculate metrics
    const totalApplications = applications.length;
    const activeApplications = applications.filter(a => ['applied', 'interviewing'].includes(a.status)).length;
    const successfulApplications = applications.filter(a => ['offer', 'accepted'].includes(a.status)).length;
    const successRate = totalApplications > 0 ? Math.round((successfulApplications / totalApplications) * 100) : 0;

    // Calculate ATS score for current profile
    const atsResult = calculateATSScore(profile);
    const atsColor = getATSScoreColor(atsResult.score);
    const atsLabel = getATSScoreLabel(atsResult.score);

    const filteredApplications = applications.filter(app =>
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewApplication = (app: any) => {
        features.setJobAnalysis({
            originalDescription: app.jobDescription,
            tailoredProfile: app.tailoredProfile,
            suggestions: [],
            layoutStrategy: app.tailoredProfile.layoutStrategy,
            matchScore: app.matchScore
        });
        navigate('/preview');
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: 'var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="section-title">Dashboard</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Track applications and monitor your profile strength.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/job-analysis')}>
                    <Briefcase size={18} /> New Application
                </button>
            </header>

            {/* Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                {/* ATS Score Card */}
                <div className="card" style={{
                    background: `linear-gradient(135deg, ${atsColor}10 0%, ${atsColor}05 100%)`,
                    borderLeft: `4px solid ${atsColor}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                        <Target size={20} color={atsColor} />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>ATS Score</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: atsColor }}>{atsResult.score}</span>
                        <span style={{ color: atsColor, fontSize: '0.9rem' }}>{atsLabel}</span>
                    </div>
                    {atsResult.suggestions.length > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                            Tip: {atsResult.suggestions[0]}
                        </p>
                    )}
                </div>

                {/* Total Applications */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #3B82F610 0%, #3B82F605 100%)',
                    borderLeft: '4px solid #3B82F6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                        <Briefcase size={20} color="#3B82F6" />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Applications</span>
                    </div>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>{totalApplications}</span>
                </div>

                {/* Active */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #F59E0B10 0%, #F59E0B05 100%)',
                    borderLeft: '4px solid #F59E0B'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                        <TrendingUp size={20} color="#F59E0B" />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Active</span>
                    </div>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{activeApplications}</span>
                </div>

                {/* Success Rate */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #10B98110 0%, #10B98105 100%)',
                    borderLeft: '4px solid #10B981'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                        <Award size={20} color="#10B981" />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Success Rate</span>
                    </div>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{successRate}%</span>
                </div>
            </div>

            {/* Applications Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={18} /> Applications
                </h3>
                {applications.length > 0 && (
                    <div style={{ position: 'relative', maxWidth: '280px', width: '100%' }}>
                        <input
                            className="form-input"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px', fontSize: '0.85rem', padding: '8px 12px 8px 36px' }}
                        />
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                )}
            </div>

            {applications.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-8)',
                    color: 'var(--color-text-muted)',
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <Briefcase size={40} style={{ margin: '0 auto var(--spacing-3)', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-2)' }}>No Applications Yet</h3>
                    <p style={{ fontSize: '0.9rem' }}>Analyze a job description to create your first tailored CV.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                    {filteredApplications.map(app => (
                        <div key={app.id} className="card" style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 1.5fr) auto auto auto auto',
                            alignItems: 'center',
                            gap: 'var(--spacing-4)',
                            padding: 'var(--spacing-4)',
                            transition: 'all 0.2s ease',
                        }}>
                            {/* Job Info */}
                            <div>
                                <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '2px' }}>{app.jobTitle}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    <Briefcase size={12} />
                                    <span>{app.companyName}</span>
                                </div>
                            </div>

                            {/* Match Score */}
                            {app.matchScore && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    background: app.matchScore >= 80 ? '#DCFCE7' : app.matchScore >= 60 ? '#FEF3C7' : '#FEE2E2',
                                    color: app.matchScore >= 80 ? '#166534' : app.matchScore >= 60 ? '#92400E' : '#991B1B',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}>
                                    <Target size={12} />
                                    {app.matchScore}%
                                </div>
                            )}

                            {/* Date */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                <Calendar size={12} />
                                <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
                            </div>

                            {/* Status */}
                            <select
                                value={app.status}
                                onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    border: `1px solid ${statusColors[app.status]}`,
                                    color: statusColors[app.status],
                                    background: `${statusColors[app.status]}10`,
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '130px'
                                }}
                            >
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleViewApplication(app)}
                                    title="View Resume"
                                    style={{ padding: '6px' }}
                                >
                                    <FileText size={16} />
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => deleteApplication(app.id)}
                                    title="Delete"
                                    style={{ padding: '6px', color: '#DC2626', borderColor: '#FECACA' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
