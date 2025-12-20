# Data Validation - Quick Reference

## Quick Start

### 1. Validate Expense

```typescript
import { validateExpense, isValidExpense } from '../validators';

const expense = { description, amount, paid_by, splits };

if (!isValidExpense(expense)) {
  const errors = validateExpense(expense);
  Alert.alert('Error', errors[0].message);
  return;
}
```

### 2. Validate Splits

```typescript
import { validateSplits, distributeEvenly } from '../validators';

// Check splits
const errors = validateSplits(splits, totalAmount);
if (errors.length > 0) {
  Alert.alert('Error', errors[0].message);
}

// Distribute evenly
const splits = distributeEvenly(userIds, amount);
```

### 3. Validate Settlement

```typescript
import { isValidSettlement } from '../validators';

if (!isValidSettlement(settlement)) {
  Alert.alert('Error', 'Invalid settlement data');
}
```

### 4. Handle Errors

```typescript
import { handleError, logError } from '../utils/errorHandler';

try {
  await apiCall();
} catch (error) {
  Alert.alert('Error', handleError(error));
  logError(error, 'apiCall');
}
```

### 5. Retry with Backoff

```typescript
import { retryWithBackoff } from '../utils/errorHandler';

const data = await retryWithBackoff(() => apiCall(), 3);
```

---

## Validation Rules

### Expense
- ✅ Description: 1-200 characters
- ✅ Amount: > 0, < ₹10M
- ✅ Date: not future
- ✅ Splits: sum = total (±₹0.01)
- ✅ Splits: no duplicates

### Split
- ✅ Amount: > 0
- ✅ Sum = total (±₹0.01)
- ✅ No duplicate users
- ✅ At least 1 split

### Settlement
- ✅ Amount: > 0, < ₹10M
- ✅ Payer ≠ Payee
- ✅ Date: not future

---

## Error Codes

```typescript
VALIDATION_ERROR   // Invalid input
NETWORK_ERROR      // Connection issue
PERMISSION_DENIED  // Access denied
NOT_FOUND          // Resource missing
UNKNOWN_ERROR      // Unexpected error
```

---

## Common Patterns

### Before Submitting Form

```typescript
const errors = validateExpense(formData);
if (errors.length > 0) {
  setError(errors[0].message);
  return;
}
```

### Real-Time Validation

```typescript
const handleChange = (value) => {
  setValue(value);
  const errors = validate(value);
  setError(errors[0]?.message || null);
};
```

### API Call with Error Handling

```typescript
try {
  const { error } = await supabase.from('table').insert(data);
  if (error) throw error;
  Alert.alert('Success!');
} catch (error) {
  Alert.alert('Error', handleError(error));
  logError(error, 'context');
}
```

---

## Currency Utilities

```typescript
import { roundCurrency, formatCurrency, safeParseFloat } from '../utils/errorHandler';

const amount = safeParseFloat(input, 0);
const rounded = roundCurrency(123.456); // 123.46
const display = formatCurrency(123.45); // "₹123.45"
```

---

## Testing

```bash
# Run validation tests
npm test -- validators.test.ts

# Run error handler tests
npm test -- errorHandler.test.ts
```

---

## Files

```
src/
├── validators/
│   ├── expenseValidator.ts
│   ├── splitValidator.ts
│   ├── settlementValidator.ts
│   └── index.ts
├── utils/
│   └── errorHandler.ts
├── components/
│   └── ErrorBoundary.tsx
└── __tests__/
    ├── validators.test.ts
    └── errorHandler.test.ts
```

---

## Examples

### ✅ Valid Expense

```typescript
{
  description: "Dinner",
  amount: 300,
  paid_by: "user1",
  splits: [
    { user_id: "user1", amount: 100 },
    { user_id: "user2", amount: 100 },
    { user_id: "user3", amount: 100 }
  ]
}
```

### ❌ Invalid Expense

```typescript
{
  description: "",           // Empty!
  amount: -100,             // Negative!
  splits: [
    { user_id: "user1", amount: 50 },
    { user_id: "user2", amount: 40 }
  ] // Sum = 90, not 100!
}
```

---

## Error Boundary

```typescript
import ErrorBoundary from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

---

**See DATA_VALIDATION_GUIDE.md for complete details**
