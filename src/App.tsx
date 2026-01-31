import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import JobMatch from './pages/JobMatch';
import Preview from './pages/Preview';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import ImportHub from './pages/ImportHub';
import AuthPage from './pages/Auth';
import VerifyEmail from './pages/VerifyEmail';
import CoverLetter from './pages/CoverLetter';
import InterviewPrep from './pages/InterviewPrep';
import { CVProvider } from './store/CVContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { RequireSubscription } from './components/RequireSubscription';

/**
 * RequireAuth - Authentication Guard
 * Redirects unauthenticated users to /auth
 */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#F9F9F7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            borderRadius: '12px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            TAR
          </div>
          <p style={{ color: '#5F6368' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CVProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              {/* Authenticated Routes with Layout */}
              <Route element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }>
                {/* Billing & Settings - Accessible to FREE users (paywall page) */}
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />

                {/* Protected Routes - Require active subscription */}
                <Route path="/" element={
                  <RequireSubscription>
                    <Dashboard />
                  </RequireSubscription>
                } />
                <Route path="/profile" element={
                  <RequireSubscription>
                    <Profile />
                  </RequireSubscription>
                } />
                <Route path="/import" element={
                  <RequireSubscription>
                    <ImportHub />
                  </RequireSubscription>
                } />
                <Route path="/job-analysis" element={
                  <RequireSubscription>
                    <JobMatch />
                  </RequireSubscription>
                } />
                <Route path="/preview" element={
                  <RequireSubscription>
                    <Preview />
                  </RequireSubscription>
                } />
                <Route path="/cover-letter" element={
                  <RequireSubscription>
                    <CoverLetter />
                  </RequireSubscription>
                } />
                <Route path="/interview-prep" element={
                  <RequireSubscription>
                    <InterviewPrep />
                  </RequireSubscription>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </CVProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
