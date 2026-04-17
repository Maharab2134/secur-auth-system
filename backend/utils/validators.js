/**
 * Custom Validation Functions
 * Provides reusable validators for different input types
 */

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

/**
 * Get password strength feedback
 */
const getPasswordStrengthFeedback = (password) => {
  const feedback = [];
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Include at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('Include at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    feedback.push('Include at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Include at least one special character');
  }
  
  return feedback;
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  isStrongPassword,
  getPasswordStrengthFeedback,
  sanitizeInput,
  isValidEmail
};