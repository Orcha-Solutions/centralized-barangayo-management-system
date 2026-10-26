/**
 * Validation utilities for Philippine Local Government applications.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Philippine mobile numbers.
 * Supports:
 * - 09XXXXXXXXX (11 digits)
 * - +639XXXXXXXXX (13 characters)
 * - 639XXXXXXXXX (12 digits)
 * - Optional dashes or spaces (e.g., 0917-123-4567 or 0917 123 4567)
 */
export function validatePhilippineMobile(phone: string, required = false): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    if (required) {
      return { isValid: false, error: "Mobile number is required." };
    }
    return { isValid: true };
  }

  // Strip spaces, dashes, dots, parentheses
  const clean = trimmed.replace(/[\s\-\(\)\.]/g, "");

  // Must match Philippine mobile number formats: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX
  const phMobileRegex = /^(09\d{9}|\+639\d{9}|639\d{9})$/;
  if (!phMobileRegex.test(clean)) {
    return {
      isValid: false,
      error: "Must be a valid PH mobile number (e.g. 09171234567 or +639171234567).",
    };
  }

  return { isValid: true };
}

/**
 * Normalizes a Philippine mobile number into a standard dialer format (+63 9XX XXX XXXX).
 */
export function formatPhilippineMobile(phone: string): string {
  const clean = phone.replace(/[\s\-\(\)\.]/g, "");
  if (/^09\d{9}$/.test(clean)) {
    return `+63 ${clean.slice(1, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  if (/^\+639\d{9}$/.test(clean)) {
    return `+63 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  if (/^639\d{9}$/.test(clean)) {
    return `+63 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return phone;
}

/**
 * Validates standard email address format.
 */
export function validateEmail(email: string, required = false): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    if (required) {
      return { isValid: false, error: "Email address is required." };
    }
    return { isValid: true };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid email address (e.g. name@example.com).",
    };
  }

  return { isValid: true };
}
