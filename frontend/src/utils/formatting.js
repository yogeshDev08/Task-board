import { format } from 'date-fns';

/**
 * Get status color classes
 * @param {string} status - Task status
 * @returns {string} - color classes
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'TODO':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'DONE':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get priority color classes
 * @param {string} priority - Task priority
 * @returns {string} - color classes
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'LOW':
      return 'bg-green-100 text-green-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date in locale string format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDateLocale = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Get role badge color
 * @param {string} role - User role
 * @returns {string} - Tailwind color classes
 */
export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'user':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get role display text with icon
 * @param {string} role - User role
 * @returns {string} - Display text with icon
 */
export const getRoleDisplay = (role) => {
  switch (role) {
    case 'admin':
      return '⚙️ Admin';
    case 'user':
      return '👤 User';
    default:
      return role;
  }
};

/**
 * Format status display text
 * @param {string} status - Task status
 * @returns {string} - Formatted status
 */
export const formatStatus = (status) => {
  return status.replace('_', ' ');
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
