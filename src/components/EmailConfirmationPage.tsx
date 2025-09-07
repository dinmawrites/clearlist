import React from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

interface EmailConfirmationPageProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({ 
  email, 
  onBackToLogin 
}) => {
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
            <Mail size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-semibold text-notion-gray-900 dark:text-white mb-4">
            Check Your Email
          </h2>
          
          <p className="text-notion-gray-600 dark:text-notion-gray-400 mb-6">
            We've sent a confirmation link to:
          </p>
          
          <div className="bg-notion-gray-100 dark:bg-notion-gray-800 rounded-lg p-3 mb-6">
            <p className="font-medium text-notion-gray-900 dark:text-white">
              {email}
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-notion-gray-600 dark:text-notion-gray-400">
            <div className="flex items-start space-x-3">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p>Click the confirmation link in your email</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p>Check your spam folder if you don't see it</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p>Then come back here to sign in</p>
            </div>
          </div>
          
          <button
            onClick={onBackToLogin}
            className="w-full notion-button-secondary mt-8 flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
