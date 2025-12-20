/**
 * Error Handler Utility
 * Centralized error handling and user-friendly messages
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  originalError?: Error;
}

/**
 * Create an application error
 * @param code - Error code
 * @param message - User-friendly message
 * @param details - Additional error details
 * @returns AppError object
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: any
): AppError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Parse Supabase error into AppError
 * @param error - Error from Supabase
 * @returns AppError
 */
export function parseSupabaseError(error: any): AppError {
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return createError(
      ErrorCode.NETWORK_ERROR,
      'Network error. Please check your connection and try again.',
      { original: error.message }
    );
  }

  // Permission errors
  if (
    error.code === 'PGRST301' ||
    error.message?.includes('permission') ||
    error.message?.includes('denied')
  ) {
    return createError(
      ErrorCode.PERMISSION_DENIED,
      'You do not have permission for this action.',
      { original: error.message }
    );
  }

  // Not found errors
  if (error.code === 'PGRST116' || error.message?.includes('not found')) {
    return createError(
      ErrorCode.NOT_FOUND,
      'The requested item was not found.',
      { original: error.message }
    );
  }

  // Validation errors (constraint violations)
  if (
    error.code === '23505' || // Unique violation
    error.code === '23503' || // Foreign key violation
    error.code === '23514' // Check constraint violation
  ) {
    return createError(
      ErrorCode.VALIDATION_ERROR,
      'Data validation error. Please check your input.',
      { original: error.message, code: error.code }
    );
  }

  // Default unknown error
  return createError(
    ErrorCode.UNKNOWN_ERROR,
    'Something went wrong. Please try again.',
    { original: error.message }
  );
}

/**
 * Handle error and return user-friendly message
 * @param error - Error to handle
 * @returns User-friendly error message
 */
export function handleError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error.code && error.message) {
    return error.message;
  }

  const appError = parseSupabaseError(error);
  return appError.message;
}

/**
 * Log error for debugging
 * @param error - Error to log
 * @param context - Additional context
 */
export function logError(error: any, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';

  console.error(`${timestamp} ${contextStr} Error:`, error);

  // In production, send to error tracking service (Sentry, Firebase, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(error, context);
  // }
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxAttempts - Maximum retry attempts
 * @param delay - Initial delay in ms
 * @returns Promise with result or error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on validation or permission errors
      const appError = parseSupabaseError(error);
      if (
        appError.code === ErrorCode.VALIDATION_ERROR ||
        appError.code === ErrorCode.PERMISSION_DENIED
      ) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * Safe number parsing
 * @param value - Value to parse
 * @param defaultValue - Default if parsing fails
 * @returns Parsed number
 */
export function safeParseFloat(
  value: any,
  defaultValue: number = 0
): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Round to 2 decimal places (currency precision)
 * @param value - Value to round
 * @returns Rounded value
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format currency for display
 * @param value - Value to format
 * @returns Formatted string
 */
export function formatCurrency(value: number): string {
  return `₹${roundCurrency(value).toFixed(2)}`;
}
