import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { getGroupExpenses, fetchGroupMembers, getGroupBalances } from '../api/supabase';
import { calculateGroupDebts, SettlementTransaction } from '../api/debtSimplification';
import { useAuth } from '../contexts/AuthContext';

type Group = {
  id: string;
  name: string;
  description?: string;
};

type BalanceItem = {
  userId: string;
  balance: number;
};

export default function GroupDetailScreen({ group, onAddExpense, onBack, refreshTrigger }: { group: Group; onAddExpense: (groupId: string) => void; onBack: () => void; refreshTrigger?: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementTransaction[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load expenses
      const { data: expData, error: expError } = await getGroupExpenses(group.id);
      if (expError) {
        throw new Error(expError.message || 'Failed to load expenses');
      } else {
        setExpenses(expData || []);
      }

      // Load members
      const { data: memberData, error: memberError } = await fetchGroupMembers(group.id);
      if (memberError) {
        throw new Error(memberError.message || 'Failed to load members');
      }
      if (memberData) {
        const membersList = memberData.map((r: any) => r.users);
        setMembers(membersList);
        // Create a map of userId -> email for display
        const map: Record<string, string> = {};
        membersList.forEach((m: any) => {
          map[m.id] = m.email;
        });
        setMemberMap(map);
      }

      // Load balances
      const balData = await getGroupBalances(group.id);
      setBalances(balData);

      // Calculate simplified settlements using debt algorithm
      try {
        const calculatedSettlements = await calculateGroupDebts(group.id);
        setSettlements(calculatedSettlements);
      } catch (debtError: any) {
        console.warn('Debt simplification warning:', debtError.message);
        // Don't fail entire load if debt calculation fails
        setSettlements([]);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load group data';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderExpense = ({ item }: { item: any }) => (
    <View style={styles.expenseCard}>
      <Text style={styles.expenseDesc}>{item.description}</Text>
      <Text style={styles.expenseAmount}>₹{item.amount}</Text>
      <Text style={styles.expenseMeta}>Paid by: {memberMap[item.paid_by] || item.paid_by}</Text>
    </View>
  );

  const renderBalance = ({ item }: { item: BalanceItem }) => {
    const isPositive = item.balance > 0;
    const status = isPositive ? 'is owed' : 'owes';
    const absAmount = Math.abs(item.balance).toFixed(2);
    return (
      <View style={styles.balanceCard}>
        <Text style={styles.balanceName}>{memberMap[item.userId] || item.userId}</Text>
        <Text style={[styles.balanceAmount, { color: isPositive ? '#34C759' : '#FF3B30' }]}>
          {isPositive ? '+' : '-'}₹{absAmount}
        </Text>
        <Text style={styles.balanceStatus}>{status}</Text>
      </View>
    );
  };

  const renderSettlement = ({ item }: { item: SettlementTransaction }) => {
    const payerName = memberMap[item.payer_id] || item.payer_id;
    const payeeName = memberMap[item.payee_id] || item.payee_id;
    return (
      <View style={styles.settlementCard}>
        <View style={styles.settlementContent}>
          <Text style={styles.settlementText}>
            <Text style={styles.settlementName}>{payerName}</Text>
            <Text style={styles.settlementArrow}> → </Text>
            <Text style={styles.settlementName}>{payeeName}</Text>
          </Text>
          <Text style={styles.settlementAmount}>₹{item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.settlementStatus}>
          <Text style={styles.settlementStatusText}>⚠ Pending</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.infoContainer}>
        {group.description ? <Text style={styles.desc}>{group.description}</Text> : null}
        <Text style={styles.memberCount}>Members: {members.length}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Simplified Settlements Section */}
          {settlements.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>💰 Settlements Needed</Text>
                <Text style={styles.settlementBadge}>{settlements.length}</Text>
              </View>
              <FlatList
                scrollEnabled={false}
                data={settlements}
                renderItem={renderSettlement}
                keyExtractor={(item, index) => `${item.payer_id}-${item.payee_id}-${index}`}
                contentContainerStyle={{ gap: 10 }}
              />
              <Text style={styles.settlementHint}>Tap any settlement to record payment (coming soon)</Text>
            </View>
          )}

          {/* Balances Section */}
          {balances.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Balance Summary</Text>
              {balances.map((bal) => (
                <View key={bal.userId} style={styles.balanceRow}>
                  <Text style={styles.balanceName}>{memberMap[bal.userId] || bal.userId}</Text>
                  <Text style={[styles.balanceValue, { color: bal.balance > 0 ? '#34C759' : '#FF3B30' }]}>
                    {bal.balance > 0 ? '+' : ''}₹{bal.balance.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Expenses Section */}
          {expenses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Expenses</Text>
              <FlatList
                scrollEnabled={false}
                data={expenses}
                renderItem={renderExpense}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ gap: 8 }}
              />
            </View>
          )}

          {expenses.length === 0 && settlements.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>Add an expense to get started</Text>
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => onAddExpense(group.id)}>
        <Text style={styles.addBtnText}>+ Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    padding: 12,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
  },
  desc: {
    color: '#666',
    marginBottom: 8,
  },
  memberCount: {
    color: '#444',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settlementBadge: {
    backgroundColor: '#FF3B30',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  settlementCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settlementContent: {
    flex: 1,
  },
  settlementText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  settlementName: {
    fontWeight: 'bold',
    color: '#333',
  },
  settlementArrow: {
    color: '#FF9500',
    marginHorizontal: 4,
  },
  settlementAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 6,
  },
  settlementStatus: {
    backgroundColor: '#FFE5CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  settlementStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF9500',
  },
  settlementHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  balanceAmount: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
  balanceStatus: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },
  expenseCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  expenseDesc: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseAmount: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
  expenseMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
