import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-notion-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-notion-gray-500 dark:text-notion-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be handled by the router
  }

  return <>{children}</>;
};
