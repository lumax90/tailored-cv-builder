import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RequireSubscription - Paywall Guard
 * 
 * Redirects FREE tier users to the billing page.
 * Used for all protected routes that require an active subscription.
 * 
 * Pages that bypass this guard (accessible to FREE users):
 * - /billing (so they can purchase)
 * - /settings (account management)
 */
export const RequireSubscription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Still loading auth state
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--color-bg)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#6366F1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - this shouldn't happen as RequireAuth runs first
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // FREE tier user - redirect to billing
    if (user.subscriptionTier === 'FREE') {
        return <Navigate to="/billing" state={{ from: location }} replace />;
    }

    // User has active subscription - allow access
    return <>{children}</>;
};

/**
 * Helper hook to check subscription status
 */
export const useSubscription = () => {
    const { user } = useAuth();

    return {
        tier: user?.subscriptionTier || 'FREE',
        hasActiveSubscription: user?.subscriptionTier && user.subscriptionTier !== 'FREE',
        usageCount: user?.usageCount || 0,
        isStarter: user?.subscriptionTier === 'STARTER',
        isPro: user?.subscriptionTier === 'PRO',
        isUnlimited: user?.subscriptionTier === 'UNLIMITED',
    };
};

export default RequireSubscription;
