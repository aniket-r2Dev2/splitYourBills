/**
 * Settlement Validation
 * Validation for settlement records
 */

import { ValidationError } from './expenseValidator';

export interface SettlementInput {
  payer_id: string;
  payee_id: string;
  amount: number;
  group_id?: string;
  date?: string;
}

/**
 * Validate settlement data
 * @param settlement - Settlement to validate
 * @returns Array of validation errors
 */
export function validateSettlement(
  settlement: SettlementInput
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate payer
  if (!settlement.payer_id || !settlement.payer_id.trim()) {
    errors.push({
      field: 'payer_id',
      message: 'Payer is required',
    });
  }

  // Validate payee
  if (!settlement.payee_id || !settlement.payee_id.trim()) {
    errors.push({
      field: 'payee_id',
      message: 'Payee is required',
    });
  }

  // Validate payer !== payee
  if (
    settlement.payer_id &&
    settlement.payee_id &&
    settlement.payer_id === settlement.payee_id
  ) {
    errors.push({
      field: 'payee_id',
      message: 'Payer and payee cannot be the same person',
    });
  }

  // Validate amount
  if (typeof settlement.amount !== 'number' || isNaN(settlement.amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a valid number',
    });
  } else if (settlement.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0',
    });
  } else if (settlement.amount > 10000000) {
    errors.push({
      field: 'amount',
      message: 'Amount exceeds maximum limit (₹10,000,000)',
    });
  }

  // Validate date (if provided)
  if (settlement.date) {
    const settlementDate = new Date(settlement.date);
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    if (isNaN(settlementDate.getTime())) {
      errors.push({
        field: 'date',
        message: 'Invalid date format',
      });
    } else if (settlementDate > now) {
      errors.push({
        field: 'date',
        message: 'Date cannot be in the future',
      });
    }
  }

  return errors;
}

/**
 * Check if settlement is valid
 * @param settlement - Settlement to check
 * @returns True if valid
 */
export function isValidSettlement(settlement: SettlementInput): boolean {
  return validateSettlement(settlement).length === 0;
}

/**
 * Get first validation error message
 * @param settlement - Settlement to validate
 * @returns First error message or null
 */
export function getFirstSettlementError(
  settlement: SettlementInput
): string | null {
  const errors = validateSettlement(settlement);
  return errors.length > 0 ? errors[0].message : null;
}
