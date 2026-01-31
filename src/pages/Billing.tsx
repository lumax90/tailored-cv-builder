import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';

interface PlanPricing {
    monthly: { price: string; variantId: string };
    annual: { price: string; variantId: string; savings: string };
}

interface PlanInfo {
    name: string;
    tier: string;
    pricing: PlanPricing;
    credits: string;
    features: string[];
    icon: React.ElementType;
    popular?: boolean;
}

const Billing: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

    // Check for success/cancel from LemonSqueezy redirect
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const newTier = searchParams.get('tier');

    const plans: PlanInfo[] = [
        {
            name: 'Starter',
            tier: 'STARTER',
            pricing: {
                monthly: { price: '$6.95', variantId: 'LEMON_STARTER_MONTHLY' },
                annual: { price: '$4.95', variantId: 'LEMON_STARTER_ANNUAL', savings: 'Save $24/yr' }
            },
            credits: '15 + 5 Bonus CVs',
            features: ['All CV Templates', 'PDF Export', 'ATS Score Checker', 'Email Support'],
            icon: Star,
            popular: false
        },
        {
            name: 'Pro',
            tier: 'PRO',
            pricing: {
                monthly: { price: '$17.95', variantId: 'LEMON_PRO_MONTHLY' },
                annual: { price: '$14.95', variantId: 'LEMON_PRO_ANNUAL', savings: 'Save $36/yr' }
            },
            credits: '50 + 20 Bonus CVs',
            features: ['All CV Templates', 'AI Analysis (GPT-4)', 'Cover Letter Generator', 'Interview Prep', 'Email Support'],
            icon: Zap,
            popular: true
        },
        {
            name: 'Unlimited',
            tier: 'UNLIMITED',
            pricing: {
                monthly: { price: '$44.95', variantId: 'LEMON_UNLIMITED_MONTHLY' },
                annual: { price: '$39.95', variantId: 'LEMON_UNLIMITED_ANNUAL', savings: 'Save $60/yr' }
            },
            credits: 'Unlimited CVs',
            features: ['All CV Templates', 'All AI Features', 'Priority Support', 'API Access', 'Team Collaboration'],
            icon: Crown,
            popular: false
        }
    ];

    const handleUpgrade = async (plan: PlanInfo) => {
        if (plan.tier === user?.subscriptionTier) return;

        setLoadingPlan(plan.tier);
        setError(null);

        const variantId = billingCycle === 'monthly'
            ? plan.pricing.monthly.variantId
            : plan.pricing.annual.variantId;

        try {
            const response = await fetch(`${API_BASE_URL}/lemonsqueezy/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    variantId,
                    tier: plan.tier,
                    billingCycle
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create checkout session');
            }

            const { url } = await response.json();

            // Redirect to LemonSqueezy Checkout
            window.location.href = url;
        } catch (err: any) {
            setError(err.message);
            setLoadingPlan(null);
        }
    };

    const handleManageSubscription = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/lemonsqueezy/portal`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to open customer portal');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (err: any) {
            setError(err.message);
        }
    };

    const isCurrentPlan = (tier: string) => user?.subscriptionTier === tier;

    const getCurrentPrice = (plan: PlanInfo) => {
        return billingCycle === 'monthly' ? plan.pricing.monthly.price : plan.pricing.annual.price;
    };

    const isFreeTier = user?.subscriptionTier === 'FREE';

    return (
        <div className="animate-fade-in">
            {/* Paywall Banner for FREE users */}
            {isFreeTier && (
                <div style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                    color: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    marginBottom: '32px',
                    textAlign: 'center'
                }}>
                    <Sparkles size={40} style={{ marginBottom: '16px', opacity: 0.9 }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
                        Welcome to TailoredAIResume! 🎉
                    </h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: '8px', maxWidth: '600px', margin: '0 auto 16px' }}>
                        Choose a plan below to unlock AI-powered resume tailoring, ATS optimization,
                        cover letter generation, and interview preparation tools.
                    </p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        All plans include a 7-day money-back guarantee.
                    </p>
                </div>
            )}

            <header style={{ marginBottom: 'var(--spacing-6)', textAlign: 'center' }}>
                <h2 className="section-title">
                    {isFreeTier ? 'Choose Your Plan' : 'Subscription Plans'}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    {isFreeTier
                        ? 'Start building professional, ATS-optimized resumes today.'
                        : 'Upgrade or downgrade at any time. Cancel anytime.'}
                </p>
            </header>

            {/* Billing Cycle Toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-6)',
                gap: '4px'
            }}>
                <div style={{
                    display: 'flex',
                    background: 'var(--color-bg-subtle)',
                    borderRadius: '100px',
                    padding: '4px',
                    border: '1px solid var(--color-border)'
                }}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '100px',
                            border: 'none',
                            background: billingCycle === 'monthly' ? 'white' : 'transparent',
                            boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '100px',
                            border: 'none',
                            background: billingCycle === 'annual' ? 'white' : 'transparent',
                            boxShadow: billingCycle === 'annual' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Annual
                        <span style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                        }}>
                            SAVE 30%
                        </span>
                    </button>
                </div>
            </div>

            {/* Success/Cancel Messages */}
            {success && (
                <div style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-6)',
                    textAlign: 'center',
                    color: '#166534'
                }}>
                    <strong>🎉 Success!</strong> Your subscription to {newTier} plan is now active.
                </div>
            )}

            {canceled && (
                <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-6)',
                    textAlign: 'center',
                    color: '#92400E'
                }}>
                    Checkout was canceled. You can try again anytime.
                </div>
            )}

            {error && (
                <div style={{
                    background: '#FEE2E2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-6)',
                    textAlign: 'center',
                    color: '#991B1B'
                }}>
                    {error}
                </div>
            )}

            {/* Current Plan Badge */}
            {user?.subscriptionTier && user.subscriptionTier !== 'FREE' && (
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-6)'
                }}>
                    <span style={{
                        background: 'var(--color-accent-bg)',
                        color: 'var(--color-primary)',
                        padding: '8px 16px',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        Current Plan: {user.subscriptionTier}
                    </span>
                    <button
                        onClick={handleManageSubscription}
                        style={{
                            marginLeft: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '0.9rem'
                        }}
                    >
                        Manage Subscription <ExternalLink size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                    </button>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-6)',
                maxWidth: '1100px',
                margin: '0 auto'
            }}>
                {plans.map((plan) => (
                    <div key={plan.name} className="card" style={{
                        position: 'relative',
                        border: plan.popular ? '2px solid var(--color-primary)' : undefined,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {plan.popular && (
                            <span style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                color: 'white',
                                padding: '4px 14px',
                                borderRadius: '100px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Sparkles size={12} /> Most Popular
                            </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
                            <div style={{
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-accent-bg)',
                                color: 'var(--color-primary)'
                            }}>
                                <plan.icon size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{plan.name}</h3>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-2)' }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 700 }}>{getCurrentPrice(plan)}</span>
                            <span style={{ color: 'var(--color-text-muted)' }}>/month</span>
                        </div>

                        {billingCycle === 'annual' && (
                            <div style={{
                                marginBottom: 'var(--spacing-4)',
                                fontSize: '0.8rem',
                                color: '#059669',
                                fontWeight: 600
                            }}>
                                {plan.pricing.annual.savings}
                            </div>
                        )}
                        {billingCycle === 'monthly' && (
                            <div style={{ marginBottom: 'var(--spacing-4)', height: '20px' }}></div>
                        )}

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-6) 0', flex: 1 }}>
                            <li style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontWeight: 600 }}>
                                <Check size={18} color="#10B981" />
                                {plan.credits}
                            </li>
                            {plan.features.map((feature, i) => (
                                <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <Check size={16} color="#10B981" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`btn ${isCurrentPlan(plan.tier) ? 'btn-outline' : plan.popular ? 'btn-primary' : 'btn-outline'}`}
                            style={{
                                width: '100%',
                                background: plan.popular && !isCurrentPlan(plan.tier) ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' : undefined
                            }}
                            disabled={isCurrentPlan(plan.tier) || loadingPlan !== null}
                            onClick={() => handleUpgrade(plan)}
                        >
                            {loadingPlan === plan.tier ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Redirecting...
                                </>
                            ) : isCurrentPlan(plan.tier) ? (
                                'Current Plan'
                            ) : (
                                'Get Started'
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Usage Info */}
            <div style={{
                textAlign: 'center',
                marginTop: 'var(--spacing-8)',
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem'
            }}>
                <p>
                    This month's usage: <strong>{user?.usageCount || 0}</strong> CV generations
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Secure payments powered by LemonSqueezy 🍋
                </p>
            </div>
        </div>
    );
};

export default Billing;
