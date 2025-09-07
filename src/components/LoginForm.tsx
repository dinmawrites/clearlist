import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types/auth';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
            <LogIn size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 dark:text-white mb-2">
            Welcome back
          </h2>
          <p className="text-notion-gray-500 dark:text-notion-gray-400">
            Sign in to your account to continue
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
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full notion-button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-notion-gray-500 dark:text-notion-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-notion-blue-600 hover:text-notion-blue-700 dark:text-notion-blue-400 dark:hover:text-notion-blue-300 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
