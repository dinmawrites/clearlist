import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EmailConfirmedPageProps {
  onContinue: () => void;
}

export const EmailConfirmedPage: React.FC<EmailConfirmedPageProps> = ({ onContinue }) => {
  const { isAuthenticated } = useAuth();

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onContinue();
    }
  }, [isAuthenticated, onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="notion-card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-semibold text-notion-gray-900 dark:text-white mb-4">
            Email Confirmed!
          </h2>
          
          <p className="text-notion-gray-600 dark:text-notion-gray-400 mb-8">
            Your email has been successfully verified. You can now access your account and start managing your tasks.
          </p>
          
          <button
            onClick={onContinue}
            className="w-full notion-button-primary flex items-center justify-center space-x-2"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
