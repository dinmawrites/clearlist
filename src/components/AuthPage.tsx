import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import { EmailConfirmedPage } from './EmailConfirmedPage';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'confirmation' | 'confirmed';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [confirmationEmail, setConfirmationEmail] = useState<string>('');
  const { isAuthenticated, resetSignupFlag } = useAuth();

  // Check for email confirmation in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'signup') {
      setMode('confirmed');
    }
  }, []);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && mode !== 'confirmed') {
      window.location.href = '/';
    }
  }, [isAuthenticated, mode]);

  return (
    <div className="min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-notion-gray-900 dark:text-white mb-2">
            Clearlist
          </h1>
          <p className="text-notion-gray-500 dark:text-notion-gray-400">
            Your personal task management solution
          </p>
        </motion.div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'login' ? (
            <LoginForm onSwitchToSignup={() => {
              resetSignupFlag();
              setMode('signup');
            }} />
          ) : mode === 'signup' ? (
            <SignupForm 
              onSwitchToLogin={() => setMode('login')}
              onSignupSuccess={(email) => {
                setConfirmationEmail(email);
                setMode('confirmation');
              }}
            />
          ) : mode === 'confirmation' ? (
            <EmailConfirmationPage 
              email={confirmationEmail}
              onBackToLogin={() => {
                resetSignupFlag();
                setMode('login');
              }}
            />
          ) : (
            <EmailConfirmedPage 
              onContinue={() => window.location.href = '/'}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-notion-gray-400 dark:text-notion-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};
