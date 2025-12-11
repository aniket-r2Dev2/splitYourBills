# Split Your Bills - Phase 1 MVP Implementation Guide

This guide outlines the remaining work to complete Phase 1 (Core MVP) of the Split Your Bills app.

## Current Status

✅ **Complete:**
- User authentication (Supabase)
- Group creation and viewing
- Basic expense creation
- Multiple payers support
- Custom splits implementation
- Basic balance calculation

🚧 **In Progress:**
- Debt simplification algorithm (started)
- Settlement recording

## Phase 1 MVP Roadmap

### Priority 1: Debt Simplification (CRITICAL)
**Status:** Code scaffolding complete ([PR #XXX](https://github.com/aniket-r2Dev2/splitYourBills/issues/1))

**What's done:**
- ✅ Algorithm implementation in `src/api/debtSimplification.ts`
- ✅ Unit tests with 5 test scenarios
- ✅ TypeScript types and JSDoc
- ✅ Edge case handling (decimal rounding, multiple payers)

**Next steps:**
1. **Run the tests** (without Jest, using the test-supabase.js pattern):
   ```bash
   # In test-supabase.js, import and call:
   import { testDebtSimplification } from './src/api/debtSimplification';
   testDebtSimplification();
   ```

2. **Verify the algorithm** with your test data:
   - Use existing groups from your dev environment
   - Call `calculateGroupDebts(groupId)` and verify output
   - Ensure settlements match manual calculation

3. **Create settlement_transactions table** in Supabase:
   ```sql
   create table settlement_transactions (
     id uuid primary key default gen_random_uuid(),
     group_id uuid references groups(id) on delete cascade,
     payer_id uuid references users(id),
     payee_id uuid references users(id),
     amount decimal(10, 2) not null,
     status text default 'pending',
     created_at timestamp default now(),
     completed_at timestamp
   );

   -- RLS Policy
   alter table settlement_transactions enable row level security;
   create policy "Users can view settlements in their groups"
     on settlement_transactions for select
     using (auth.uid() in (select user_id from group_members where group_id = group_id));
   ```

4. **Integrate into GroupDetailScreen:**
   ```typescript
   import { calculateGroupDebts } from '../api/debtSimplification';

   const [settlements, setSettlements] = useState<SettlementTransaction[]>([]);

   useEffect(() => {
     calculateGroupDebts(groupId)
       .then(setSettlements)
       .catch(console.error);
   }, [groupId]);

   // Display settlements:
   // settlements.map(s => (
   //   <Text>{s.payer_id} owes {s.payee_id}: ${s.amount}</Text>
   // ))
   ```

**Estimated time:** 2-3 hours (1 day)

---

### Priority 2: Settlement Recording
**Status:** Issue created ([#2](https://github.com/aniket-r2Dev2/splitYourBills/issues/2))

**Steps:**
1. Create `SettlementModal.tsx` component:
   ```typescript
   interface SettlementModalProps {
     settlement: SettlementTransaction;
     onConfirm: (amount: number) => Promise<void>;
     onCancel: () => void;
   }

   export function SettlementModal({ settlement, onConfirm, onCancel }: SettlementModalProps) {
     const [amount, setAmount] = useState(settlement.amount);
     const [loading, setLoading] = useState(false);

     const handleSubmit = async () => {
       setLoading(true);
       try {
         await recordSettlement(
           settlement.group_id,
           settlement.payer_id,
           settlement.payee_id,
           amount
         );
         showToast('Settlement recorded!');
         onConfirm(amount);
       } catch (error) {
         showToast('Failed to record settlement', 'error');
       } finally {
         setLoading(false);
       }
     };

     return (
       <Modal visible={true} onRequestClose={onCancel}>
        <Text>Confirm Settlement</Text>
        <Text>{settlement.payer_id} pays {settlement.payee_id}</Text>
        <TextInput
          value={amount.toString()}
          onChangeText={(v) => setAmount(parseFloat(v))}
          placeholder="Amount"
          keyboardType="decimal-pad"
        />
        <Button onPress={handleSubmit} disabled={loading}>Record Payment</Button>
        <Button onPress={onCancel}>Cancel</Button>
       </Modal>
     );
   }
   ```

2. Add to GroupDetailScreen:
   ```typescript
   const [selectedSettlement, setSelectedSettlement] = useState<SettlementTransaction | null>(null);

   // In render:
   {settlements.map(s => (
     <Pressable key={`${s.payer_id}-${s.payee_id}`} onPress={() => setSelectedSettlement(s)}>
       <Text>{s.payer_id} owes {s.payee_id}: ${s.amount}</Text>
     </Pressable>
   ))}

   {selectedSettlement && (
     <SettlementModal
       settlement={selectedSettlement}
       onConfirm={() => {
         setSelectedSettlement(null);
         // Refresh settlements
         refetch();
       }}
       onCancel={() => setSelectedSettlement(null)}
     />
   )}
   ```

**Estimated time:** 3-4 hours (1-2 days)

---

### Priority 3: Expense Detail View
**Status:** Issue created ([#4](https://github.com/aniket-r2Dev2/splitYourBills/issues/4))

**File structure:**
```
src/screens/
├── ExpenseDetailScreen.tsx    [NEW]
└── components/
    ├── SplitBreakdown.tsx     [NEW]
    └── PaidBySection.tsx      [NEW]
```

**ExpenseDetailScreen.tsx:**
```typescript
export function ExpenseDetailScreen({ route, navigation }: any) {
  const { expenseId, groupId } = route.params;
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseDetail(expenseId)
      .then(setExpense)
      .finally(() => setLoading(false));
  }, [expenseId]);

  if (loading) return <LoadingSpinner />;
  if (!expense) return <Text>Expense not found</Text>;

  return (
    <ScrollView>
      <Text style={styles.title}>{expense.description}</Text>
      <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
      <Text style={styles.date}>{formatDate(expense.date)}</Text>
      
      <PaidBySection payers={expense.payers} />
      <SplitBreakdown splits={expense.splits} />
      
      <View style={styles.actions}>
        <Button onPress={() => navigateToEdit(expense)}>Edit</Button>
        <Button onPress={() => showDeleteConfirm(expense)}>Delete</Button>
      </View>
    </ScrollView>
  );
}
```

**API Query:**
```typescript
export async function fetchExpenseDetail(expenseId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      payers:expense_payers(user_id, amount, user:users(name)),
      splits:splits(user_id, amount, user:users(name))
    `)
    .eq('id', expenseId)
    .single();

  if (error) throw error;
  return data;
}
```

**Estimated time:** 2-3 hours (half day)

---

### Priority 4: Expense Editing & Deletion
**Status:** Issue created ([#3](https://github.com/aniket-r2Dev2/splitYourBills/issues/3))

**Database changes:**
```sql
alter table expenses add column (
  deleted_at timestamp,
  is_deleted boolean default false,
  deleted_by uuid references users(id)
);

-- Update RLS to hide deleted:
alter policy "Users can view group expenses"
  on expenses
  using (
    auth.uid() in (select user_id from group_members where group_id = expenses.group_id)
    and is_deleted = false
  );
```

**EditExpenseScreen.tsx:**
- Reuse `AddExpenseScreen` logic
- Pre-fill with existing expense data
- Validate changes
- Recalculate balances on save

**Delete flow:**
```typescript
const handleDelete = async () => {
  const confirmed = await showAlert(
    'Delete Expense?',
    'This will be reversed. You can undo within 24 hours.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: confirmDelete }
    ]
  );
};

const confirmDelete = async () => {
  try {
    await supabase
      .from('expenses')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', expenseId);
    
    showToast('Expense deleted', {
      action: {
        label: 'Undo',
        onPress: () => undoDelete(expenseId)
      },
      duration: 5000
    });
  } catch (error) {
    showToast('Failed to delete', 'error');
  }
};
```

**Estimated time:** 4-5 hours (1-2 days)

---

### Priority 5: Data Validation & Error Handling
**Status:** Issue created ([#5](https://github.com/aniket-r2Dev2/splitYourBills/issues/5))

**Create validation layer:**
```typescript
// src/validators/expenseValidator.ts
export function validateExpense(expense: ExpenseInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!expense.description?.trim()) {
    errors.push({ field: 'description', message: 'Required' });
  }
  
  const amount = new Decimal(expense.amount);
  if (amount.lte(0)) {
    errors.push({ field: 'amount', message: 'Must be > 0' });
  }
  
  const splitSum = expense.splits.reduce(
    (sum, s) => sum.plus(new Decimal(s.amount)),
    new Decimal(0)
  );
  
  if (!splitSum.equals(amount)) {
    errors.push({ field: 'splits', message: 'Must equal total' });
  }
  
  return errors;
}
```

**Error handling pattern:**
```typescript
try {
  const errors = validateExpense(input);
  if (errors.length > 0) {
    showToast(errors[0].message, 'error');
    return;
  }
  
  const result = await addExpense(input);
  showToast('Expense added!');
  navigation.goBack();
} catch (error) {
  if (error.code === 'PGRST301') {
    showToast('You do not have permission to do this', 'error');
  } else if (error.code === 'NETWORK_ERROR') {
    showToast('Network error. Check your connection.', 'error');
  } else {
    showToast('Something went wrong', 'error');
    console.error(error);
  }
}
```

**Install Decimal.js for currency math:**
```bash
npm install decimal.js
npm install --save-dev @types/decimal.js
```

**Estimated time:** 4-5 hours (1-2 days)

---

## Implementation Timeline

```
Week 1:
└─ Mon: Debt Simplification (finish & test)
└─ Tue-Wed: Settlement Recording
└─ Thu-Fri: Expense Detail View

Week 2:
└─ Mon-Tue: Expense Editing & Deletion
└─ Wed-Thu: Data Validation & Error Handling
└─ Fri: Testing & Bug Fixes
```

**Total effort:** 18-22 hours (~2.5-3 weeks part-time)

## Testing Strategy

### Unit Tests
- Debt simplification algorithm (done ✅)
- Validators
- Error handlers

### Integration Tests
- API calls with Supabase
- Data flow from DB → UI
- User workflows (create → settle)

### Manual Testing
1. **Happy path:** Create group → Add expense → View settlements → Record payment
2. **Edge cases:** Decimal amounts, multiple payers, circular debts
3. **Error scenarios:** Network down, permission denied, invalid input
4. **Performance:** 50+ people, 100+ expenses

### Test Data
Use `test-supabase.js` to:
1. Create test group with 4-5 users
2. Add 5-10 test expenses
3. Call `calculateGroupDebts(groupId)`
4. Verify output matches manual calculation

## Code Quality Checklist

Before merging each feature:
- [ ] TypeScript types complete (no `any`)
- [ ] JSDoc comments on public functions
- [ ] Error handling for all APIs
- [ ] Loading states in UI
- [ ] User feedback (toast/alerts)
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] No console errors/warnings
- [ ] Mobile responsive (tested on device/emulator)

## Dependencies to Add

```bash
# Currency math (safe decimal operations)
npm install decimal.js @types/decimal.js

# Toast notifications (if not already installed)
npm install react-native-toast-notifications

# Date formatting
npm install date-fns
```

## File Structure After Completion

```
src/
├── api/
│   ├── debtSimplification.ts      ✅ DONE
│   ├── expenses.ts                🚧 update
│   ├── settlements.ts             🚧 new
│   └── supabase.ts
├── screens/
│   ├── GroupDetailScreen.tsx      🚧 update
│   ├── AddExpenseScreen.tsx       🚧 update
│   ├── EditExpenseScreen.tsx      🚧 new
│   ├── ExpenseDetailScreen.tsx    🚧 new
│   └── SettlementModal.tsx        🚧 new
├── validators/                    🚧 new
│   ├── expenseValidator.ts
│   ├── settlementValidator.ts
│   ├── splitValidator.ts
│   └── index.ts
├── utils/
│   ├── errorHandler.ts            🚧 new
│   └── formatters.ts
└── __tests__/
    ├── debtSimplification.test.ts ✅ DONE
    └── validators.test.ts         🚧 new
```

## Next Steps

1. **This week:** Finish Debt Simplification
   - [ ] Test algorithm with your data
   - [ ] Create settlement_transactions table
   - [ ] Integrate into GroupDetailScreen

2. **Next week:** Settlement Recording + Detail View
   - [ ] Build SettlementModal
   - [ ] Build ExpenseDetailScreen
   - [ ] Wire up navigation

3. **Week after:** Edit/Delete + Validation
   - [ ] Expense editing
   - [ ] Soft delete with undo
   - [ ] Input validation
   - [ ] Error handling

## Resources

- [Decimal.js Documentation](https://mikemcl.github.io/decimal.js/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Native Best Practices](https://reactnative.dev/docs/intro-react-native-modules)
- [Your test-supabase.js](./test-supabase.js)

## Questions?

Refer to the GitHub issues for detailed requirements:
- Issue #1: Debt Simplification
- Issue #2: Settlement Recording
- Issue #3: Expense Editing
- Issue #4: Expense Detail View
- Issue #5: Data Validation

---

**Last updated:** Dec 11, 2025
**Author:** AI Assistant
**Status:** Phase 1 MVP In Progress
