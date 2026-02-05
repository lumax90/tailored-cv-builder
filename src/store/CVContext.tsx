import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CVProfile, AppSettings, JobAnalysis, Application, ApplicationStatus, ImportRecord } from '../types';
import { useAuth } from '../context/AuthContext';

interface CVContextType {
    profile: CVProfile;
    updateProfile: (section: keyof CVProfile, data: any) => void;
    loadProfile: (data: CVProfile) => void;
    resetProfile: () => void;

    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;

    features: {
        currentJobAnalysis: JobAnalysis | null;
        setJobAnalysis: (analysis: JobAnalysis | null) => void;
    };

    applications: Application[];
    addApplication: (app: Application) => void;
    updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
    deleteApplication: (id: string) => void;

    importHistory: ImportRecord[];
    addImportRecord: (record: ImportRecord) => void;
    clearImportHistory: () => void;
}

const initialProfile: CVProfile = {
    personal: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        github: '',
        medium: '',
        summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
    volunteer: [],
    awards: [],
    publications: [],
    references: []
};

const initialSettings: AppSettings = {
    aiModel: 'openai'
};

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const API_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

    // State Declarations
    const [applications, setApplications] = useState<Application[]>([]);
    const [currentJobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
    const [profile, setProfile] = useState<CVProfile>(initialProfile);

    // Settings & History can remain local for now, or move to DB later
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('cv_settings');
        return saved ? JSON.parse(saved) : initialSettings;
    });

    const [importHistory, setImportHistory] = useState<ImportRecord[]>(() => {
        const saved = localStorage.getItem('cv_import_history');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Persistence Effects (Local) ---
    useEffect(() => {
        localStorage.setItem('cv_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (user?.id) {
            localStorage.setItem('cv_import_history', JSON.stringify(importHistory));
        }
    }, [importHistory, user?.id]);

    // --- User Data Isolation (Industry Standard for SaaS) ---
    // Clear localStorage when user ID changes to prevent cross-user data leakage
    useEffect(() => {
        const storedUserId = localStorage.getItem('cv_current_user_id');

        if (user?.id) {
            if (storedUserId && storedUserId !== user.id) {
                // Different user logged in - clear all user-specific data
                console.log('User changed, clearing cached data...');
                localStorage.removeItem('cv_import_history');
                localStorage.removeItem('cv_profile_cache');
                localStorage.removeItem('cv_applications_cache');
                setProfile(initialProfile);
                setImportHistory([]);
                setApplications([]);
            }
            // Store current user ID
            localStorage.setItem('cv_current_user_id', user.id);
        } else {
            // User logged out
            localStorage.removeItem('cv_current_user_id');
        }
    }, [user?.id]);

    // --- API & Data Loading ---
    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchData = async () => {
                try {
                    // 1. Fetch Applications
                    const appRes = await fetch(`${API_URL}/cv/applications`, { credentials: 'include' });
                    const appData = await appRes.json();
                    if (appData.applications) setApplications(appData.applications);

                    // 2. Fetch Master Profile
                    const profileRes = await fetch(`${API_URL}/profile`, { credentials: 'include' });
                    const profileData = await profileRes.json();
                    if (profileData.profile) {
                        setProfile(profileData.profile);
                    } else {
                        // No profile in DB yet - start fresh
                        setProfile(initialProfile);
                    }
                } catch (err) {
                    console.error('Failed to load user data', err);
                }
            };
            fetchData();
        } else {
            // Guest Mode or Logout: Clear sensitive data
            setApplications([]);
            setProfile(initialProfile);
        }
    }, [isAuthenticated, user]);


    // --- Helper Methods ---

    const updateProfile = async (section: keyof CVProfile, data: any) => {
        // Optimistic Update
        const newProfile = { ...profile, [section]: data };
        setProfile(newProfile);

        if (isAuthenticated) {
            try {
                await fetch(`${API_URL}/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ profile: newProfile })
                });
            } catch (error) {
                console.error('Failed to save profile sync', error);
            }
        }
    };

    const loadProfile = (data: CVProfile) => {
        setProfile(data);
        if (isAuthenticated) {
            // sync full load?
            // Maybe better to wait for explicit save, but for imports we might want auto-save.
            // For safety, let's just set state. updateProfile is for granular edits.
            // Accessing updateProfile logic:
            fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ profile: data })
            }).catch(e => console.error(e));
        }
    };

    const resetProfile = async () => {
        setProfile(initialProfile);
        // Clear profile in database
        if (isAuthenticated) {
            try {
                await fetch(`${API_URL}/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ profile: initialProfile })
                });
            } catch (error) {
                console.error('Failed to reset profile in database', error);
            }
        }
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const addImportRecord = (record: ImportRecord) => {
        setImportHistory(prev => [record, ...prev]);
    };

    const clearImportHistory = () => {
        setImportHistory([]);
    };

    // --- Application Actions (SaaS Aware) ---

    const addApplication = async (app: Application) => {
        if (!isAuthenticated) return;

        // Optimistic UI Update
        const tempId = app.id;
        setApplications(prev => [app, ...prev]);

        try {
            const res = await fetch(`${API_URL}/cv/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    jobTitle: app.jobTitle,
                    companyName: app.companyName,
                    jobDescription: app.originalDescription || app.jobDescription,
                    tailoredProfile: app.tailoredProfile,
                    matchScore: app.matchScore
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Replace temp ID with real DB ID
                setApplications(prev => prev.map(a => a.id === tempId ? { ...a, id: data.application.id, createdAt: data.application.createdAt } : a));
            }
        } catch (error) {
            console.error('Failed to save application', error);
        }
    };

    const updateApplicationStatus = async (id: string, status: ApplicationStatus) => {
        // Optimistic update
        setApplications(prev => prev.map(app =>
            app.id === id ? { ...app, status, lastUpdated: new Date().toISOString() } : app
        ));
        
        try {
            const response = await fetch(`${API_URL}/cv/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update application status', error);
            // Revert on failure - refetch applications from server
            try {
                const appRes = await fetch(`${API_URL}/cv/applications`, { credentials: 'include' });
                const appData = await appRes.json();
                if (appData.applications) setApplications(appData.applications);
            } catch (refetchError) {
                console.error('Failed to refetch applications', refetchError);
            }
        }
    };

    const deleteApplication = async (id: string) => {
        setApplications(prev => prev.filter(app => app.id !== id));
        try {
            await fetch(`${API_URL}/cv/applications/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    return (
        <CVContext.Provider value={{
            profile,
            updateProfile,
            loadProfile,
            resetProfile,
            settings,
            updateSettings,
            features: {
                currentJobAnalysis,
                setJobAnalysis
            },
            applications,
            addApplication,
            updateApplicationStatus,
            deleteApplication,
            importHistory,
            addImportRecord,
            clearImportHistory
        }}>
            {children}
        </CVContext.Provider>
    );
};

export const useCV = () => {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCV must be used within a CVProvider');
    }
    return context;
};
