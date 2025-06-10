import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import WeatherPage from './pages/WeatherPage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import DemoPage from './pages/DemoPage';

// Hooks
import { AuthProvider, useAuth } from './hooks/useAuth';

// Simple redirect component to replace Navigate
const Redirect = ({ to }: { to: string }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
};

// Simple Page Wrapper with smooth animations
function PageWrapper({ children }: any) {
  return (
    <div className="min-h-screen animate-fadeIn">
      {children}
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg animate-fadeIn">
            Đang tải TravelMate...
          </p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={
            <PageWrapper>
              <LoginPage />
            </PageWrapper>
          } />
          <Route path="/register" element={
            <PageWrapper>
              <RegisterPage />
            </PageWrapper>
          } />
          
          {/* Routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            } />
            <Route path="demo" element={
              <PageWrapper>
                <DemoPage />
              </PageWrapper>
            } />
            <Route path="map" element={
              <PageWrapper>
                <MapPage />
              </PageWrapper>
            } />
            <Route path="chat" element={
              <ProtectedRoute>
                <PageWrapper>
                  <ChatPage />
                </PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="weather" element={
              <ProtectedRoute>
                <PageWrapper>
                  <WeatherPage />
                </PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="booking" element={
              <ProtectedRoute>
                <PageWrapper>
                  <BookingPage />
                </PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <PageWrapper>
                  <ProfilePage />
                </PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute requireAdmin={true}>
                <PageWrapper>
                  <AdminPage />
                </PageWrapper>
              </ProtectedRoute>
            } />
          </Route>
            {/* Redirect unknown routes to home */}          <Route path="*" element={<Redirect to="/" />} />
        </Routes>
      
      {/* Chat Widget - visible on all pages except login/register */}
      {!location.pathname.includes('/login') && !location.pathname.includes('/register') && (
        <ChatWidget />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
