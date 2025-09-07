import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileUpdateCredentials } from '../types/auth';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfileUpdateCredentials>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePhoto: user?.profilePhoto || '',
  });

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profilePhoto: user.profilePhoto || '',
      });
    }
  }, [user]);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB to avoid localStorage quota issues)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }

      // Convert file to base64 for storage (in a real app, you'd upload to a server)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          profilePhoto: result,
        }));
        // Clear any previous errors
        if (error) setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Only include fields that have been changed
      const updateData: ProfileUpdateCredentials = {};
      
      if (formData.name !== user?.name) {
        updateData.name = formData.name;
      }
      
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }
      
      if (formData.profilePhoto !== (user?.profilePhoto || '')) {
        updateData.profilePhoto = formData.profilePhoto;
      }
      
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }


      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        return;
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-notion-gray-800 border-b border-notion-gray-200 dark:border-notion-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-notion-gray-100 dark:hover:bg-notion-gray-700 transition-colors"
            >
              <ArrowLeft size={20} className="text-notion-gray-600 dark:text-notion-gray-400" />
            </button>
            <h1 className="text-2xl font-semibold text-notion-gray-900 dark:text-white">
              Profile Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Profile Photo Section */}
          <div className="notion-card p-6">
            <h2 className="text-lg font-semibold text-notion-gray-900 dark:text-white mb-4">
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-notion-gray-200 dark:border-notion-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 bg-notion-blue-100 dark:bg-notion-blue-900 rounded-full flex items-center justify-center">
                    <User size={32} className="text-notion-blue-600 dark:text-notion-blue-400" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-notion-blue-600 rounded-full flex items-center justify-center hover:bg-notion-blue-700 transition-colors"
                >
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm text-notion-gray-600 dark:text-notion-gray-400 mb-2">
                  Click the camera icon to change your profile photo
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-notion-blue-600 dark:text-notion-blue-400 hover:text-notion-blue-700 dark:hover:text-notion-blue-300"
                >
                  Choose Photo
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Profile Information Form */}
          <form onSubmit={handleSubmit} className="notion-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-notion-gray-900 dark:text-white mb-4">
              Profile Information
            </h2>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
                Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-notion-gray-300 dark:border-notion-gray-600 rounded-lg bg-white dark:bg-notion-gray-800 text-notion-gray-900 dark:text-white placeholder-notion-gray-500 dark:placeholder-notion-gray-400 focus:ring-2 focus:ring-notion-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-notion-gray-300 dark:border-notion-gray-600 rounded-lg bg-white dark:bg-notion-gray-800 text-notion-gray-900 dark:text-white placeholder-notion-gray-500 dark:placeholder-notion-gray-400 focus:ring-2 focus:ring-notion-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Change Section */}
            <div className="border-t border-notion-gray-200 dark:border-notion-gray-700 pt-6">
              <h3 className="text-md font-medium text-notion-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <p className="text-sm text-notion-gray-600 dark:text-notion-gray-400 mb-4">
                Leave password fields empty if you don't want to change your password
              </p>

              {/* Current Password */}
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-notion-gray-300 dark:border-notion-gray-600 rounded-lg bg-white dark:bg-notion-gray-800 text-notion-gray-900 dark:text-white placeholder-notion-gray-500 dark:placeholder-notion-gray-400 focus:ring-2 focus:ring-notion-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500 hover:text-notion-gray-600 dark:hover:text-notion-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-notion-gray-300 dark:border-notion-gray-600 rounded-lg bg-white dark:bg-notion-gray-800 text-notion-gray-900 dark:text-white placeholder-notion-gray-500 dark:placeholder-notion-gray-400 focus:ring-2 focus:ring-notion-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500 hover:text-notion-gray-600 dark:hover:text-notion-gray-300"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-notion-gray-700 dark:text-notion-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-notion-gray-300 dark:border-notion-gray-600 rounded-lg bg-white dark:bg-notion-gray-800 text-notion-gray-900 dark:text-white placeholder-notion-gray-500 dark:placeholder-notion-gray-400 focus:ring-2 focus:ring-notion-blue-500 focus:border-transparent transition-colors"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 dark:text-notion-gray-500 hover:text-notion-gray-600 dark:hover:text-notion-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-notion-blue-600 hover:bg-notion-blue-700 disabled:bg-notion-gray-400 dark:disabled:bg-notion-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};
