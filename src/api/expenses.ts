/**
 * Expense Detail API
 * Functions to fetch detailed expense information
 */

import { supabase } from './supabase';

export interface ExpensePayer {
  user_id: string;
  name: string;
  amount: number;
}

export interface ExpenseSplit {
  user_id: string;
  name: string;
  amount: number;
}

export interface ExpenseDetail {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
  paid_by: string; // Primary payer
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
  split_type: 'equal' | 'custom';
  created_by?: string;
}

/**
 * Get detailed information about a specific expense
 * @param expenseId - ID of the expense to fetch
 * @returns Complete expense details with payers and splits
 */
export async function getExpenseDetail(expenseId: string): Promise<ExpenseDetail> {
  try {
    // Fetch expense with splits
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (expenseError) {
      throw new Error(`Failed to fetch expense: ${expenseError.message}`);
    }

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Fetch payers (check if expense_payers table exists)
    let payers: ExpensePayer[] = [];
    const { data: payersData, error: payersError } = await supabase
      .from('expense_payers')
      .select('user_id, amount')
      .eq('expense_id', expenseId);

    if (!payersError && payersData && payersData.length > 0) {
      // Multiple payers exist
      const payerIds = payersData.map((p) => p.user_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, name')
        .in('id', payerIds);

      payers = payersData.map((payer) => {
        const user = users?.find((u) => u.id === payer.user_id);
        return {
          user_id: payer.user_id,
          name: user?.name || 'Unknown User',
          amount: parseFloat(payer.amount),
        };
      });
    } else {
      // Single payer (fallback to paid_by)
      const { data: payerUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', expense.paid_by)
        .single();

      payers = [
        {
          user_id: expense.paid_by,
          name: payerUser?.name || 'Unknown User',
          amount: parseFloat(expense.amount),
        },
      ];
    }

    // Fetch splits
    const { data: splitsData, error: splitsError } = await supabase
      .from('splits')
      .select('user_id, amount')
      .eq('expense_id', expenseId);

    if (splitsError) {
      throw new Error(`Failed to fetch splits: ${splitsError.message}`);
    }

    // Get user details for splits
    const splitUserIds = splitsData?.map((s) => s.user_id) || [];
    const { data: splitUsers } = await supabase
      .from('users')
      .select('id, name')
      .in('id', splitUserIds);

    const splits: ExpenseSplit[] = (splitsData || []).map((split) => {
      const user = splitUsers?.find((u) => u.id === split.user_id);
      return {
        user_id: split.user_id,
        name: user?.name || 'Unknown User',
        amount: parseFloat(split.amount),
      };
    });

    // Determine split type
    const totalAmount = parseFloat(expense.amount);
    const equalSplitAmount = totalAmount / splits.length;
    const isEqualSplit = splits.every(
      (s) => Math.abs(s.amount - equalSplitAmount) < 0.01
    );

    return {
      id: expense.id,
      group_id: expense.group_id,
      description: expense.description,
      amount: totalAmount,
      date: expense.date,
      created_at: expense.created_at,
      paid_by: expense.paid_by,
      payers,
      splits,
      split_type: isEqualSplit ? 'equal' : 'custom',
      created_by: expense.created_by,
    };
  } catch (error: any) {
    console.error('Error fetching expense detail:', error);
    throw error;
  }
}
