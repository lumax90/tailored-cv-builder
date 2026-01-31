import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('no-token');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/auth/verify-email/${token}`, {
                    credentials: 'include'
                });
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                    // Redirect to billing after 2 seconds
                    setTimeout(() => navigate('/billing'), 2000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                {/* Logo */}
                <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                    borderRadius: '14px',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    TAR
                </div>

                {status === 'loading' && (
                    <>
                        <Loader2 size={48} style={{ color: '#6366F1', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '8px' }}>
                            Verifying your email...
                        </h2>
                        <p style={{ color: '#6b7280' }}>Please wait a moment</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '8px' }}>
                            Email Verified! 🎉
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{message}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                            Redirecting to billing...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={48} style={{ color: '#EF4444', marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '8px' }}>
                            Verification Failed
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{message}</p>
                        <Link
                            to="/auth"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: 600
                            }}
                        >
                            Back to Login
                        </Link>
                    </>
                )}

                {status === 'no-token' && (
                    <>
                        <Mail size={48} style={{ color: '#6366F1', marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '8px' }}>
                            Check Your Email
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                            We've sent a verification link to your email address.
                            Please click the link to verify your account.
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                            Didn't receive the email? Check your spam folder or{' '}
                            <Link to="/auth" style={{ color: '#6366F1' }}>request a new link</Link>.
                        </p>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
