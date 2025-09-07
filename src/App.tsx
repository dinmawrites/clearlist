import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthPage } from './components/AuthPage';
import { TodoApp } from './components/TodoApp';
import { ProfilePage } from './components/ProfilePage';
import { Favicon } from './components/Favicon';

function AppRoutes() {
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

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <TodoApp />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/profile" 
        element={
          isAuthenticated ? (
            <ProfilePage />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Favicon />
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
