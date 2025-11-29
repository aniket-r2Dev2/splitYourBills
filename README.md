# Split Your Bills - React Native App

A full-stack expense splitting app built with React Native, Expo, and Supabase.

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context API
- **IDE**: VS Code

## Project Structure

```
.
├── src/
│   ├── api/              # Supabase client & API calls
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components (Auth, Groups, Expenses, etc.)
│   ├── navigation/       # Navigation logic
│   ├── contexts/         # React Context (Auth, etc.)
│   ├── utils/            # Helper functions
│   └── assets/           # Static assets (images, icons)
├── assets/               # App icons and splash images
├── App.tsx               # Main app component
├── index.js              # Expo entry point
├── app.json              # Expo app configuration
├── .env.local            # Environment variables (Supabase keys)
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Prerequisites

- macOS with Xcode installed
- Node.js 18+ and npm
- Watchman: `brew install watchman`
- Expo CLI: `npm install -g expo-cli`

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/aniket-r2Dev2/splitYourBills.git
cd splitYourBills
npm install
```

### 2. Setup Supabase

1. Go to [Supabase Dashboard](https://supabase.com)
2. Create a new project
3. Navigate to **Settings** → **API**
4. Copy your **Project URL** and **Anon Key**

### 3. Configure Environment Variables

Edit `.env.local` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Database Schema

In Supabase Dashboard, create these tables:

#### Users Table
```sql
create table users (
  id uuid primary key references auth.users(id),
  email text not null,
  name text,
  created_at timestamp default now()
);
```

#### Groups Table
```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references users(id),
  created_at timestamp default now()
);
```

#### Group Members Table
```sql
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamp default now()
);
```

#### Expenses Table
```sql
create table expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  description text not null,
  amount decimal(10, 2) not null,
  paid_by uuid references users(id),
  date date not null,
  created_at timestamp default now()
);
```

#### Splits Table
```sql
create table splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references expenses(id) on delete cascade,
  user_id uuid references users(id),
  amount decimal(10, 2) not null
);
```

### 5. Run the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (development)
npm run web

# Or use Expo CLI directly
npx expo start
```

## Features (Current)

- ✅ User authentication (sign-up/login with Supabase)
- ✅ View groups (fetches from Supabase)
- ✅ Responsive UI with React Native
- 🚧 Create groups
- 🚧 Add expenses
- 🚧 Split expenses
- 🚧 View balances

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npx eslint src
```

### Code Formatting

```bash
npx prettier --write src
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

## Useful Links

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [VS Code React Native Tools](https://github.com/microsoft/vscode-react-native)

## License

Apache 2.0 - See LICENSE file for details

---

Built with ❤️ by Aniket
