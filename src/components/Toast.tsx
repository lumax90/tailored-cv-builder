import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (type: ToastType, message: string, duration?: number) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
    success: {
        bg: '#ECFDF5',
        border: '#10B981',
        icon: <CheckCircle size={20} color="#059669" />
    },
    error: {
        bg: '#FEF2F2',
        border: '#EF4444',
        icon: <XCircle size={20} color="#DC2626" />
    },
    warning: {
        bg: '#FFFBEB',
        border: '#F59E0B',
        icon: <AlertCircle size={20} color="#D97706" />
    },
    info: {
        bg: '#EFF6FF',
        border: '#3B82F6',
        icon: <Info size={20} color="#2563EB" />
    }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                dismissToast(id);
            }, duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 9999,
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => {
                    const style = toastStyles[toast.type];
                    return (
                        <div
                            key={toast.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                background: style.bg,
                                borderLeft: `4px solid ${style.border}`,
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                minWidth: '300px',
                                maxWidth: '420px',
                                pointerEvents: 'auto',
                                animation: 'slideInRight 0.3s ease-out'
                            }}
                        >
                            {style.icon}
                            <p style={{ flex: 1, fontSize: '0.9rem', color: '#1F2937' }}>
                                {toast.message}
                            </p>
                            <button
                                onClick={() => dismissToast(toast.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    color: '#6B7280'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
