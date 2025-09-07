import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
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
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signup(credentials);
      // If signup is successful, show confirmation page
      onSignupSuccess(credentials.email);
    } catch (err) {
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
            Get started with your personal task manager
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
                className="notion-input pl-10"
                placeholder="Enter your full name"
              />
            </div>
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
                className="notion-input pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={credentials.password}
                onChange={handleChange}
                className="notion-input pl-10 pr-10"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500 hover:text-notion-gray-600 dark:hover:text-notion-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={credentials.confirmPassword}
                onChange={handleChange}
                className="notion-input pl-10 pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500 hover:text-notion-gray-600 dark:hover:text-notion-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full notion-button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating account...
              </div>
            ) : (
              'Create account'
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
