/**
 * Split Validation
 * Validation for split distribution
 */

import { ValidationError } from './expenseValidator';

export interface SplitInput {
  user_id: string;
  amount: number;
}

/**
 * Validate splits sum to total amount
 * @param splits - Array of splits
 * @param totalAmount - Total expense amount
 * @returns Array of validation errors
 */
export function validateSplits(
  splits: SplitInput[],
  totalAmount: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate splits exist
  if (!splits || splits.length === 0) {
    errors.push({
      field: 'splits',
      message: 'At least one split is required',
    });
    return errors;
  }

  // Validate total amount
  if (typeof totalAmount !== 'number' || isNaN(totalAmount) || totalAmount <= 0) {
    errors.push({
      field: 'totalAmount',
      message: 'Total amount must be a positive number',
    });
    return errors;
  }

  // Validate each split
  splits.forEach((split, index) => {
    if (!split.user_id || !split.user_id.trim()) {
      errors.push({
        field: `splits[${index}].user_id`,
        message: `Split ${index + 1}: User ID is required`,
      });
    }

    if (typeof split.amount !== 'number' || isNaN(split.amount)) {
      errors.push({
        field: `splits[${index}].amount`,
        message: `Split ${index + 1}: Amount must be a number`,
      });
    } else if (split.amount <= 0) {
      errors.push({
        field: `splits[${index}].amount`,
        message: `Split ${index + 1}: Amount must be greater than 0`,
      });
    } else if (split.amount > totalAmount) {
      errors.push({
        field: `splits[${index}].amount`,
        message: `Split ${index + 1}: Amount cannot exceed total`,
      });
    }
  });

  // Validate sum equals total (with tolerance for rounding)
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  const roundedSum = parseFloat(sum.toFixed(2));
  const roundedTotal = parseFloat(totalAmount.toFixed(2));

  if (Math.abs(roundedSum - roundedTotal) > 0.01) {
    errors.push({
      field: 'splits',
      message: `Splits total (₹${roundedSum.toFixed(2)}) must equal expense amount (₹${roundedTotal.toFixed(2)})`,
    });
  }

  // Validate no duplicate users
  const userIds = splits.map((s) => s.user_id);
  const uniqueIds = new Set(userIds);
  if (userIds.length !== uniqueIds.size) {
    errors.push({
      field: 'splits',
      message: 'Each person can only appear once in splits',
    });
  }

  return errors;
}

/**
 * Check if splits are valid
 * @param splits - Splits to validate
 * @param totalAmount - Total amount
 * @returns True if valid
 */
export function isValidSplits(
  splits: SplitInput[],
  totalAmount: number
): boolean {
  return validateSplits(splits, totalAmount).length === 0;
}

/**
 * Calculate if splits are equal distribution
 * @param splits - Splits to check
 * @param totalAmount - Total amount
 * @returns True if equal split
 */
export function isEqualSplit(
  splits: SplitInput[],
  totalAmount: number
): boolean {
  if (splits.length === 0) return false;

  const equalAmount = totalAmount / splits.length;
  return splits.every((split) => Math.abs(split.amount - equalAmount) < 0.01);
}

/**
 * Distribute amount equally among users
 * @param userIds - Array of user IDs
 * @param totalAmount - Amount to distribute
 * @returns Array of splits
 */
export function distributeEvenly(
  userIds: string[],
  totalAmount: number
): SplitInput[] {
  if (userIds.length === 0) return [];

  const perPerson = totalAmount / userIds.length;
  const roundedPerPerson = parseFloat(perPerson.toFixed(2));

  return userIds.map((userId, index) => {
    // Last person gets any rounding difference
    if (index === userIds.length - 1) {
      const othersTotal = roundedPerPerson * (userIds.length - 1);
      const lastAmount = totalAmount - othersTotal;
      return {
        user_id: userId,
        amount: parseFloat(lastAmount.toFixed(2)),
      };
    }

    return {
      user_id: userId,
      amount: roundedPerPerson,
    };
  });
}
