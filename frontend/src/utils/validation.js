/**
 * Email validation utility
 * @param {string} email - Email to validate
 * @returns {string} - Empty string if valid, error message if invalid
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  if (email.length > 100) {
    return 'Email must be less than 100 characters';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address (e.g., user@example.com)';
  }
  
  return '';
};

/**
 * Password validation utility with detailed error tracking
 * @param {string} password - Password to validate
 * @returns {Object} - Object with error keys for each validation rule
 */
export const validatePassword = (password) => {
  const errors = {};
  
  if (!password) {
    errors.empty = 'Password is required';
    return errors;
  }

  if (password.length < 8) {
    errors.length = 'Password must be at least 8 characters';
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.uppercase = 'Password must contain at least one uppercase letter (A-Z)';
  }
  
  if (!/[a-z]/.test(password)) {
    errors.lowercase = 'Password must contain at least one lowercase letter (a-z)';
  }
  
  if (!/[0-9]/.test(password)) {
    errors.number = 'Password must contain at least one number (0-9)';
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.special = 'Password must contain at least one special character (!@#$%^&*)';
  }

  return errors;
};

/**
 * Check if password meets all requirements
 * @param {string} password - Password to check
 * @returns {boolean} - True if password is valid
 */
export const isPasswordValid = (password) => {
  return Object.keys(validatePassword(password)).length === 0;
};

/**
 * Check if email is valid
 * @param {string} email - Email to check
 * @returns {boolean} - True if email is valid
 */
export const isEmailValid = (email) => {
  return validateEmail(email) === '';
};

/**
 * Validate task title
 * @param {string} title - Title to validate
 * @returns {string} - Error message or empty string
 */
export const validateTaskTitle = (title) => {
  if (!title || !title.trim()) {
    return 'Title is required';
  }
  if (title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.length > 200) {
    return 'Title cannot exceed 200 characters';
  }
  return '';
};

/**
 * Validate task description
 * @param {string} description - Description to validate
 * @returns {string} - Error message or empty string
 */
export const validateTaskDescription = (description) => {
  if (!description) return '';
  if (description.length > 1000) {
    return 'Description cannot exceed 1000 characters';
  }
  return '';
};

/**
 * Validate due date
 * @param {string} dueDate - Due date in ISO format
 * @returns {string} - Error message or empty string
 */
export const validateDueDate = (dueDate) => {
  if (!dueDate) {
    return 'Due date is required';
  }
  
  const selectedDate = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'Due date must be today or in the future';
  }
  
  return '';
};
