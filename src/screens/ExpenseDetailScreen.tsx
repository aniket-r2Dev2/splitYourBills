import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getExpenseDetail, ExpenseDetail } from '../api/expenses';

interface ExpenseDetailScreenProps {
  expenseId: string;
  onBack: () => void;
  onEdit?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
}

export default function ExpenseDetailScreen({
  expenseId,
  onBack,
  onEdit,
  onDelete,
}: ExpenseDetailScreenProps) {
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpenseDetail();
  }, [expenseId]);

  const loadExpenseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenseDetail(expenseId);
      setExpense(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load expense details');
      console.error('Error loading expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit && expense) {
      onEdit(expense.id);
    }
  };

  const handleDelete = () => {
    if (!expense) return;

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(expense.id);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense Details</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense Details</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'Expense not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExpenseDetail}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Expense Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.expenseTitle}>{expense.description}</Text>
          <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
          <View style={styles.divider} />
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{expense.amount.toFixed(2)}</Text>
        </View>

        {/* Paid By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Paid By</Text>
          <View style={styles.card}>
            {expense.payers.map((payer, index) => (
              <View key={`payer-${index}`} style={styles.listItem}>
                <Text style={styles.listItemName}>{payer.name}</Text>
                <Text style={styles.listItemAmount}>₹{payer.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Split Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Split Breakdown</Text>
            <View style={styles.splitTypeBadge}>
              <Text style={styles.splitTypeText}>
                {expense.split_type === 'equal' ? 'Equal Split' : 'Custom Split'}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            {expense.splits.map((split, index) => (
              <View key={`split-${index}`} style={styles.listItem}>
                <Text style={styles.listItemName}>{split.name}</Text>
                <Text style={styles.listItemAmount}>₹{split.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 This expense was split among {expense.splits.length} person
            {expense.splits.length > 1 ? 's' : ''}
            {expense.split_type === 'equal' && ' equally'}.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  expenseDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  splitTypeBadge: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  splitTypeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  listItemAmount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1b5e20',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
