import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: Record<string, unknown>) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

interface TurnstileProps {
    siteKey?: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    resetKey?: number; // Change this to force re-render/reset
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

/**
 * Cloudflare Turnstile Widget Component
 * Uses key-based reset: increment resetKey to get new token
 */
export default function Turnstile({
    siteKey = TURNSTILE_SITE_KEY,
    onVerify,
    onError,
    onExpire,
    resetKey = 0
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Skip if no site key - bypass in dev
        if (!siteKey) {
            console.warn('Turnstile: No site key, bypassing verification');
            onVerify('dev-bypass-token');
            return;
        }

        const renderWidget = () => {
            if (!window.turnstile || !containerRef.current) return;

            // Remove existing widget if any
            if (widgetIdRef.current) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Widget might already be removed
                }
                widgetIdRef.current = null;
            }

            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: onVerify,
                'error-callback': onError || (() => console.error('Turnstile error')),
                'expired-callback': onExpire || (() => console.warn('Turnstile expired')),
                theme: 'light',
                appearance: 'interaction-only'
            });
        };

        // Wait for turnstile script to load
        if (window.turnstile) {
            renderWidget();
        } else {
            const checkInterval = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(checkInterval);
                    renderWidget();
                }
            }, 100);

            // Cleanup interval
            return () => clearInterval(checkInterval);
        }

        // Cleanup on unmount
        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Ignore removal errors
                }
                widgetIdRef.current = null;
            }
        };
    }, [siteKey, onVerify, onError, onExpire, resetKey]); // resetKey change triggers re-render

    // Don't render anything if no site key
    if (!siteKey) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px',
                minHeight: '65px'
            }}
        />
    );
}
