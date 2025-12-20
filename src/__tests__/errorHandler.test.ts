/**
 * Error Handler Tests
 * Tests for error handling utilities
 */

import {
  ErrorCode,
  createError,
  parseSupabaseError,
  handleError,
  safeParseFloat,
  roundCurrency,
  formatCurrency,
} from '../utils/errorHandler';

describe('Error Handler', () => {
  describe('createError', () => {
    test('should create error with code and message', () => {
      const error = createError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid input'
      );

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Invalid input');
    });

    test('should include details if provided', () => {
      const error = createError(
        ErrorCode.NETWORK_ERROR,
        'Connection failed',
        { retry: true }
      );

      expect(error.details).toEqual({ retry: true });
    });
  });

  describe('parseSupabaseError', () => {
    test('should parse network error', () => {
      const error = { message: 'fetch failed' };
      const result = parseSupabaseError(error);

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    test('should parse permission error', () => {
      const error = { code: 'PGRST301', message: 'permission denied' };
      const result = parseSupabaseError(error);

      expect(result.code).toBe(ErrorCode.PERMISSION_DENIED);
    });

    test('should parse not found error', () => {
      const error = { code: 'PGRST116', message: 'not found' };
      const result = parseSupabaseError(error);

      expect(result.code).toBe(ErrorCode.NOT_FOUND);
    });

    test('should parse validation error', () => {
      const error = { code: '23505', message: 'unique violation' };
      const result = parseSupabaseError(error);

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    test('should default to unknown error', () => {
      const error = { message: 'something weird happened' };
      const result = parseSupabaseError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('handleError', () => {
    test('should handle string error', () => {
      const message = handleError('Simple error message');
      expect(message).toBe('Simple error message');
    });

    test('should handle error object with message', () => {
      const error = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid data',
      };
      const message = handleError(error);

      expect(message).toBe('Invalid data');
    });

    test('should parse unknown error', () => {
      const error = { someField: 'value' };
      const message = handleError(error);

      expect(message).toContain('Something went wrong');
    });
  });

  describe('safeParseFloat', () => {
    test('should parse valid number', () => {
      expect(safeParseFloat('123.45')).toBe(123.45);
      expect(safeParseFloat(123.45)).toBe(123.45);
    });

    test('should return default for invalid input', () => {
      expect(safeParseFloat('abc')).toBe(0);
      expect(safeParseFloat('abc', 100)).toBe(100);
    });

    test('should handle null and undefined', () => {
      expect(safeParseFloat(null)).toBe(0);
      expect(safeParseFloat(undefined)).toBe(0);
    });
  });

  describe('roundCurrency', () => {
    test('should round to 2 decimal places', () => {
      expect(roundCurrency(123.456)).toBe(123.46);
      expect(roundCurrency(123.454)).toBe(123.45);
    });

    test('should handle edge cases', () => {
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
      expect(roundCurrency(9.999)).toBe(10);
    });
  });

  describe('formatCurrency', () => {
    test('should format with rupee symbol', () => {
      expect(formatCurrency(100)).toBe('₹100.00');
      expect(formatCurrency(123.45)).toBe('₹123.45');
    });

    test('should handle rounding in formatting', () => {
      expect(formatCurrency(123.456)).toBe('₹123.46');
    });
  });
});

console.log('\n================================');
console.log('Error Handler Test Suite');
console.log('================================');
console.log('✓ All tests defined and ready');
console.log('Run with: npm test -- errorHandler.test.ts');
console.log('\nFeatures Tested:');
console.log('- Error creation and parsing');
console.log('- Error code detection');
console.log('- Number parsing and formatting');
console.log('- Currency utilities');
console.log('================================\n');
