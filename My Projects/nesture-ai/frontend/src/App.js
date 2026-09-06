import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Pages
import LoginPage from './pages/LoginPage';
import LearnerHome from './pages/LearnerHome';
import GamePage from './pages/GamePage';
import SessionResults from './pages/SessionResults';
import ParentDashboard from './pages/ParentDashboard';
import OTDashboard from './pages/OTDashboard';
import LearnerDetail from './pages/LearnerDetail';
import DifficultySelection from './pages/DifficultySelection';

import ErrorBoundary from './components/shared/ErrorBoundary';
import './styles/global.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'learner') return <Navigate to="/play" replace />;
  if (user?.role === 'parent')  return <Navigate to="/parent" replace />;
  if (user?.role === 'ot')      return <Navigate to="/ot" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  useEffect(() => { initAuth(); }, [initAuth]);

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
            background: '#1F2937',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Learner routes */}
        <Route path="/play" element={
          <ProtectedRoute allowedRoles={['learner']}>
            <LearnerHome />
          </ProtectedRoute>
        } />
        <Route path="/play/difficulty" element={
          <ProtectedRoute allowedRoles={['learner']}>
            <DifficultySelection />
          </ProtectedRoute>
        } />
        <Route path="/play/game" element={
          <ProtectedRoute allowedRoles={['learner']}>
            <GamePage />
          </ProtectedRoute>
        } />
        <Route path="/play/results/:sessionId" element={
          <ProtectedRoute allowedRoles={['learner']}>
            <SessionResults />
          </ProtectedRoute>
        } />

        {/* Parent routes */}
        <Route path="/parent" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        } />

        {/* OT routes */}
        <Route path="/ot" element={
          <ProtectedRoute allowedRoles={['ot']}>
            <OTDashboard />
          </ProtectedRoute>
        } />
        <Route path="/ot/learner/:learnerId" element={
          <ProtectedRoute allowedRoles={['ot']}>
            <LearnerDetail />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
