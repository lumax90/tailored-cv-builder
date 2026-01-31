import React, { useRef, useState } from 'react';
import { useCV } from '../store/CVContext';
import { useAuth } from '../context/AuthContext';
import { Download, Upload, User, Shield, Trash2, AlertCircle, Cpu, ChevronDown } from 'lucide-react';

type AIModel = 'openai' | 'gemini' | 'grok';

const AI_MODELS: { id: AIModel; name: string; description: string }[] = [
    { id: 'openai', name: 'OpenAI GPT-4', description: 'Most capable, best for complex analysis' },
    { id: 'gemini', name: 'Google Gemini', description: 'Fast and efficient, great for speed' },
    { id: 'grok', name: 'xAI Grok', description: 'Latest model, good balance' },
];

const Settings: React.FC = () => {
    const { profile, loadProfile, resetProfile, settings, updateSettings } = useCV();
    const { user, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    const currentModel = AI_MODELS.find(m => m.id === (settings?.aiModel || 'openai')) || AI_MODELS[0];

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "cv_master_profile.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json.personal && json.experience) {
                    loadProfile(json);
                    alert('Profile restored successfully!');
                } else {
                    alert('Invalid profile file.');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(fileObj);
        event.target.value = '';
    };

    const handleResetProfile = () => {
        if (window.confirm('Are you sure you want to reset your profile? This will delete all your data.')) {
            resetProfile();
        }
    };

    const handleModelChange = (modelId: AIModel) => {
        updateSettings({ aiModel: modelId });
        setShowModelDropdown(false);
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: 'var(--spacing-8)' }}>
                <h2 className="section-title">Settings</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Manage your account, AI preferences, and data.
                </p>
            </header>

            {/* AI Model Preference */}
            <section className="card" style={{ maxWidth: '600px', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                    <div style={{ padding: '10px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', borderRadius: 'var(--radius-md)' }}>
                        <Cpu size={24} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>AI Model</h3>
                </div>

                <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)', fontSize: '0.9rem' }}>
                    Choose which AI model to use for CV analysis and generation.
                </p>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--spacing-4)',
                            background: 'var(--color-bg-subtle)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        <div>
                            <p style={{ fontWeight: 600, marginBottom: '2px' }}>{currentModel.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{currentModel.description}</p>
                        </div>
                        <ChevronDown size={20} style={{
                            transform: showModelDropdown ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                        }} />
                    </button>

                    {showModelDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: 'white',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 100,
                            overflow: 'hidden'
                        }}>
                            {AI_MODELS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelChange(model.id)}
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        padding: 'var(--spacing-3) var(--spacing-4)',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: settings?.aiModel === model.id ? 'var(--color-accent-bg)' : 'transparent',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--color-border-subtle)'
                                    }}
                                >
                                    <p style={{ fontWeight: 500, marginBottom: '2px' }}>
                                        {model.name}
                                        {settings?.aiModel === model.id && <span style={{ marginLeft: '8px', color: 'var(--color-primary)' }}>✓</span>}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{model.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Account Section */}
            <section className="card" style={{ maxWidth: '600px', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                    <div style={{ padding: '10px', background: 'var(--color-accent-bg)', borderRadius: 'var(--radius-md)' }}>
                        <User size={24} color="var(--color-primary)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Account</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Email</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Subscription</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                {user?.subscriptionTier || 'FREE'} Plan
                            </p>
                        </div>
                        <a href="/billing" className="btn btn-outline btn-sm">
                            Manage Plan
                        </a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Usage This Month</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                {user?.usageCount || 0} CV generations used
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Management Section */}
            <section className="card" style={{ maxWidth: '600px', marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                    <div style={{ padding: '10px', background: '#EFF6FF', borderRadius: 'var(--radius-md)' }}>
                        <Shield size={24} color="#3B82F6" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Data Management</h3>
                </div>

                <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)', fontSize: '0.9rem' }}>
                    Your Master Profile is securely stored in the cloud and synced across your devices.
                    You can download a backup copy or restore from a file below.
                </p>

                <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={handleExport}>
                        <Download size={16} /> Backup Profile
                    </button>
                    <button className="btn btn-outline" onClick={handleImportClick}>
                        <Upload size={16} /> Restore Backup
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </div>
            </section>

            {/* Danger Zone */}
            <section className="card" style={{ maxWidth: '600px', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                    <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
                        <AlertCircle size={24} color="#DC2626" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: '#DC2626' }}>Danger Zone</h3>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-outline"
                        style={{ color: '#DC2626', borderColor: '#FECACA' }}
                        onClick={handleResetProfile}
                    >
                        <Trash2 size={16} /> Reset Profile
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ color: '#DC2626', borderColor: '#FECACA' }}
                        onClick={logout}
                    >
                        Sign Out
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Settings;
