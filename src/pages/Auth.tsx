import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Lock, Mail, ArrowRight, Loader2, CheckCircle, FileText, Zap, Shield } from 'lucide-react';
import Turnstile from '../components/Turnstile';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>('');
    const [turnstileResetKey, setTurnstileResetKey] = useState(0);
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password, turnstileToken);
                navigate('/');
            } else {
                const result = await register(formData.email, formData.password, formData.fullName, turnstileToken);
                if (result?.needsVerification) {
                    setShowVerificationMessage(true);
                    // Redirect to verify-email page after short delay
                    setTimeout(() => navigate('/verify-email'), 2000);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            // Reset Turnstile to get fresh token
            setTurnstileResetKey(k => k + 1);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: FileText, text: 'AI-powered resume tailoring' },
        { icon: Zap, text: 'Beat ATS with optimized keywords' },
        { icon: CheckCircle, text: 'Cover letters & interview prep' },
        { icon: Shield, text: 'Your data is secure & private' }
    ];

    // Show verification success message
    if (showVerificationMessage) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '48px',
                    textAlign: 'center',
                    maxWidth: '420px'
                }}>
                    <Mail size={48} style={{ color: '#6366F1', marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '12px' }}>
                        Check Your Email! 📬
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                        We've sent a verification link to <strong>{formData.email}</strong>.
                        Please click the link to activate your account.
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        Redirecting...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
            {/* Left Side - Branding & Features */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}>
                            TAR
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>TailoredAIResume</h1>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '20px' }}>
                        Land your dream job with AI-powered resumes
                    </h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '40px', lineHeight: 1.6 }}>
                        Create tailored resumes that pass ATS systems and impress recruiters.
                        Our AI analyzes job descriptions and optimizes your resume for each application.
                    </p>

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {features.map((feature, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <feature.icon size={18} />
                                </div>
                                <span style={{ fontSize: '1rem' }}>{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Social Proof */}
                    <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: `hsl(${i * 40}, 70%, 60%)`,
                                        border: '2px solid rgba(255,255,255,0.8)',
                                        marginLeft: i > 1 ? '-8px' : 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}>
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Join 10,000+ professionals</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>who landed interviews with TailoredAIResume</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Form Header */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p style={{ color: '#64748b' }}>
                            {isLogin
                                ? 'Enter your credentials to access your dashboard'
                                : 'Start building professional resumes in minutes'
                            }
                        </p>
                    </div>

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserCircle size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 44px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#6366F1'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 44px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>
                                    Password
                                </label>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 44px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: '#FEF2F2',
                                color: '#DC2626',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Cloudflare Turnstile - Bot Protection */}
                        <Turnstile onVerify={handleTurnstileVerify} resetKey={turnstileResetKey} />

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                opacity: isLoading ? 0.7 : 1,
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Register */}
                    <div style={{
                        marginTop: '28px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        color: '#64748b'
                    }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#6366F1',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>

                    {/* Terms */}
                    {!isLogin && (
                        <p style={{
                            marginTop: '20px',
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            textAlign: 'center',
                            lineHeight: 1.5
                        }}>
                            By creating an account, you agree to our{' '}
                            <a href="#" style={{ color: '#6366F1' }}>Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" style={{ color: '#6366F1' }}>Privacy Policy</a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
