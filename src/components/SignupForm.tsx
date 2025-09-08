import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SignupCredentials } from '../types/auth';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (email: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { signup, isLoading } = useAuth();

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!credentials.name.trim()) {
      errors.name = 'Full name is required';
    } else if (credentials.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Starting signup process...');
      const result = await signup(credentials);
      console.log('Signup completed, result:', result);
      
      // Magic link sent successfully - show confirmation page
      console.log('Calling onSignupSuccess with email:', credentials.email);
      onSignupSuccess(credentials.email);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="notion-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-notion-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 dark:text-white mb-2">
            Create account
          </h2>
          <p className="text-notion-gray-500 dark:text-notion-gray-400">
            We'll send you a magic link to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
              Full name
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={credentials.name}
                onChange={handleChange}
                className={`notion-input pl-10 ${validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your full name"
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className={`notion-input pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full notion-button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending magic link...
              </div>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-notion-gray-500 dark:text-notion-gray-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-notion-blue-600 hover:text-notion-blue-700 dark:text-notion-blue-400 dark:hover:text-notion-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
