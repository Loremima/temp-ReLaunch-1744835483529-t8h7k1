import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components';
import { Prospects as ProspectsComponents } from './components';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import Templates from './pages/Templates';
import History from './pages/History';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './contexts/AuthContext';

// Composants temporaires pour les pages non encore implémentées
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold mb-4">{title}</h1>
    <p>Cette fonctionnalité sera bientôt disponible.</p>
  </div>
);

const UploadProspects = () => <PlaceholderPage title="Importer des prospects" />;
const ScheduleFollowUps = () => <PlaceholderPage title="Planifier des relances" />;

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect from landing page when logged in
  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/app/dashboard');
    }
  }, [user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900">
      <Routes>
        {/* Public routes - only accessible when not logged in */}
        <Route path="/" element={user ? <Navigate to="/app/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/app/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/app/dashboard" replace /> : <Register />} />

        {/* Protected routes */}
        <Route path="/app" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="prospects/add" element={<ProspectsComponents.AddProspectWizard isOpen={true} onClose={() => navigate('/app/prospects')} />} />
          <Route path="prospects/upload" element={<UploadProspects />} />
          <Route path="prospects/schedule" element={<ScheduleFollowUps />} />
          <Route path="templates" element={<Templates />} />
          <Route path="history" element={<History />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={user ? "/app/dashboard" : "/"} replace />} />
      </Routes>
    </div>
  );
}