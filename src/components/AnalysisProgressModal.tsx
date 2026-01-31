import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface Props {
    isOpen: boolean;
}

const steps = [
    "Reading Job Description...",
    "Identifying Key Skills & Requirements...",
    "Analyzing Your Master Profile...",
    "Filtering Irrelevant Experience...",
    "Optimizing for ATS Algorithms...",
    "Restructuring Layout Strategy...",
    "Finalizing Tailored Resume..."
];

const AnalysisProgressModal: React.FC<Props> = ({ isOpen }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            const interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < steps.length - 1) return prev + 1;
                    return prev;
                });
            }, 1500); // Advance step every 1.5s (simulated progress)

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div className="card animate-scale-in" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>

                <div style={{
                    background: 'var(--color-primary-light)',
                    padding: '16px',
                    borderRadius: '50%',
                    marginBottom: '20px',
                    color: 'var(--color-primary)'
                }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: 600 }}>
                    Tailoring Your CV
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', textAlign: 'center' }}>
                    Our AI is analyzing the job description to create the perfect match.
                </p>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {steps.map((step, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            opacity: idx > currentStep ? 0.3 : 1,
                            transition: 'opacity 0.3s ease'
                        }}>
                            {idx < currentStep ? (
                                <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                            ) : idx === currentStep ? (
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--color-primary)',
                                    borderTopColor: 'transparent',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            ) : (
                                <Circle size={18} style={{ color: '#cbd5e1' }} />
                            )}

                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: idx === currentStep ? 600 : 400,
                                color: idx === currentStep ? 'var(--color-text)' : 'var(--color-text-muted)'
                            }}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default AnalysisProgressModal;
