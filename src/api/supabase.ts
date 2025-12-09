import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project dashboard
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase URL and/or Anon Key are missing. Add them to your .env file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for common operations
export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const fetchGroups = async () => {
  return await supabase.from('groups').select('*');
};

export const fetchGroupMembers = async (groupId: string) => {
  return await supabase
    .from('group_members')
    .select('*, users(*)')
    .eq('group_id', groupId);
};

export const fetchExpenses = async (groupId: string) => {
  return await supabase
    .from('expenses')
    .select('*, splits(*)')
    .eq('group_id', groupId);
};

// Create a new group and add the creator as a member
export const createGroup = async (data: {
  name: string;
  description?: string;
  createdBy: string;
}) => {
  try {
    // Insert the group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: data.name,
        description: data.description || null,
        created_by: data.createdBy,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: data.createdBy,
      });

    if (memberError) throw memberError;

    return groupData;
  } catch (error) {
    throw error;
  }
};

// Add a user to a group (group creator only)
export const addGroupMember = async (groupId: string, userId: string) => {
  return await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
    })
    .select()
    .single();
};

// Get groups for the current user (groups they're members of)
export const getUserGroups = async (userId: string) => {
  return await supabase
    .from('group_members')
    .select('groups(*)')
    .eq('user_id', userId);
};

// Create an expense and corresponding splits
export const createExpense = async (data: {
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  participantIds: string[]; // list of user ids to split among
}) => {
  try {
    // Insert expense
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: data.groupId,
        description: data.description,
        amount: data.amount,
        paid_by: data.paidBy,
        date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Calculate equal split by default
    const perUser = parseFloat((data.amount / data.participantIds.length).toFixed(2));

    const splits = data.participantIds.map((uid) => ({
      expense_id: expenseData.id,
      user_id: uid,
      amount: perUser,
    }));

    const { error: splitsError } = await supabase.from('splits').insert(splits);
    if (splitsError) throw splitsError;

    return expenseData;
  } catch (error) {
    throw error;
  }
};

// Create an expense with custom split amounts
export const createExpenseWithCustomSplits = async (data: {
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splits: Array<{ userId: string; amount: number }>;
}) => {
  try {
    // Insert expense
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: data.groupId,
        description: data.description,
        amount: data.amount,
        paid_by: data.paidBy,
        date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    const splits = data.splits.map((split) => ({
      expense_id: expenseData.id,
      user_id: split.userId,
      amount: parseFloat(split.amount.toFixed(2)),
    }));

    const { error: splitsError } = await supabase.from('splits').insert(splits);
    if (splitsError) throw splitsError;

    return expenseData;
  } catch (error) {
    throw error;
  }
};

// Get expenses for a group including splits
export const getGroupExpenses = async (groupId: string) => {
  return await supabase.from('expenses').select('*, splits(*)').eq('group_id', groupId).order('created_at', { ascending: false });
};

// Calculate settlements for a group based on expenses and splits
// Returns array of settlements: {from: userId, to: userId, amount: number}
export const calculateSettlements = async (groupId: string) => {
  try {
    // Get all expenses and splits for the group
    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('*, splits(*)')
      .eq('group_id', groupId);

    if (expError) throw expError;

    // Build a balance map: balance[userId] = net amount (positive = owed to, negative = owes)
    const balance: Record<string, number> = {};

    expenses.forEach((expense: any) => {
      const paidBy = expense.paid_by;
      const totalAmount = parseFloat(expense.amount);

      // Initialize payer if not exists
      if (!balance[paidBy]) balance[paidBy] = 0;

      // Add the amount paid by this person
      balance[paidBy] += totalAmount;

      // Subtract each person's share
      expense.splits.forEach((split: any) => {
        const userId = split.user_id;
        const splitAmount = parseFloat(split.amount);
        if (!balance[userId]) balance[userId] = 0;
        balance[userId] -= splitAmount;
      });
    });

    // Convert balances to settlements (who owes whom)
    const settlements: Array<{ from: string; to: string; amount: number }> = [];
    const debtors = Object.entries(balance).filter(([, amt]) => amt < 0);
    const creditors = Object.entries(balance).filter(([, amt]) => amt > 0);

    // Simple greedy algorithm: match debtors with creditors
    for (const [debtor, debtAmount] of debtors) {
      let remaining = Math.abs(debtAmount);

      for (let i = 0; i < creditors.length && remaining > 0; i++) {
        const [creditor, creditAmount] = creditors[i];
        const settleAmount = Math.min(remaining, creditAmount);

        if (settleAmount > 0) {
          settlements.push({
            from: debtor,
            to: creditor,
            amount: parseFloat(settleAmount.toFixed(2)),
          });

          creditors[i][1] -= settleAmount;
          remaining -= settleAmount;
        }
      }
    }

    return settlements;
  } catch (error) {
    console.error('Error calculating settlements:', error);
    throw error;
  }
};

// Get settlement summary for a group (balances per user)
export const getGroupBalances = async (groupId: string) => {
  try {
    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('*, splits(*)')
      .eq('group_id', groupId);

    if (expError) throw expError;

    const balance: Record<string, number> = {};

    expenses.forEach((expense: any) => {
      const paidBy = expense.paid_by;
      const totalAmount = parseFloat(expense.amount);

      if (!balance[paidBy]) balance[paidBy] = 0;
      balance[paidBy] += totalAmount;

      expense.splits.forEach((split: any) => {
        const userId = split.user_id;
        const splitAmount = parseFloat(split.amount);
        if (!balance[userId]) balance[userId] = 0;
        balance[userId] -= splitAmount;
      });
    });

    // Return as array with user details
    return Object.entries(balance).map(([userId, amount]) => ({
      userId,
      balance: parseFloat(amount.toFixed(2)),
    }));
  } catch (error) {
    console.error('Error getting group balances:', error);
    throw error;
  }
};

// Create an expense with multiple payers and splits
export const createExpenseWithMultiplePayers = async (data: {
  groupId: string;
  description: string;
  amount: number;
  payers: Array<{ userId: string; amount: number }>;
  splits: Array<{ userId: string; amount: number }>;
}) => {
  try {
    // Use first payer as the primary paid_by (main payer)
    const primaryPayer = data.payers[0].userId;

    // Insert expense with primary payer
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: data.groupId,
        description: data.description,
        amount: data.amount,
        paid_by: primaryPayer,
        date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Insert splits
    const splits = data.splits.map((split) => ({
      expense_id: expenseData.id,
      user_id: split.userId,
      amount: parseFloat(split.amount.toFixed(2)),
    }));

    const { error: splitsError } = await supabase.from('splits').insert(splits);
    if (splitsError) throw splitsError;

    // Insert expense payers for all contributors
    const payers = data.payers.map((payer) => ({
      expense_id: expenseData.id,
      user_id: payer.userId,
      amount: parseFloat(payer.amount.toFixed(2)),
    }));

    const { error: payersError } = await supabase
      .from('expense_payers')
      .insert(payers);
    if (payersError) throw payersError;

    return expenseData;
  } catch (error) {
    throw error;
  }
};

