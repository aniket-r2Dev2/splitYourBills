import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { updateExpense, validateSplits } from '../api/expenseActions';
import { getExpenseDetail, ExpenseDetail } from '../api/expenses';

interface EditExpenseModalProps {
  visible: boolean;
  expenseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditExpenseModal({
  visible,
  expenseId,
  onClose,
  onSuccess,
}: EditExpenseModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<Array<{ user_id: string; name: string; amount: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadExpense();
    }
  }, [visible, expenseId]);

  const loadExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenseDetail(expenseId);
      setExpense(data);
      setDescription(data.description);
      setAmount(data.amount.toString());
      setSplits(
        data.splits.map((s) => ({
          user_id: s.user_id,
          name: s.name,
          amount: s.amount.toString(),
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load expense');
      Alert.alert('Error', 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitAmountChange = (index: number, value: string) => {
    const newSplits = [...splits];
    newSplits[index].amount = value;
    setSplits(newSplits);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate inputs
      if (!description.trim()) {
        setError('Description is required');
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }

      // Parse and validate splits
      const parsedSplits = splits.map((s) => ({
        user_id: s.user_id,
        amount: parseFloat(s.amount),
      }));

      const validation = validateSplits(numAmount, parsedSplits);
      if (!validation.valid) {
        setError(validation.error || 'Invalid splits');
        return;
      }

      // Update expense
      await updateExpense(expenseId, {
        description: description.trim(),
        amount: numAmount,
        splits: parsedSplits,
      });

      Alert.alert('Success', 'Expense updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
      Alert.alert('Error', err.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDistributeEvenly = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || splits.length === 0) return;

    const perPerson = numAmount / splits.length;
    const roundedPerPerson = parseFloat(perPerson.toFixed(2));
    
    const newSplits = splits.map((s, index) => {
      // Last person gets any rounding difference
      if (index === splits.length - 1) {
        const othersTotal = roundedPerPerson * (splits.length - 1);
        const lastAmount = numAmount - othersTotal;
        return { ...s, amount: lastAmount.toFixed(2) };
      }
      return { ...s, amount: roundedPerPerson.toFixed(2) };
    });

    setSplits(newSplits);
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading expense...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Expense</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="What was this expense for?"
                placeholderTextColor="#999"
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Amount (₹)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>

            {/* Splits */}
            <View style={styles.inputGroup}>
              <View style={styles.splitsHeader}>
                <Text style={styles.label}>Split Among</Text>
                <TouchableOpacity onPress={handleDistributeEvenly}>
                  <Text style={styles.distributeButton}>Distribute Evenly</Text>
                </TouchableOpacity>
              </View>
              {splits.map((split, index) => (
                <View key={split.user_id} style={styles.splitRow}>
                  <Text style={styles.splitName}>{split.name}</Text>
                  <TextInput
                    style={styles.splitInput}
                    value={split.amount}
                    onChangeText={(value) => handleSplitAmountChange(index, value)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999"
                  />
                </View>
              ))}
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Changes will recalculate group balances. Make sure splits add up to the total amount.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  splitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributeButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  splitName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  splitInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    width: 100,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1b5e20',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
