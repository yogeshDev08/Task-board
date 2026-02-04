import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { updateProfile } from '../store/authSlice';
import { validateEmail, validatePassword } from '../utils/validation';
import { getRoleDisplay, formatDateLocale } from '../utils/formatting';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Password validation - only if user is changing password
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required to set a new password';
      }

      if (formData.newPassword) {
        const passwordErrors = validatePassword(formData.newPassword);
        if (Object.keys(passwordErrors).length > 0) {
          errors.newPassword = Object.values(passwordErrors).join(', ');
        }

        if (formData.newPassword !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updateData = {
      email: formData.email
    };

    // Only include password if user is changing it
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    const result = await dispatch(updateProfile(updateData));
    
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage('Profile updated successfully!');
      setIsEditMode(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [formData, validateForm, dispatch]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    setFormErrors({});
    setFormData({
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✕ {error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* User Avatar Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.email}</h2>
                <p className="text-blue-100">{getRoleDisplay(user.role)}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              {isEditMode ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {user.email}
                </p>
              )}
            </div>

            {/* Current Password Field (only in edit mode if changing password) */}
            {isEditMode && (formData.newPassword || formData.currentPassword) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                      formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formErrors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.currentPassword}</p>
                )}
              </div>
            )}

            {/* New Password Field (only in edit mode) */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-gray-500 text-xs">(Leave blank to keep current password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                      formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.newPassword}</p>
                )}
              </div>
            )}

            {/* Confirm Password Field (only in edit mode if new password is entered) */}
            {isEditMode && formData.newPassword && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Role Field (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium capitalize">
                {getRoleDisplay(user.role)}
              </p>
            </div>

            {/* Member Since Field (Read-only) */}
            {user.createdAt && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {formatDateLocale(new Date(user.createdAt))}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditMode && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      ✓ Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
