import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { fetchGroupMembers, createExpenseWithCustomSplits, createExpenseWithMultiplePayers } from '../api/supabase';

type SplitAmount = {
  userId: string;
  amount: number;
};

type PayerAmount = {
  userId: string;
  amount: number;
};

export default function AddExpenseScreen({ groupId, onCreated, onCancel }: { groupId: string; onCreated: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({}); // participants
  const [payers, setPayers] = useState<Record<string, boolean>>({}); // multiple payers
  const [splits, setSplits] = useState<Record<string, string>>({}); // userId -> split amount as string
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>({}); // payer userId -> amount
  const [useCustomSplits, setUseCustomSplits] = useState(false);
  const [useMultiplePayers, setUseMultiplePayers] = useState(false);
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
        // by default select all members as participants
        const sel: Record<string, boolean> = {};
        const sp: Record<string, string> = {};
        const pay: Record<string, boolean> = {};
        const payAmt: Record<string, string> = {};
        m.forEach((u: any) => {
          sel[u.id] = true;
          sp[u.id] = '';
          pay[u.id] = false;
          payAmt[u.id] = '';
        });
        // current user is default payer
        pay[user!.id] = true;
        setSelected(sel);
        setSplits(sp);
        setPayers(pay);
        setPayerAmounts(payAmt);
      }
    } catch (err: any) {
      // ignore
    }
  };

  const toggleParticipant = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const togglePayer = (id: string) => {
    setPayers((p) => ({ ...p, [id]: !p[id] }));
  };

  const updateSplitAmount = (id: string, val: string) => {
    setSplits((s) => ({ ...s, [id]: val }));
  };

  const updatePayerAmount = (id: string, val: string) => {
    setPayerAmounts((p) => ({ ...p, [id]: val }));
  };

  const calculateEqualSplits = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount first');
      return;
    }
    const participantIds = Object.keys(selected).filter((k) => selected[k]);
    if (participantIds.length === 0) {
      Alert.alert('Error', 'Select at least one participant');
      return;
    }
    const perUser = (amt / participantIds.length).toFixed(2);
    const newSplits: Record<string, string> = {};
    members.forEach((m) => {
      newSplits[m.id] = selected[m.id] ? perUser : '';
    });
    setSplits(newSplits);
  };

  const validateAndCreate = async () => {
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

    if (useMultiplePayers) {
      // Multiple payers mode
      const payerIds = Object.keys(payers).filter((k) => payers[k]);
      if (payerIds.length === 0) {
        Alert.alert('Error', 'Select at least one payer');
        return;
      }

      let totalPaid = 0;
      const payerData: PayerAmount[] = [];
      for (const id of payerIds) {
        const val = parseFloat(payerAmounts[id] || '0');
        if (isNaN(val) || val < 0) {
          Alert.alert('Error', `Invalid amount for payer ${members.find((m) => m.id === id)?.email}`);
          return;
        }
        totalPaid += val;
        payerData.push({ userId: id, amount: val });
      }
      if (Math.abs(totalPaid - amt) > 0.01) {
        Alert.alert('Error', `Payer amounts must sum to ₹${amt.toFixed(2)}, got ₹${totalPaid.toFixed(2)}`);
        return;
      }

      // Calculate equal splits among participants
      const perUser = amt / participantIds.length;
      const splitData = participantIds.map((id) => ({ userId: id, amount: perUser }));

      setLoading(true);
      try {
        await createExpenseWithMultiplePayers({
          groupId,
          description: description.trim(),
          amount: amt,
          payers: payerData,
          splits: splitData,
        });
        Alert.alert('Success', 'Expense created with multiple payers');
        onCreated();
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to create expense');
      } finally {
        setLoading(false);
      }
    } else {
      // Single payer (current user) with custom or equal splits
      let splitData: SplitAmount[] = [];

      if (useCustomSplits) {
        // Validate custom splits
        let totalSplit = 0;
        for (const id of participantIds) {
          const val = parseFloat(splits[id] || '0');
          if (isNaN(val) || val < 0) {
            Alert.alert('Error', `Invalid amount for ${members.find((m) => m.id === id)?.email}`);
            return;
          }
          totalSplit += val;
          splitData.push({ userId: id, amount: val });
        }
        if (Math.abs(totalSplit - amt) > 0.01) {
          Alert.alert('Error', `Split amounts must sum to ₹${amt.toFixed(2)}, got ₹${totalSplit.toFixed(2)}`);
          return;
        }
      } else {
        // Equal split
        const perUser = amt / participantIds.length;
        splitData = participantIds.map((id) => ({ userId: id, amount: perUser }));
      }

      setLoading(true);
      try {
        await createExpenseWithCustomSplits({
          groupId,
          description: description.trim(),
          amount: amt,
          paidBy: user!.id,
          splits: splitData,
        });
        Alert.alert('Success', 'Expense created');
        onCreated();
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to create expense');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Dinner, Taxi, Rent" />

        <Text style={styles.label}>Total Amount</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="1000" keyboardType="numeric" />

        <View style={styles.splitModeContainer}>
          <TouchableOpacity
            style={[styles.modeBtn, !useCustomSplits && !useMultiplePayers && styles.modeBtnActive]}
            onPress={() => {
              setUseCustomSplits(false);
              setUseMultiplePayers(false);
              calculateEqualSplits();
            }}
          >
            <Text style={[styles.modeBtnText, !useCustomSplits && !useMultiplePayers && styles.modeBtnTextActive]}>Equal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, useCustomSplits && !useMultiplePayers && styles.modeBtnActive]}
            onPress={() => {
              setUseCustomSplits(true);
              setUseMultiplePayers(false);
            }}
          >
            <Text style={[styles.modeBtnText, useCustomSplits && !useMultiplePayers && styles.modeBtnTextActive]}>Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, useMultiplePayers && styles.modeBtnActive]}
            onPress={() => {
              setUseMultiplePayers(true);
              setUseCustomSplits(false);
            }}
          >
            <Text style={[styles.modeBtnText, useMultiplePayers && styles.modeBtnTextActive]}>Multi-Payer</Text>
          </TouchableOpacity>
        </View>

        {useMultiplePayers && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Payers</Text>
            {members.map((m) => (
              <View key={`payer-${m.id}`} style={styles.participantContainer}>
                <TouchableOpacity style={styles.memberRow} onPress={() => togglePayer(m.id)}>
                  <Text style={styles.memberName}>{m.name || m.email}</Text>
                  <Text style={styles.checkbox}>{payers[m.id] ? '✓' : ''}</Text>
                </TouchableOpacity>
                {payers[m.id] && (
                  <TextInput
                    style={styles.splitInput}
                    value={payerAmounts[m.id] || ''}
                    onChangeText={(val) => updatePayerAmount(m.id, val)}
                    placeholder="0"
                    keyboardType="decimal-pad"
                  />
                )}
              </View>
            ))}
          </>
        )}

        <Text style={[styles.label, { marginTop: 12 }]}>Participants</Text>
        {members.map((m) => (
          <View key={m.id} style={styles.participantContainer}>
            <TouchableOpacity style={styles.memberRow} onPress={() => toggleParticipant(m.id)}>
              <Text style={styles.memberName}>{m.name || m.email}</Text>
              <Text style={styles.checkbox}>{selected[m.id] ? '✓' : ''}</Text>
            </TouchableOpacity>
            {selected[m.id] && useCustomSplits && !useMultiplePayers && (
              <TextInput
                style={styles.splitInput}
                value={splits[m.id] || ''}
                onChangeText={(val) => updateSplitAmount(m.id, val)}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            )}
            {selected[m.id] && !useCustomSplits && !useMultiplePayers && (
              <Text style={styles.splitAmount}>₹{(parseFloat(splits[m.id] || '0') || 0).toFixed(2)}</Text>
            )}
            {useMultiplePayers && selected[m.id] && (
              <Text style={styles.splitAmount}>Split: ₹{(parseFloat(amount) / Object.keys(selected).filter(k => selected[k]).length || 0).toFixed(2)}</Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.createBtn} onPress={validateAndCreate} disabled={loading}>
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
  form: { padding: 16, backgroundColor: '#fff', margin: 10, borderRadius: 8, marginBottom: 100 },
  label: { fontWeight: '600', marginBottom: 6, color: '#333', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  splitModeContainer: { flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 10 },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  modeBtnText: { color: '#666', fontWeight: '600', fontSize: 13 },
  modeBtnTextActive: { color: '#fff' },
  participantContainer: { marginBottom: 8 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  memberName: { color: '#333', fontWeight: '500' },
  checkbox: { fontWeight: '700', color: '#007AFF' },
  splitInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 8, fontSize: 13 },
  splitAmount: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#007AFF' },
  createBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#007AFF' },
});
