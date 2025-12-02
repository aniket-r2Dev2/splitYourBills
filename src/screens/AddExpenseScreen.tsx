import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { fetchGroupMembers, createExpense } from '../api/supabase';

export default function AddExpenseScreen({ groupId, onCreated, onCancel }: { groupId: string; onCreated: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await fetchGroupMembers(groupId);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to load members');
      } else {
        const m = (data || []).map((row: any) => row.users).filter(Boolean);
        setMembers(m);
        // by default select all members
        const sel: Record<string, boolean> = {};
        m.forEach((u: any) => (sel[u.id] = true));
        setSelected(sel);
      }
    } catch (err: any) {
      // ignore
    }
  };

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const handleCreate = async () => {
    const amt = parseFloat(amount);
    if (!description.trim() || !amt || amt <= 0) {
      Alert.alert('Error', 'Please enter description and valid amount');
      return;
    }
    const participantIds = Object.keys(selected).filter((k) => selected[k]);
    if (participantIds.length === 0) {
      Alert.alert('Error', 'Select at least one participant');
      return;
    }
    setLoading(true);
    try {
      await createExpense({
        groupId,
        description: description.trim(),
        amount: amt,
        paidBy: user!.id,
        participantIds,
      });
      Alert.alert('Success', 'Expense created');
      onCreated();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Dinner, Taxi, Rent" />

        <Text style={styles.label}>Amount</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="1000" keyboardType="numeric" />

        <Text style={[styles.label, { marginTop: 12 }]}>Participants</Text>
        {members.map((m) => (
          <TouchableOpacity key={m.id} style={styles.memberRow} onPress={() => toggle(m.id)}>
            <Text style={styles.memberName}>{m.name || m.email}</Text>
            <Text style={styles.checkbox}>{selected[m.id] ? '✓' : ''}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
          <Text style={styles.createBtnText}>{loading ? 'Creating...' : 'Create Expense'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 16, backgroundColor: '#fff', margin: 10, borderRadius: 8 },
  label: { fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  memberName: { color: '#333' },
  checkbox: { fontWeight: '700', color: '#007AFF' },
  createBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { marginTop: 10, alignItems: 'center' },
  cancelText: { color: '#007AFF' },
});
