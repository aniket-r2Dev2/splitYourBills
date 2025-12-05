import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { getGroupExpenses, fetchGroupMembers, getGroupBalances } from '../api/supabase';
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
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load expenses
      const { data: expData, error: expError } = await getGroupExpenses(group.id);
      if (expError) {
        Alert.alert('Error', expError.message || 'Failed to load expenses');
      } else {
        setExpenses(expData || []);
      }

      // Load members
      const { data: memberData, error: memberError } = await fetchGroupMembers(group.id);
      if (!memberError && memberData) {
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
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load group data');
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
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Balances Section */}
          {balances.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settlement Summary</Text>
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
              <Text style={styles.sectionTitle}>Expenses</Text>
              <FlatList
                scrollEnabled={false}
                data={expenses}
                renderItem={renderExpense}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ gap: 8 }}
              />
            </View>
          )}

          {expenses.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No expenses yet</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
