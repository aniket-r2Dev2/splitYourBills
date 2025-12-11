/**
 * Debt Simplification Algorithm
 * 
 * Reduces N² payment obligations to O(N) minimal payments
 * Example: A→B, B→C, A→C becomes A→C
 */

import { supabase } from './supabase';

/**
 * Settlement transaction to record
 */
export interface SettlementTransaction {
  payer_id: string;
  payee_id: string;
  amount: number;
}

/**
 * User balance in group
 * Positive = owed money, Negative = owes money
 */
interface UserBalance {
  user_id: string;
  balance: number;
  name?: string;
}

/**
 * Calculate group debts and simplify to minimal transactions
 * @param groupId - UUID of the group
 * @returns Array of settlement transactions needed
 */
export async function calculateGroupDebts(
  groupId: string
): Promise<SettlementTransaction[]> {
  try {
    // Fetch all expenses and splits for the group
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select(
        `
        id,
        amount,
        paid_by,
        splits:splits(user_id, amount),
        payers:expense_payers(user_id, amount)
      `
      )
      .eq('group_id', groupId)
      .eq('is_deleted', false);

    if (expenseError) {
      throw new Error(`Failed to fetch expenses: ${expenseError.message}`);
    }

    if (!expenses || expenses.length === 0) {
      return [];
    }

    // Calculate net balance for each user
    const balances = calculateBalances(expenses);

    // Simplify to minimal transactions
    const settlements = simplifyDebts(balances);

    return settlements;
  } catch (error) {
    console.error('Error calculating group debts:', error);
    throw error;
  }
}

/**
 * Calculate net balance for each user (amount paid - amount owed)
 */
function calculateBalances(
  expenses: any[]
): Map<string, { balance: number; user_id: string }> {
  const balances = new Map<string, { balance: number; user_id: string }>();

  for (const expense of expenses) {
    const amount = parseFloat(expense.amount);

    // Add to balance of payers (they advanced money)
    const payers = expense.payers || [];
    if (payers.length === 0 && expense.paid_by) {
      // Fallback to paid_by if payers not populated
      addBalance(balances, expense.paid_by, amount);
    } else {
      for (const payer of payers) {
        addBalance(balances, payer.user_id, parseFloat(payer.amount));
      }
    }

    // Subtract from balance of split participants (they owe money)
    const splits = expense.splits || [];
    for (const split of splits) {
      const splitAmount = parseFloat(split.amount);
      subtractBalance(balances, split.user_id, splitAmount);
    }
  }

  return balances;
}

/**
 * Helper: Add to user's balance (they paid money)
 */
function addBalance(
  balances: Map<string, { balance: number; user_id: string }>,
  userId: string,
  amount: number
): void {
  if (!balances.has(userId)) {
    balances.set(userId, { user_id: userId, balance: 0 });
  }
  const entry = balances.get(userId)!;
  entry.balance += amount;
}

/**
 * Helper: Subtract from user's balance (they owe money)
 */
function subtractBalance(
  balances: Map<string, { balance: number; user_id: string }>,
  userId: string,
  amount: number
): void {
  if (!balances.has(userId)) {
    balances.set(userId, { user_id: userId, balance: 0 });
  }
  const entry = balances.get(userId)!;
  entry.balance -= amount;
}

/**
 * Greedy algorithm to simplify debts
 * 
 * Algorithm:
 * 1. Separate users into creditors (positive balance) and debtors (negative)
 * 2. Sort by absolute balance (highest first)
 * 3. Match debtors with creditors greedily
 * 4. Create minimal settlement transactions
 * 
 * @param balances - Map of user_id to net balance
 * @returns Minimal settlement transactions
 */
function simplifyDebts(
  balances: Map<string, { balance: number; user_id: string }>
): SettlementTransaction[] {
  const settlements: SettlementTransaction[] = [];

  // Convert to array and filter out zero balances
  const users = Array.from(balances.values()).filter(
    (u) => Math.abs(u.balance) > 0.01 // Allow for floating point rounding
  );

  // Separate creditors and debtors
  const creditors = users.filter((u) => u.balance > 0).sort(byAbsoluteBalance);
  const debtors = users.filter((u) => u.balance < 0).sort(byAbsoluteBalance);

  // Greedy matching
  let creditorIdx = 0;
  let debtorIdx = 0;

  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx];
    const debtor = debtors[debtorIdx];

    // Amount debtor owes (absolute value)
    const debtAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;

    // Settlement amount is minimum of what debtor owes and creditor is owed
    const settlementAmount = Math.min(debtAmount, creditAmount);

    // Create settlement transaction
    settlements.push({
      payer_id: debtor.user_id,
      payee_id: creditor.user_id,
      amount: roundToTwoDecimals(settlementAmount),
    });

    // Update balances
    debtor.balance += settlementAmount;
    creditor.balance -= settlementAmount;

    // Move to next creditor/debtor if current is settled
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIdx++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIdx++;
    }
  }

  return settlements;
}

/**
 * Helper: Sort by absolute balance (descending)
 */
function byAbsoluteBalance(
  a: { balance: number },
  b: { balance: number }
): number {
  return Math.abs(b.balance) - Math.abs(a.balance);
}

/**
 * Round to 2 decimal places for currency
 */
function roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Fetch existing settlement transactions for a group
 * Used to check if settlement already recorded
 */
export async function getSettlementTransactions(
  groupId: string,
  status?: 'pending' | 'completed'
): Promise<SettlementTransaction[]> {
  try {
    let query = supabase
      .from('settlement_transactions')
      .select('payer_id, payee_id, amount')
      .eq('group_id', groupId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to fetch settlement transactions: ${error.message}`
      );
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching settlement transactions:', error);
    throw error;
  }
}

/**
 * Record a settlement (mark debt as paid)
 */
export async function recordSettlement(
  groupId: string,
  payerId: string,
  payeeId: string,
  amount: number
): Promise<{ id: string }> {
  try {
    const { data, error } = await supabase
      .from('settlement_transactions')
      .insert([
        {
          group_id: groupId,
          payer_id: payerId,
          payee_id: payeeId,
          amount: roundToTwoDecimals(amount),
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to record settlement: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error recording settlement:', error);
    throw error;
  }
}

/**
 * Example usage and test case
 */
export function testDebtSimplification(): void {
  // Test case: Trip to Goa
  // Hotel: $300 (Alice paid), split 3 ways
  // Food: $90 (Bob paid), split 3 ways
  // Gas: $60 (Charlie paid), split 3 ways

  const mockExpenses = [
    {
      id: '1',
      amount: '300',
      paid_by: 'alice-id',
      payers: [{ user_id: 'alice-id', amount: '300' }],
      splits: [
        { user_id: 'alice-id', amount: '100' },
        { user_id: 'bob-id', amount: '100' },
        { user_id: 'charlie-id', amount: '100' },
      ],
    },
    {
      id: '2',
      amount: '90',
      paid_by: 'bob-id',
      payers: [{ user_id: 'bob-id', amount: '90' }],
      splits: [
        { user_id: 'alice-id', amount: '30' },
        { user_id: 'bob-id', amount: '30' },
        { user_id: 'charlie-id', amount: '30' },
      ],
    },
    {
      id: '3',
      amount: '60',
      paid_by: 'charlie-id',
      payers: [{ user_id: 'charlie-id', amount: '60' }],
      splits: [
        { user_id: 'alice-id', amount: '20' },
        { user_id: 'bob-id', amount: '20' },
        { user_id: 'charlie-id', amount: '20' },
      ],
    },
  ];

  const balances = calculateBalances(mockExpenses);
  const settlements = simplifyDebts(balances);

  console.log('\n=== DEBT SIMPLIFICATION TEST ===');
  console.log('\nBalances:');
  balances.forEach((balance, userId) => {
    console.log(`  ${userId}: $${balance.balance.toFixed(2)}`);
  });

  console.log('\nSettlements needed:');
  settlements.forEach((s) => {
    console.log(`  ${s.payer_id} pays ${s.payee_id}: $${s.amount.toFixed(2)}`);
  });

  console.log('\nExpected:');
  console.log('  bob-id pays alice-id: $60.00');
  console.log('  charlie-id pays alice-id: $90.00');
}
