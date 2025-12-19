// Updated GroupDetailScreen with Edit/Delete Integration
// Add these imports at the top:
import EditExpenseModal from '../components/EditExpenseModal';
import { deleteExpense } from '../api/expenseActions';

// Add these state variables:
const [editModalVisible, setEditModalVisible] = useState(false);
const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

// Update the handleExpenseDetailBack function:
const handleExpenseDetailBack = () => {
  setSelectedExpenseId(null);
  loadData(); // Reload to get updated balances
};

// Add handler for edit:
const handleEdit = (expenseId: string) => {
  setEditingExpenseId(expenseId);
  setEditModalVisible(true);
  setSelectedExpenseId(null); // Close detail view
};

// Add handler for delete:
const handleDelete = async (expenseId: string) => {
  try {
    const { user } = useAuth();
    if (!user) throw new Error('Not authenticated');

    await deleteExpense(expenseId, user.id);
    Alert.alert('Success', 'Expense deleted successfully');
    setSelectedExpenseId(null); // Close detail view
    loadData(); // Reload data
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to delete expense');
  }
};

// Add handler for edit success:
const handleEditSuccess = () => {
  setEditModalVisible(false);
  setEditingExpenseId(null);
  loadData(); // Reload data
};

// Update the ExpenseDetailScreen rendering:
if (selectedExpenseId) {
  return (
    <>
      <ExpenseDetailScreen
        expenseId={selectedExpenseId}
        onBack={handleExpenseDetailBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Edit Modal */}
      {editingExpenseId && (
        <EditExpenseModal
          visible={editModalVisible}
          expenseId={editingExpenseId}
          onClose={() => {
            setEditModalVisible(false);
            setEditingExpenseId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

// Add the edit modal to the main render (before the closing tag):
return (
  <View style={styles.container}>
    {/* ... existing code ... */}
    
    {/* Edit Expense Modal */}
    {editingExpenseId && (
      <EditExpenseModal
        visible={editModalVisible}
        expenseId={editingExpenseId}
        onClose={() => {
          setEditModalVisible(false);
          setEditingExpenseId(null);
        }}
        onSuccess={handleEditSuccess}
      />
    )}
  </View>
);
