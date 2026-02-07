import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    fullName?: string;
    subscriptionTier: 'FREE' | 'STARTER' | 'PRO' | 'UNLIMITED';
    usageCount: number;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
    register: (email: string, password: string, fullName: string, turnstileToken?: string) => Promise<{ needsVerification?: boolean }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = import.meta.env.DEV ? 'http://localhost:3000/api/auth' : '/api/auth';

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_URL}/me`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string, turnstileToken?: string) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password, turnstileToken }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await res.json();

        if (!res.ok) {
            // Check if needs email verification
            if (data.needsVerification) {
                throw new Error('Please verify your email before logging in. Check your inbox.');
            }
            throw new Error(data.error || 'Login failed');
        }

        setUser(data.user);
    };

    const register = async (email: string, password: string, fullName: string, turnstileToken?: string) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName, turnstileToken }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Don't set user - they need to verify email first
        // Return data so caller can redirect to verification page
        return { needsVerification: true };
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.error('Logout failed', e);
        }
        setUser(null);
        window.location.href = '/auth';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser: checkAuth, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
