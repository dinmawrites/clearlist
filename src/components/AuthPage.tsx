import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import { EmailConfirmedPage } from './EmailConfirmedPage';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'confirmation' | 'confirmed';

export const AuthPage: React.FC = () => {
  // Initialize mode from localStorage if we're waiting for confirmation
  const [mode, setMode] = useState<AuthMode>(() => {
    const waitingForConfirmation = localStorage.getItem('waitingForEmailConfirmation');
    return waitingForConfirmation === 'true' ? 'confirmation' : 'login';
  });
  const [confirmationEmail, setConfirmationEmail] = useState<string>('');
  const { isAuthenticated, resetSignupFlag } = useAuth();

  // Check for magic link confirmation in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const token = urlParams.get('token');
    const tokenHash = urlParams.get('token_hash');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    console.log('URL params:', { type, token, tokenHash, accessToken, refreshToken });
    
    // Check if user is coming from a magic link (they will be authenticated)
    if (isAuthenticated && (type === 'signup' || type === 'magiclink' || token || tokenHash || accessToken)) {
      console.log('User authenticated via magic link, setting mode to confirmed from URL params');
      setMode('confirmed');
    }
  }, [isAuthenticated]);

  // Debug mode changes
  useEffect(() => {
    console.log('AuthPage mode changed to:', mode);
  }, [mode]);

  // Redirect to dashboard if authenticated (but not during confirmation flow or signup)
  useEffect(() => {
    // Check if user came from a magic link
    const urlParams = new URLSearchParams(window.location.search);
    const fromMagicLink = urlParams.get('type') || urlParams.get('token') || urlParams.get('token_hash') || urlParams.get('access_token');
    
    console.log('Redirect useEffect - isAuthenticated:', isAuthenticated, 'mode:', mode, 'fromMagicLink:', fromMagicLink);
    
    // Only redirect if user is authenticated and we're not in confirmation/signup flow
    if (isAuthenticated && mode !== 'confirmed' && mode !== 'confirmation' && mode !== 'signup') {
      if (fromMagicLink) {
        console.log('User authenticated via magic link, showing confirmed page from redirect logic');
        setMode('confirmed');
      } else {
        // Check if we're waiting for email confirmation
        const waitingForConfirmation = localStorage.getItem('waitingForEmailConfirmation');
        if (waitingForConfirmation === 'true') {
          console.log('User is authenticated but we were waiting for email confirmation - showing confirmed page from localStorage');
          setMode('confirmed');
          localStorage.removeItem('waitingForEmailConfirmation');
        } else {
          console.log('Redirecting to dashboard - user is authenticated');
          window.location.href = '/';
        }
      }
    }
  }, [isAuthenticated]); // Removed 'mode' from dependencies to prevent conflicts

  return (
    <div className="min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'login' ? (
            <LoginForm onSwitchToSignup={() => {
              console.log('Setting mode to signup from onSwitchToSignup');
              resetSignupFlag();
              setMode('signup');
            }} />
          ) : mode === 'signup' ? (
            <SignupForm 
              onSwitchToLogin={() => {
                console.log('Setting mode to login from onSwitchToLogin');
                setMode('login');
              }}
              onSignupSuccess={(email) => {
                console.log('AuthPage received onSignupSuccess with email:', email);
                setConfirmationEmail(email);
                // Store in localStorage that we're waiting for email confirmation
                localStorage.setItem('waitingForEmailConfirmation', 'true');
                console.log('Setting mode to confirmation from onSignupSuccess');
                setMode('confirmation');
              }}
            />
          ) : mode === 'confirmation' ? (
            <EmailConfirmationPage 
              email={confirmationEmail}
              onBackToLogin={() => {
                console.log('Setting mode to login from onBackToLogin');
                resetSignupFlag();
                localStorage.removeItem('waitingForEmailConfirmation');
                setMode('login');
              }}
            />
          ) : (
            <EmailConfirmedPage 
              onContinue={() => {}}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-notion-gray-500 dark:text-notion-gray-400">
            Secure authentication powered by Supabase
          </p>
        </motion.div>
      </div>
    </div>
  );
};