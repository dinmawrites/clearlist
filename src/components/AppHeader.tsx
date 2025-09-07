import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  completedCount: number;
  totalCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ completedCount, totalCount }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white dark:bg-notion-gray-800 border-b border-notion-gray-200 dark:border-notion-gray-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-notion-blue-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-notion-gray-900 dark:text-white">Clearlist</h1>
              <p className="text-sm text-notion-gray-500 dark:text-notion-gray-400">
                {totalCount > 0 ? `${completedCount}/${totalCount} completed` : 'Your personal task manager'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-notion-gray-100 dark:hover:bg-notion-gray-700 transition-colors"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-notion-gray-200 dark:border-notion-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-notion-blue-100 dark:bg-notion-blue-900 rounded-full flex items-center justify-center">
                    <User size={16} className="text-notion-blue-600 dark:text-notion-blue-400" />
                  </div>
                )}
                <span className="text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 hidden sm:block">
                  {user?.name}
                </span>
                <ChevronDown size={16} className="text-notion-gray-400 dark:text-notion-gray-500" />
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-notion-gray-800 rounded-lg shadow-lg border border-notion-gray-200 dark:border-notion-gray-700 py-1 z-20"
                >
                  <div className="px-4 py-2 border-b border-notion-gray-100 dark:border-notion-gray-700">
                    <p className="text-sm font-medium text-notion-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-notion-gray-500 dark:text-notion-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-left text-sm text-notion-gray-700 dark:text-notion-gray-300 hover:bg-notion-gray-50 dark:hover:bg-notion-gray-700 flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-notion-gray-700 dark:text-notion-gray-300 hover:bg-notion-gray-50 dark:hover:bg-notion-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
