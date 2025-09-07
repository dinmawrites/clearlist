import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-6 bg-notion-gray-300 dark:bg-notion-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-notion-blue-500 focus:ring-offset-2 dark:focus:ring-offset-notion-gray-800"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon size={12} className="text-notion-gray-800" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
};
