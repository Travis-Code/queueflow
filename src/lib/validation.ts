/**
 * Validation and error response utilities for API routes.
 * Provides type-safe validation and consistent error response format.
 */

export interface ValidationError {
  valid: false;
  error: string;
  status: number;
}

export interface ValidationSuccess {
  valid: true;
}

export type ValidationResult = ValidationSuccess | ValidationError;

/**
 * Email validation with basic regex pattern
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Phone validation for booking verification
 * Accepts common formatting characters and requires 10-15 digits total.
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

/**
 * Validate party size against config constraints
 */
export function validatePartySize(size: unknown, maxPartySize: number): ValidationResult {
  if (typeof size !== 'number' || size < 1) {
    return { valid: false, error: 'Party size must be a positive number', status: 400 };
  }
  if (size > maxPartySize) {
    return { valid: false, error: `Party size cannot exceed ${maxPartySize}`, status: 422 };
  }
  return { valid: true };
}

/**
 * Validate booking request body
 */
export function validateBookingRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required and must be JSON', status: 400 };
  }

  const { slotId, firstName, email, phoneNumber, partySize } = body as Record<string, unknown>;

  if (typeof slotId !== 'string' || !slotId.trim()) {
    return { valid: false, error: 'slotId is required and must be a non-empty string', status: 400 };
  }

  if (typeof firstName !== 'string' || !firstName.trim()) {
    return { valid: false, error: 'firstName is required and must be a non-empty string', status: 400 };
  }

  if (typeof email !== 'string' || !email.trim()) {
    return { valid: false, error: 'email is required', status: 400 };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: 'email must be a valid email address', status: 422 };
  }

  if (typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
    return { valid: false, error: 'phoneNumber is required', status: 400 };
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return { valid: false, error: 'phoneNumber must contain 10 to 15 digits', status: 422 };
  }

  if (typeof partySize !== 'number' || partySize < 1) {
    return { valid: false, error: 'partySize is required and must be a positive number', status: 400 };
  }

  return { valid: true };
}

/**
 * Validate slot creation request
 */
export function validateSlotRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required and must be JSON', status: 400 };
  }

  const { time, date } = body as Record<string, unknown>;

  if (typeof time !== 'string' || !time.trim()) {
    return { valid: false, error: 'time is required and must be a non-empty string', status: 400 };
  }

  if (typeof date !== 'string' || !date.trim()) {
    return { valid: false, error: 'date is required and must be a non-empty string', status: 400 };
  }

  // Simple ISO date validation (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: 'date must be in YYYY-MM-DD format', status: 422 };
  }

  return { valid: true };
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  timestamp: string;
}

export function createErrorResponse(message: string, code?: string): ErrorResponse {
  return {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };
}
