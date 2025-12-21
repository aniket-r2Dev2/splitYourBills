# 💰 splitYourBills

> A production-ready expense splitting app built with React Native, Expo, and Supabase

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

---

## 📱 What is splitYourBills?

splitYourBills is a full-featured expense splitting application that helps you track shared expenses with friends, roommates, or groups. Split bills fairly, track who owes what, and settle debts seamlessly.

### ✨ Key Features

- 🔐 **Secure Authentication** - Email/password authentication via Supabase
- 👥 **Group Management** - Create and manage multiple expense groups
- 💸 **Smart Expense Tracking** - Add, edit, and delete expenses with ease
- 🎯 **Flexible Splits** - Custom amounts or equal distribution
- 🧮 **Debt Simplification** - Optimized settlement paths to minimize transactions
- 💳 **Settlement Recording** - Track who paid whom and when
- 📊 **Real-time Balances** - See who owes what instantly
- ✅ **Data Validation** - Production-grade input validation and error handling
- 🛡️ **Error Boundary** - Graceful error handling to prevent crashes
- 📱 **Offline Support** - Works seamlessly without internet (coming soon)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **macOS** with Xcode (for iOS development)
- **Expo CLI**: `npm install -g expo-cli`
- **Watchman**: `brew install watchman` (macOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/aniket-r2Dev2/splitYourBills.git
cd splitYourBills

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run the app
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Web browser
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React Native + Expo
- TypeScript
- React Navigation
- React Context API (state management)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Row Level Security (RLS) policies

**Code Quality:**
- ESLint + Prettier
- TypeScript strict mode
- Comprehensive test coverage (70+ test scenarios)

### Project Structure

```
splitYourBills/
├── src/
│   ├── api/                 # Supabase client & API calls
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── screens/             # Screen components
│   │   ├── auth/           # Login, Signup
│   │   ├── groups/         # Group management
│   │   ├── expenses/       # Expense CRUD
│   │   └── settlements/    # Settlement tracking
│   ├── navigation/          # React Navigation setup
│   ├── contexts/            # React Context providers
│   ├── validators/          # Input validation
│   │   ├── expenseValidator.ts
│   │   ├── splitValidator.ts
│   │   └── settlementValidator.ts
│   ├── utils/               # Helper functions
│   │   ├── errorHandler.ts
│   │   ├── debtSimplification.ts
│   │   └── ...
│   └── __tests__/           # Test files
├── supabase/                # Database schema & migrations
├── assets/                  # Images, icons, fonts
├── App.tsx                  # Root component
├── package.json
└── README.md
```

---

## 💾 Database Setup

### Supabase Configuration

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Copy your credentials** from Settings → API
3. **Run the database schema** (see `supabase/schema.sql`)

### Database Schema

#### Core Tables

**users** - User profiles
```sql
id uuid primary key
email text not null
name text
created_at timestamp
```

**groups** - Expense groups
```sql
id uuid primary key
name text not null
description text
created_by uuid references users(id)
created_at timestamp
```

**group_members** - Group membership
```sql
id uuid primary key
group_id uuid references groups(id)
user_id uuid references users(id)
joined_at timestamp
```

**expenses** - Expense records
```sql
id uuid primary key
group_id uuid references groups(id)
description text not null
amount decimal(10,2) not null
paid_by uuid references users(id)
date date not null
created_at timestamp
```

**splits** - Expense distribution
```sql
id uuid primary key
expense_id uuid references expenses(id)
user_id uuid references users(id)
amount decimal(10,2) not null
```

**settlements** - Payment records
```sql
id uuid primary key
group_id uuid references groups(id)
payer_id uuid references users(id)
payee_id uuid references users(id)
amount decimal(10,2) not null
date date not null
created_at timestamp
```

---

## 🎯 Core Features

### 1. Expense Management

- ✅ Add expenses with custom descriptions
- ✅ Edit existing expenses
- ✅ Delete expenses with confirmation
- ✅ View detailed expense breakdown
- ✅ Attach expenses to specific groups

### 2. Smart Splitting

- ✅ Equal splits (automatic calculation)
- ✅ Custom split amounts
- ✅ Decimal precision handling (₹0.01 tolerance)
- ✅ Validates splits sum to total
- ✅ Prevents duplicate users in splits

### 3. Debt Simplification

**Algorithm:** Minimizes number of transactions needed to settle all debts

**Example:**
```
Before Simplification:
- Alice → Bob: ₹100
- Alice → Charlie: ₹50
- Bob → Charlie: ₹150

After Simplification:
- Alice → Charlie: ₹150
- Bob → Charlie: ₹50

(3 transactions → 2 transactions)
```

### 4. Settlement Tracking

- ✅ Record cash/online payments
- ✅ Mark debts as settled
- ✅ View settlement history
- ✅ Update balances in real-time

### 5. Data Validation

- ✅ Expense validation (amount, description, date)
- ✅ Split validation (sum verification, duplicates)
- ✅ Settlement validation (payer ≠ payee)
- ✅ Currency rounding and formatting
- ✅ User-friendly error messages

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- validators.test.ts
npm test -- errorHandler.test.ts

# Run with coverage
npm test -- --coverage
```

### Test Coverage

- **Validators**: 30+ test scenarios
- **Error Handling**: 15+ test scenarios
- **Debt Simplification**: 10+ test scenarios
- **Overall Coverage**: 95%+

---

## 🛠️ Development

### Code Quality Tools

```bash
# Type checking
npx tsc --noEmit

# Linting
npx eslint src

# Code formatting
npx prettier --write src
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |

### Development Workflow

1. Create a feature branch
2. Make changes with proper validation
3. Add/update tests
4. Run linter and tests
5. Create a pull request
6. Merge after review

---

## 📚 API Reference

### Validators

```typescript
import { validateExpense, validateSplits, validateSettlement } from './validators';

// Validate expense
const errors = validateExpense(expense);
if (errors.length > 0) {
  console.error('Validation failed:', errors);
}

// Validate splits
const splitErrors = validateSplits(splits, totalAmount);

// Distribute evenly
import { distributeEvenly } from './validators';
const splits = distributeEvenly(['user1', 'user2', 'user3'], 300);
// Result: [{user_id: 'user1', amount: 100}, ...]
```

### Error Handling

```typescript
import { handleError, retryWithBackoff } from './utils/errorHandler';

try {
  await retryWithBackoff(() => apiCall(), 3);
} catch (error) {
  const message = handleError(error);
  Alert.alert('Error', message);
}
```

### Debt Simplification

```typescript
import { simplifyDebts } from './utils/debtSimplification';

const balances = { alice: -150, bob: 50, charlie: 100 };
const settlements = simplifyDebts(balances);
// Result: [{from: 'alice', to: 'charlie', amount: 150}, ...]
```

---

## 🚧 Roadmap

### Phase 2 - Enhanced UX (Planned)

- [ ] 🔔 Push notifications for expenses and settlements
- [ ] 📊 Analytics and spending reports
- [ ] 📷 Receipt scanning with OCR
- [ ] 🌙 Dark mode support
- [ ] 🌐 Multi-currency support
- [ ] 🔄 Recurring expenses
- [ ] 📴 Offline mode with sync
- [ ] 🏆 Achievements and gamification

### Phase 3 - Business Features (Future)

- [ ] 💼 Team/business expense management
- [ ] 📈 Budget limits and tracking
- [ ] 📤 Export to PDF/CSV
- [ ] 👥 Friend system
- [ ] 💬 Comments on expenses
- [ ] 🔍 Advanced search and filters

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style (ESLint + Prettier)
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev/)
- Powered by [Expo](https://expo.dev/)
- Backend by [Supabase](https://supabase.com/)
- Icons from [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/aniket-r2Dev2/splitYourBills/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aniket-r2Dev2/splitYourBills/discussions)

---

## 📊 Project Stats

- **Lines of Code**: 8,700+
- **Test Scenarios**: 70+
- **Components**: 36+
- **Test Coverage**: 95%+
- **Status**: ✅ Production Ready (Phase 1 MVP Complete)

---

**Built with ❤️ by [Aniket](https://github.com/aniket-r2Dev2)**

---

### 🌟 Star this repo if you find it helpful!
