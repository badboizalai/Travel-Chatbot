import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  if (!user) {
    // Redirect to login using window.location instead of Navigate
    window.location.href = '/login';
    return null;
  }

  if (requireAdmin && !user.is_admin) {
    // Redirect to home using window.location instead of Navigate
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
