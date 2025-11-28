# Splitwise-like App — Feature Backlog

## Phase 0 — Setup / Foundational  
- [ ] Setup project scaffolding (iOS + backend + DB)  
- [ ] Implement user authentication (sign-up, login, logout)  
- [ ] Define data model / schema: users, groups, friendships/private-connections, expenses, payments/settlements, balances, currencies, receipts, etc.  
- [ ] Setup backend + cloud storage + sync (or choose sync strategy / offline-online model)  
- [ ] Basic UI / navigation skeleton (login screen, main dashboard, group/expense list screens)  

## Phase 1 — Core MVP / Basic Functionality  
- [ ] Allow user to create a "group" (e.g. roommates, trip group) or a private friend-to-friend connection.  
- [ ] Enable adding an expense / bill entry: total amount, payer(s), date, description / notes, optional receipt/photo.  
- [ ] Provide flexible splitting options: equal split, by shares/percentages, or exact amounts per participant.  
- [ ] Support multiple payers on a single expense (if more than one person contributes).  
- [ ] Maintain a ledger of balances: track who owes whom, per group or per friend-connection.  
- [ ] Implement a "debt simplification / netting" algorithm: reduce multiple IOUs across people/groups into minimal payments needed.  
- [ ] Enable recording of "settlements / payments": allow users to mark when a debt is paid (cash or external payment).  
- [ ] Show expense history / activity feed: chronological list of all expenses, payments, group activity.  
- [ ] Allow comments / notes on expense entries (why the expense was, extra context).  

## Phase 2 — Usability & User-Experience Features  
- [ ] Support multiple groups per user (e.g. "Trip to Goa", "Apartment Rent", "Weekend dinners").  
- [ ] Support custom user avatars + group cover photos for personalization.  
- [ ] Expense categorization (e.g. rent, utilities, groceries, travel, dinner) for better tracking / filtering / reporting.  
- [ ] Provide a summary view: total balances across all groups/friends for a user (how much they owe / are owed in total).  
- [ ] Support offline entry (allow adding expenses without connectivity), and sync when online.  
- [ ] Notifications / reminders / activity alerts — inform users when a new expense is added, or when settlement is due.  
- [ ] Export history / data (e.g. to CSV or JSON) for offline record-keeping or further analysis.  
- [ ] Allow searching past expenses / settlements / IOUs (filter by date, group, person, category, etc.).  
- [ ] Ability to edit existing expense entries (change amount, payer, participants, notes) and restore deleted expenses/groups.  

## Phase 3 — Recurring & Convenience / Automation Features  
- [ ] Support recurring bills/expenses — for things like monthly rent, utilities, subscription costs (weekly/monthly/yearly/fortnightly) etc.  
- [ ] Data integrity & conflict resolution (if multiple users edit same expense, offline edits, merge logic)  
- [ ] Permissions / access control per group: who can add expenses, who can edit, who can settle, who can delete — basic group-management rules  
- [ ] User onboarding & tutorial / help screens (for first-time users)  
- [ ] Basic UI/UX polish: clean layouts for expense addition, balance display, group lists, etc.  

## Phase 4 — Advanced / "Pro-Level" / Premium Features  
- [ ] Receipt scanning + OCR + itemization: allow user to take picture of a receipt/bill, parse items, assign individual items to participants.  
- [ ] Multi-currency support + currency conversion (useful for international trips / groups across countries).  
- [ ] Charts / analytics / spending-by-category over time — graphical summaries of how much is spent where, trends, budgeting help.  
- [ ] Default split settings per group or per user (for couples or regular groups with consistent split ratios) so user doesn't re-enter split every time.  
- [ ] Unlimited expense entries (no daily/weekly limits) — useful for frequent users.  
- [ ] Backup/export of entire data (including receipts) — e.g. JSON export, downloadable from backend — for full backup.  
- [ ] Ad-free / paid-tier user experience (if you plan to monetise), with benefits like extra storage, advanced features, no interruption.  
- [ ] Payment integrations (where possible based on region): allow direct payments via popular payment services or bank transfers from within the app.  
- [ ] Early-access / feature toggles for beta users / power users — to rollout new features gradually for feedback (if you follow a similar freemium model).  

## Non-Functional / Architecture & Supporting To-Dos  
- [ ] Design robust data schema & relationships (users, groups, expenses, splits, payments, receipts, mult-currency)  
- [ ] Implement debt-simplification algorithm — to consolidate group debts into minimal payment obligations.  
- [ ] Backend + database + cloud sync + offline-first / conflict-resolution logic  
- [ ] Handling currency conversions, exchange-rate updates, multi-currency math (if multi-currency feature is supported)  
- [ ] Notification / push-notification system (for new expenses, settle reminders, group invites, etc.)  
- [ ] Backup / export / import functionality (CSV, JSON, or similar) for user data and receipts  
- [ ] Permissions and access control for group management and expense editing / deletion  
- [ ] Logging, error handling, and data validation (especially for splits, currency, edge cases)  
- [ ] Testing: unit tests (business logic), UI tests, integration tests (sync, offline, concurrency), edge-case testing  
- [ ] Documentation (API, data model, user-flow, developer docs) — useful if you plan to maintain or scale the app  
