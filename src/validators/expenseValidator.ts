/**
 * Expense Validation
 * Comprehensive validation for expense data
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ExpenseInput {
  description: string;
  amount: number;
  date?: string;
  paid_by: string;
  splits: Array<{ user_id: string; amount: number }>;
  group_id?: string;
}

/**
 * Validate expense data
 * @param expense - Expense to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateExpense(expense: ExpenseInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate description
  if (!expense.description || !expense.description.trim()) {
    errors.push({
      field: 'description',
      message: 'Description is required',
    });
  } else if (expense.description.length > 200) {
    errors.push({
      field: 'description',
      message: 'Description must be less than 200 characters',
    });
  }

  // Validate amount
  if (typeof expense.amount !== 'number' || isNaN(expense.amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a valid number',
    });
  } else if (expense.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0',
    });
  } else if (expense.amount > 10000000) {
    errors.push({
      field: 'amount',
      message: 'Amount exceeds maximum limit (₹10,000,000)',
    });
  }

  // Validate date (if provided)
  if (expense.date) {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    if (isNaN(expenseDate.getTime())) {
      errors.push({
        field: 'date',
        message: 'Invalid date format',
      });
    } else if (expenseDate > now) {
      errors.push({
        field: 'date',
        message: 'Date cannot be in the future',
      });
    }
  }

  // Validate paid_by
  if (!expense.paid_by || !expense.paid_by.trim()) {
    errors.push({
      field: 'paid_by',
      message: 'Payer is required',
    });
  }

  // Validate splits
  if (!expense.splits || expense.splits.length === 0) {
    errors.push({
      field: 'splits',
      message: 'At least one split is required',
    });
  } else {
    // Validate each split
    expense.splits.forEach((split, index) => {
      if (!split.user_id || !split.user_id.trim()) {
        errors.push({
          field: `splits[${index}].user_id`,
          message: `Split ${index + 1}: User ID is required`,
        });
      }

      if (typeof split.amount !== 'number' || isNaN(split.amount)) {
        errors.push({
          field: `splits[${index}].amount`,
          message: `Split ${index + 1}: Amount must be a valid number`,
        });
      } else if (split.amount <= 0) {
        errors.push({
          field: `splits[${index}].amount`,
          message: `Split ${index + 1}: Amount must be greater than 0`,
        });
      }
    });

    // Validate splits sum to total (within 0.01 tolerance)
    const splitSum = expense.splits.reduce((sum, s) => sum + s.amount, 0);
    const roundedSum = parseFloat(splitSum.toFixed(2));
    const roundedAmount = parseFloat(expense.amount.toFixed(2));

    if (Math.abs(roundedSum - roundedAmount) > 0.01) {
      errors.push({
        field: 'splits',
        message: `Splits total (₹${roundedSum.toFixed(2)}) must equal expense amount (₹${roundedAmount.toFixed(2)})`,
      });
    }

    // Validate no duplicate user_ids
    const userIds = expense.splits.map((s) => s.user_id);
    const uniqueIds = new Set(userIds);
    if (userIds.length !== uniqueIds.size) {
      errors.push({
        field: 'splits',
        message: 'Each person can only appear once in splits',
      });
    }
  }

  return errors;
}

/**
 * Check if expense validation errors exist
 * @param expense - Expense to check
 * @returns True if valid, false otherwise
 */
export function isValidExpense(expense: ExpenseInput): boolean {
  return validateExpense(expense).length === 0;
}

/**
 * Get first validation error message
 * @param expense - Expense to validate
 * @returns First error message or null
 */
export function getFirstError(expense: ExpenseInput): string | null {
  const errors = validateExpense(expense);
  return errors.length > 0 ? errors[0].message : null;
}
