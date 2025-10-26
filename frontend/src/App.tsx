import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginModal from './components/Auth/LoginModal';
import Overview from './components/Dashboard/Overview';
import PostManagement from './components/Posts/PostManagement';
import UserManagement from './components/Users/UserManagement';
import NotificationManagement from './components/Notifications/NotificationManagement';
import HealthDashboard from './components/Health/HealthDashboard';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </LoadingSpinner>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/posts" element={<PostManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/notifications" element={<NotificationManagement />} />
        <Route path="/health" element={<HealthDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppContainer>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </AppContainer>
  );
};

export default App;