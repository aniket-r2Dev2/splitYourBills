import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SettlementTransaction } from '../api/debtSimplification';
import { recordSettlement } from '../api/settlements';

interface SettlementModalProps {
  visible: boolean;
  settlement: SettlementTransaction | null;
  groupId: string;
  payerName: string;
  payeeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SettlementModal({
  visible,
  settlement,
  groupId,
  payerName,
  payeeName,
  onClose,
  onSuccess,
}: SettlementModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settlement) {
      setAmount(settlement.amount.toFixed(2));
      setError(null);
    }
  }, [settlement, visible]);

  const handleRecordPayment = async () => {
    if (!settlement) return;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parsedAmount > settlement.amount + 0.01) {
      setError(`Amount cannot exceed ₹${settlement.amount.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Record the settlement
      await recordSettlement({
        group_id: groupId,
        payer_id: settlement.payer_id,
        payee_id: settlement.payee_id,
        amount: parsedAmount,
      });

      // Show success message
      Alert.alert('Success', `Settlement recorded!\n${payerName} paid ${payeeName} ₹${parsedAmount.toFixed(2)}`, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to record settlement';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Record Settlement</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Payment Details</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  <Text style={styles.bold}>{payerName}</Text>
                  <Text style={styles.arrow}> is paying </Text>
                  <Text style={styles.bold}>{payeeName}</Text>
                </Text>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount (₹)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    setError(null);
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  editable={!loading}
                  placeholderTextColor="#ccc"
                />
              </View>
              {amount && (
                <Text style={styles.amountDisplay}>
                  {parseFloat(amount).toFixed(2)} rupees
                </Text>
              )}
            </View>

            {/* Suggested Amount */}
            {settlement && (
              <TouchableOpacity
                style={styles.suggestedAmount}
                onPress={() => setAmount(settlement.amount.toFixed(2))}
                disabled={loading}
              >
                <Text style={styles.suggestedLabel}>Full amount:</Text>
                <Text style={styles.suggestedValue}>₹{settlement.amount.toFixed(2)}</Text>
              </TouchableOpacity>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Record this payment when {payerName} sends money to {payeeName}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmBtn, loading && styles.buttonDisabled]}
              onPress={handleRecordPayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Record Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryRow: {
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#007AFF',
  },
  arrow: {
    color: '#999',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  amountDisplay: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  suggestedAmount: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestedLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  suggestedValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#ffe0e0',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#CC0000',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1b5e20',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  cancelBtnText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#007AFF',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
