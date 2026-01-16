/**
 * Validators - Test Portal Mobile
 * 
 * Form validation utilities ported from test-portal-client.
 */

// ============================================
// Basic Validators
// ============================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

// ============================================
// Password Strength
// ============================================

export const getPasswordStrength = (
  password: string
): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 6) {
    return { strength: 'weak', message: 'Too short' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 2) {
    return { strength: 'weak', message: 'Weak password' };
  } else if (score === 3 || score === 4) {
    return { strength: 'medium', message: 'Medium strength' };
  }
  return { strength: 'strong', message: 'Strong password' };
};

// ============================================
// Age Validation
// ============================================

export const isAdult = (dateOfBirth: string): boolean => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 13; // Minimum age 13
  }
  return age >= 13;
};

export const getAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// ============================================
// Form Validation Utility
// ============================================

export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => string | null>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};

  Object.keys(rules).forEach((key) => {
    const rule = rules[key as keyof T];
    if (rule) {
      const error = rule(data[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// Predefined Validation Rules
// ============================================

export const validationRules = {
  required: (fieldName: string) => (value: any) =>
    value && String(value).trim() ? null : `${fieldName} is required`,

  email: (value: string) =>
    isValidEmail(value) ? null : 'Please enter a valid email address',

  phone: (value: string) =>
    isValidPhone(value) ? null : 'Please enter a valid 10-digit phone number',

  password: (value: string) =>
    isValidPassword(value)
      ? null
      : 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',

  minLength: (min: number, fieldName: string) => (value: string) =>
    value && value.length >= min
      ? null
      : `${fieldName} must be at least ${min} characters`,

  maxLength: (max: number, fieldName: string) => (value: string) =>
    value && value.length <= max
      ? null
      : `${fieldName} must be at most ${max} characters`,

  matchField: (otherValue: string, fieldName: string) => (value: string) =>
    value === otherValue ? null : `${fieldName} does not match`,
};
