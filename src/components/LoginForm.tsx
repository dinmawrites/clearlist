import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MagicLinkCredentials } from '../types/auth';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [credentials, setCredentials] = useState<MagicLinkCredentials>({
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { sendMagicLink, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await sendMagicLink(credentials);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
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
            We'll send you a magic link to sign in
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Magic Link Sent!</h3>
            <p className="text-green-700 text-sm mb-4">
              Check your email at <strong>{credentials.email}</strong> and click the link to sign in.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Send another link
            </button>
          </motion.div>
        ) : (
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
        )}

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
