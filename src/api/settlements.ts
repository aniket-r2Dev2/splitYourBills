/**
 * Settlement Recording API
 * Functions to record and manage settlement transactions
 */

import { supabase } from './supabase';

export interface RecordSettlementInput {
  group_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
}

export interface SettlementRecord {
  id: string;
  group_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at?: string;
}

/**
 * Record a settlement transaction (mark debt as paid)
 * @param settlement - Settlement details to record
 * @returns Created settlement record with ID
 */
export async function recordSettlement(
  settlement: RecordSettlementInput
): Promise<{ id: string }> {
  try {
    // Validate input
    if (!settlement.group_id || !settlement.payer_id || !settlement.payee_id) {
      throw new Error('Missing required fields: group_id, payer_id, payee_id');
    }

    if (settlement.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (settlement.payer_id === settlement.payee_id) {
      throw new Error('Payer and payee cannot be the same');
    }

    // Round amount to 2 decimal places
    const roundedAmount = Math.round(settlement.amount * 100) / 100;

    const { data, error } = await supabase
      .from('settlement_transactions')
      .insert([
        {
          group_id: settlement.group_id,
          payer_id: settlement.payer_id,
          payee_id: settlement.payee_id,
          amount: roundedAmount,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to record settlement: ${error.message}`);
    }

    return { id: data.id };
  } catch (error: any) {
    console.error('Error recording settlement:', error);
    throw error;
  }
}

/**
 * Get completed settlements for a group
 * @param groupId - Group ID to fetch settlements for
 * @returns List of completed settlement transactions
 */
export async function getCompletedSettlements(
  groupId: string
): Promise<SettlementRecord[]> {
  try {
    const { data, error } = await supabase
      .from('settlement_transactions')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch settlements: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching completed settlements:', error);
    throw error;
  }
}

/**
 * Get all settlements (pending and completed) for a group
 * @param groupId - Group ID to fetch settlements for
 * @returns List of all settlement transactions
 */
export async function getAllSettlements(groupId: string): Promise<SettlementRecord[]> {
  try {
    const { data, error } = await supabase
      .from('settlement_transactions')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch settlements: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching all settlements:', error);
    throw error;
  }
}

/**
 * Get settlement statistics for a user in a group
 * @param groupId - Group ID
 * @param userId - User ID
 * @returns Statistics about user's settlements
 */
export async function getSettlementStats(groupId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('settlement_transactions')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'completed')
      .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

    if (error) {
      throw new Error(`Failed to fetch settlement stats: ${error.message}`);
    }

    const settlements = data || [];

    // Calculate statistics
    let totalPaid = 0;
    let totalReceived = 0;
    let paymentCount = 0;

    for (const settlement of settlements) {
      if (settlement.payer_id === userId) {
        totalPaid += settlement.amount;
        paymentCount++;
      }
      if (settlement.payee_id === userId) {
        totalReceived += settlement.amount;
      }
    }

    return {
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalReceived: Math.round(totalReceived * 100) / 100,
      paymentCount,
      settlementRecords: settlements,
    };
  } catch (error: any) {
    console.error('Error fetching settlement stats:', error);
    throw error;
  }
}

/**
 * Verify a settlement exists and get its details
 * @param groupId - Group ID
 * @param payerId - Payer user ID
 * @param payeeId - Payee user ID
 * @returns Settlement record if exists
 */
export async function getSettlement(
  groupId: string,
  payerId: string,
  payeeId: string,
  status?: 'pending' | 'completed'
) {
  try {
    let query = supabase
      .from('settlement_transactions')
      .select('*')
      .eq('group_id', groupId)
      .eq('payer_id', payerId)
      .eq('payee_id', payeeId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to fetch settlement: ${error.message}`);
    }

    return data || null;
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      return null; // No settlement found
    }
    console.error('Error fetching settlement:', error);
    throw error;
  }
}

/**
 * Get pending settlement transactions between specific users
 * @param groupId - Group ID
 * @param payerId - Payer user ID
 * @param payeeId - Payee user ID
 * @returns Pending settlement if exists
 */
export async function getPendingSettlement(
  groupId: string,
  payerId: string,
  payeeId: string
) {
  return getSettlement(groupId, payerId, payeeId, 'pending');
}

/**
 * Check if a settlement has already been recorded
 * @param groupId - Group ID
 * @param payerId - Payer user ID
 * @param payeeId - Payee user ID
 * @param amount - Amount to check
 * @returns true if settlement exists, false otherwise
 */
export async function settlementExists(
  groupId: string,
  payerId: string,
  payeeId: string,
  amount?: number
): Promise<boolean> {
  try {
    let query = supabase
      .from('settlement_transactions')
      .select('id')
      .eq('group_id', groupId)
      .eq('payer_id', payerId)
      .eq('payee_id', payeeId)
      .eq('status', 'completed');

    if (amount) {
      query = query.eq('amount', Math.round(amount * 100) / 100);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      throw new Error(`Failed to check settlement: ${error.message}`);
    }

    return (data && data.length > 0) || false;
  } catch (error: any) {
    console.error('Error checking settlement existence:', error);
    throw error;
  }
}
