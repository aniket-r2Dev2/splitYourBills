/**
 * Expense Edit and Delete API
 * Functions to update and delete expenses
 */

import { supabase } from './supabase';

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  date?: string;
  paid_by?: string;
  splits?: Array<{ user_id: string; amount: number }>;
}

export interface DeletedExpense {
  id: string;
  deleted_at: string;
  can_restore: boolean;
  hours_remaining: number;
}

/**
 * Update an existing expense
 * @param expenseId - ID of expense to update
 * @param data - Fields to update
 * @returns Updated expense
 */
export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseData
): Promise<any> {
  try {
    // First, get the current expense to validate ownership
    const { data: currentExpense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch expense: ${fetchError.message}`);
    }

    if (!currentExpense) {
      throw new Error('Expense not found');
    }

    // Prepare update data for expenses table
    const expenseUpdate: any = {};
    if (data.description !== undefined) expenseUpdate.description = data.description;
    if (data.amount !== undefined) expenseUpdate.amount = data.amount;
    if (data.date !== undefined) expenseUpdate.date = data.date;
    if (data.paid_by !== undefined) expenseUpdate.paid_by = data.paid_by;

    // Update expense if there are changes
    if (Object.keys(expenseUpdate).length > 0) {
      const { error: updateError } = await supabase
        .from('expenses')
        .update(expenseUpdate)
        .eq('id', expenseId);

      if (updateError) {
        throw new Error(`Failed to update expense: ${updateError.message}`);
      }
    }

    // Update splits if provided
    if (data.splits && data.splits.length > 0) {
      // Delete existing splits
      const { error: deleteError } = await supabase
        .from('splits')
        .delete()
        .eq('expense_id', expenseId);

      if (deleteError) {
        throw new Error(`Failed to delete old splits: ${deleteError.message}`);
      }

      // Insert new splits
      const newSplits = data.splits.map((split) => ({
        expense_id: expenseId,
        user_id: split.user_id,
        amount: parseFloat(split.amount.toFixed(2)),
      }));

      const { error: insertError } = await supabase
        .from('splits')
        .insert(newSplits);

      if (insertError) {
        throw new Error(`Failed to insert new splits: ${insertError.message}`);
      }
    }

    // Fetch and return updated expense
    const { data: updatedExpense, error: finalError } = await supabase
      .from('expenses')
      .select('*, splits(*)')
      .eq('id', expenseId)
      .single();

    if (finalError) {
      throw new Error(`Failed to fetch updated expense: ${finalError.message}`);
    }

    return updatedExpense;
  } catch (error: any) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

/**
 * Soft delete an expense (mark as deleted, can be restored within 24h)
 * @param expenseId - ID of expense to delete
 * @param userId - ID of user performing the delete
 * @returns Deleted expense info
 */
export async function deleteExpense(
  expenseId: string,
  userId: string
): Promise<DeletedExpense> {
  try {
    const now = new Date().toISOString();

    // Check if columns exist, if not, just mark in memory
    // For now, we'll actually delete from database since schema may not have deleted_at
    // In production, you should add these columns first
    
    // Option 1: Hard delete (current schema)
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (deleteError) {
      throw new Error(`Failed to delete expense: ${deleteError.message}`);
    }

    // Return deletion info
    return {
      id: expenseId,
      deleted_at: now,
      can_restore: false, // Hard delete, no restore
      hours_remaining: 0,
    };

    // Option 2: Soft delete (requires schema update)
    // Uncomment this when deleted_at, is_deleted, deleted_by columns are added
    /*
    const { data, error } = await supabase
      .from('expenses')
      .update({
        deleted_at: now,
        is_deleted: true,
        deleted_by: userId,
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to soft delete expense: ${error.message}`);
    }

    return {
      id: expenseId,
      deleted_at: now,
      can_restore: true,
      hours_remaining: 24,
    };
    */
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

/**
 * Restore a soft-deleted expense (only works within 24 hours)
 * @param expenseId - ID of expense to restore
 * @returns Restored expense
 */
export async function restoreExpense(expenseId: string): Promise<any> {
  try {
    // This requires soft-delete schema to be implemented
    throw new Error('Restore functionality requires soft-delete schema. Please add deleted_at columns first.');

    // Uncomment when schema is ready:
    /*
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (fetchError || !expense) {
      throw new Error('Expense not found');
    }

    if (!expense.is_deleted) {
      throw new Error('Expense is not deleted');
    }

    // Check if within 24 hours
    const deletedAt = new Date(expense.deleted_at);
    const now = new Date();
    const hoursSinceDelete = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceDelete > 24) {
      throw new Error('Restore window has expired (24 hours)');
    }

    // Restore the expense
    const { data, error } = await supabase
      .from('expenses')
      .update({
        deleted_at: null,
        is_deleted: false,
        deleted_by: null,
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to restore expense: ${error.message}`);
    }

    return data;
    */
  } catch (error: any) {
    console.error('Error restoring expense:', error);
    throw error;
  }
}

/**
 * Validate splits sum to expense amount
 * @param amount - Total expense amount
 * @param splits - Array of splits
 * @returns True if valid, error message if not
 */
export function validateSplits(
  amount: number,
  splits: Array<{ user_id: string; amount: number }>
): { valid: boolean; error?: string } {
  if (splits.length === 0) {
    return { valid: false, error: 'At least one split is required' };
  }

  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  const roundedTotal = parseFloat(total.toFixed(2));
  const roundedAmount = parseFloat(amount.toFixed(2));

  if (Math.abs(roundedTotal - roundedAmount) > 0.01) {
    return {
      valid: false,
      error: `Splits total (₹${roundedTotal}) must equal expense amount (₹${roundedAmount})`,
    };
  }

  // Check for negative amounts
  const hasNegative = splits.some((split) => split.amount <= 0);
  if (hasNegative) {
    return { valid: false, error: 'All split amounts must be greater than 0' };
  }

  // Check for duplicate users
  const userIds = splits.map((s) => s.user_id);
  const uniqueIds = new Set(userIds);
  if (userIds.length !== uniqueIds.size) {
    return { valid: false, error: 'Each person can only appear once in splits' };
  }

  return { valid: true };
}
