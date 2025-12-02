import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getGroupExpenses, fetchGroupMembers } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';

type Group = {
  id: string;
  name: string;
  description?: string;
};

export default function GroupDetailScreen({ group, onAddExpense, onBack, refreshTrigger }: { group: Group; onAddExpense: (groupId: string) => void; onBack: () => void; refreshTrigger?: number }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
    loadMembers();
  }, [refreshTrigger]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await getGroupExpenses(group.id);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to load expenses');
      } else {
        setExpenses(data || []);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await fetchGroupMembers(group.id);
      if (!error && data) {
        // data from fetchGroupMembers returns rows from group_members with a nested users property
        setMembers(data.map((r: any) => r.users));
      }
    } catch (err) {
      // ignore
    }
  };

  const renderExpense = ({ item }: { item: any }) => (
    <View style={styles.expenseCard}>
      <Text style={styles.expenseDesc}>{item.description}</Text>
      <Text style={styles.expenseAmount}>₹{item.amount}</Text>
      <Text style={styles.expenseMeta}>Paid by: {item.paid_by}</Text>
    </View>
  );

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
        <FlatList data={expenses} renderItem={renderExpense} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 12 }} />
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
  expenseCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  addBtn: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
