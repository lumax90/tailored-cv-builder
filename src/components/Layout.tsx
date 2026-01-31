import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UserCircle, FileText, Settings, Briefcase, LayoutDashboard, Download, LogOut, CreditCard, PenTool, MessageSquare } from 'lucide-react';
import '../styles/variables.css';
import { useAuth } from '../context/AuthContext';

const AuthUserFooter = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <UserCircle size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.fullName || 'User'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{user.subscriptionTier} Plan</span>
            </div>
            <button onClick={logout} title="Logout" style={{ color: 'var(--color-text-muted)', padding: '4px' }}>
                <LogOut size={16} />
            </button>
        </div>
    );
};

const Layout: React.FC = () => {
    return (
        <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                padding: 'var(--spacing-6)',
                borderRight: '1px solid var(--color-border)',
                position: 'fixed',
                height: '100vh',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Identity / Brand */}
                <div style={{
                    padding: '0 var(--spacing-2)',
                    marginBottom: 'var(--spacing-8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        letterSpacing: '-0.5px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                        TAR
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.1 }}>TailoredAI</h1>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.5px' }}>RESUME BUILDER</span>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <UserCircle size={18} /> Profile
                    </NavLink>
                    <NavLink to="/import" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Download size={18} /> Import Hub
                    </NavLink>
                    <NavLink to="/job-analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Briefcase size={18} /> Job Analysis
                    </NavLink>
                    <NavLink to="/preview" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={18} /> Preview & Export
                    </NavLink>
                    <NavLink to="/cover-letter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <PenTool size={18} /> Cover Letter
                    </NavLink>
                    <NavLink to="/interview-prep" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <MessageSquare size={18} /> Interview Prep
                    </NavLink>
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: 'var(--spacing-2) 0' }}></div>
                    <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={18} /> Settings
                    </NavLink>
                    <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <CreditCard size={18} /> Plans & Billing
                    </NavLink>
                </div>

                {/* Footer User Profile */}
                <AuthUserFooter />
            </aside>


            {/* Main Content */}
            <main style={{ marginLeft: '280px', flex: 1, padding: 'var(--spacing-8)' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div >
    );
};

export default Layout;
