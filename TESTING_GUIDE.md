# 🧪 Manual Testing Guide - splitYourBills

> Complete guide to manually test all features from scratch

**Last Updated:** December 21, 2025  
**Version:** 1.0.0  
**Status:** Phase 1 MVP Complete + Dark Mode

---

## 📝 Table of Contents

1. [Prerequisites & Setup](#-prerequisites--setup)
2. [Starting the App](#-starting-the-app)
3. [Testing Checklist](#-testing-checklist)
4. [Feature Testing](#-feature-testing)
5. [Edge Cases](#-edge-cases)
6. [Troubleshooting](#-troubleshooting)

---

## 🛠️ Prerequisites & Setup

### 💻 System Requirements

**macOS (for iOS):**
- macOS 12.0+ (Monterey or later)
- Xcode 14+ (from App Store)
- Xcode Command Line Tools
- Node.js 18+
- Watchman

**Windows/Linux (for Android):**
- Node.js 18+
- Android Studio
- Android SDK
- Java JDK 11+

**Both Platforms:**
- Git
- npm or yarn
- Expo CLI
- Physical device or simulator/emulator

---

### ⚙️ Step 1: Install Prerequisites

#### **macOS Setup (iOS)**

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node

# 3. Verify Node.js installation
node --version  # Should show v18 or higher
npm --version   # Should show 9.x or higher

# 4. Install Watchman
brew install watchman

# 5. Install Expo CLI globally
npm install -g expo-cli

# 6. Verify Expo installation
expo --version

# 7. Install Xcode from App Store (required for iOS)
# Open Xcode after installation to accept license
sudo xcodebuild -license accept

# 8. Install iOS Simulator
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### **Android Setup**

```bash
# 1. Install Node.js (macOS)
brew install node

# Or on Windows/Linux
# Download from: https://nodejs.org/

# 2. Install Android Studio
# Download from: https://developer.android.com/studio

# 3. Configure Android SDK (in Android Studio):
# - Open Android Studio
# - SDK Manager → Android SDK
# - Install latest Android SDK Platform
# - Install Android SDK Build-Tools
# - Install Android Emulator

# 4. Set environment variables (add to ~/.zshrc or ~/.bashrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 5. Reload shell
source ~/.zshrc  # or source ~/.bashrc

# 6. Install Expo CLI
npm install -g expo-cli
```

---

### 📋 Step 2: Clone & Install Project

```bash
# 1. Clone the repository
git clone https://github.com/aniket-r2Dev2/splitYourBills.git
cd splitYourBills

# 2. Install dependencies
npm install

# This will install:
# - React Native & Expo
# - Supabase client
# - TypeScript
# - All other dependencies

# 3. Verify installation
ls node_modules/  # Should see many packages
```

---

### 🔑 Step 3: Configure Supabase

#### **Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (Sign up if needed)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `splitYourBills` (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
5. Click **"Create new project"** (takes ~2 minutes)

#### **Get API Credentials**

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

#### **Set Up Database Schema**

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase/schema.sql` from the repo
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify tables created: Go to **Table Editor** → Should see:
   - `users`
   - `groups`
   - `group_members`
   - `expenses`
   - `splits`
   - `settlements`

#### **Configure Environment Variables**

```bash
# 1. Create environment file
cp .env.example .env.local

# 2. Edit .env.local
nano .env.local  # or use VS Code, vim, etc.

# 3. Add your Supabase credentials:
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 4. Save and exit (Ctrl+O, Enter, Ctrl+X in nano)

# 5. Verify file created
cat .env.local  # Should show your credentials
```

**⚠️ Important:** Never commit `.env.local` to git!

---

## 🚀 Starting the App

### 📱 Start on iOS Simulator

```bash
# 1. Make sure you're in the project directory
cd splitYourBills

# 2. Start the app
npm run ios

# This will:
# - Start Metro bundler
# - Open iOS Simulator
# - Install app on simulator
# - Launch the app

# Wait 1-2 minutes for first build
```

**If simulator doesn't open:**
```bash
# Open simulator manually
open -a Simulator

# Then run again
npm run ios
```

---

### 🤖 Start on Android Emulator

```bash
# 1. Start Android Emulator first
# Option A: Via Android Studio
# - Open Android Studio
# - Tools → Device Manager
# - Click ▶️ on any device

# Option B: Via command line
emulator -avd Pixel_5_API_33  # Replace with your AVD name

# 2. List available devices
emulator -list-avds

# 3. Start the app
npm run android

# Wait 2-3 minutes for first build
```

---

### 🖥️ Start on Physical Device

#### **iOS (Physical iPhone/iPad)**

```bash
# 1. Install Expo Go app from App Store
# Search "Expo Go" in App Store and install

# 2. Start the app
npm start

# 3. Scan QR code with Camera app
# - Opens Expo Go automatically
# - App loads in Expo Go

# Make sure iPhone and computer are on same WiFi!
```

#### **Android (Physical Phone/Tablet)**

```bash
# 1. Install Expo Go from Play Store
# Search "Expo Go" in Play Store and install

# 2. Enable USB debugging on phone:
# - Settings → About Phone
# - Tap "Build Number" 7 times (Developer mode enabled)
# - Settings → Developer Options
# - Enable "USB Debugging"

# 3. Connect phone via USB

# 4. Start the app
npm start

# 5. Scan QR code with Expo Go app
```

---

### 🔧 Development Tools

**Metro Bundler Menu:**

When app is running, press in terminal:
- `r` - Reload app
- `m` - Open menu on device
- `i` - Open iOS simulator
- `a` - Open Android emulator
- `w` - Open web browser
- `j` - Open debugger
- `Ctrl+C` - Stop the app

**Device Menu:**

Shake device or press:
- **iOS Simulator:** `Cmd + D`
- **Android Emulator:** `Cmd + M` or `Ctrl + M`

Menu options:
- Reload
- Debug
- Element Inspector
- Performance Monitor

---

## ✅ Testing Checklist

### Quick Test (5 minutes)

- [ ] App launches without crashes
- [ ] Login screen appears
- [ ] Can create account
- [ ] Can login
- [ ] Can create group
- [ ] Can add expense
- [ ] Dark mode toggle works

### Full Test (30 minutes)

- [ ] All authentication flows
- [ ] Group management (CRUD)
- [ ] Expense management (CRUD)
- [ ] Split calculations
- [ ] Settlement recording
- [ ] Dark mode (3 modes)
- [ ] Error handling
- [ ] Edge cases

---

## 🎯 Feature Testing

### 1️⃣ Authentication Testing

#### **Test 1.1: Sign Up (New User)**

**Steps:**
```
1. App opens → See Login Screen
2. Tap "Don't have an account? Sign Up"
3. Enter email: test@example.com
4. Enter password: Test123456!
5. Tap "Sign Up"
6. Wait 2-3 seconds
```

**Expected:**
- ✅ Sign up succeeds
- ✅ Automatically logged in
- ✅ Redirected to Groups screen
- ✅ See "No groups yet" message

**❌ If it fails:**
- Check Supabase credentials in `.env.local`
- Check internet connection
- Try different email

---

#### **Test 1.2: Login (Existing User)**

**Steps:**
```
1. If logged in, tap Logout (top right)
2. Enter email: test@example.com
3. Enter password: Test123456!
4. Tap "Login"
```

**Expected:**
- ✅ Login succeeds
- ✅ See Groups screen
- ✅ Email displayed at top

---

#### **Test 1.3: Logout**

**Steps:**
```
1. From Groups screen
2. Tap "Logout" (top right)
3. Confirm logout
```

**Expected:**
- ✅ Return to Login screen
- ✅ Session cleared
- ✅ Can't access Groups without login

---

### 2️⃣ Dark Mode Testing

#### **Test 2.1: Light Mode**

**Steps:**
```
1. From Groups screen
2. Tap ⚙️ Settings icon (top right)
3. Under "APPEARANCE" section
4. Tap ☀️ "Light" theme
```

**Expected:**
- ✅ Theme changes to light immediately
- ✅ White/light backgrounds
- ✅ Dark text on light background
- ✅ Checkmark on "Light" button
- ✅ Blue highlight on selected theme

**Visual Check:**
- Background: White (#FFFFFF)
- Text: Black (#000000)
- Cards: White with light gray borders
- Primary color: Blue (#007AFF)

---

#### **Test 2.2: Dark Mode**

**Steps:**
```
1. In Settings screen
2. Tap 🌙 "Dark" theme
```

**Expected:**
- ✅ Theme changes to dark immediately
- ✅ Black/dark backgrounds
- ✅ Light text on dark background
- ✅ Checkmark on "Dark" button
- ✅ Status bar changes to light text

**Visual Check:**
- Background: Pure black (#000000)
- Text: White (#FFFFFF)
- Cards: Dark gray (#1C1C1E)
- Primary color: Light blue (#0A84FF)
- Better on eyes in dark room!

---

#### **Test 2.3: Auto Mode**

**Steps:**
```
1. In Settings screen
2. Tap 🔄 "Auto" theme
3. See info box: "Auto mode: Currently using [light/dark] theme..."
4. Exit app
5. Change phone's system theme:
   iOS: Settings → Display & Brightness → Dark/Light
   Android: Settings → Display → Dark theme
6. Re-open app
```

**Expected:**
- ✅ App follows system theme
- ✅ Light when phone is light
- ✅ Dark when phone is dark
- ✅ Info box shows current mode
- ✅ Auto switches immediately

---

#### **Test 2.4: Theme Persistence**

**Steps:**
```
1. Select Dark mode
2. Close app completely (swipe up to kill)
3. Re-open app
```

**Expected:**
- ✅ Dark mode still active
- ✅ Theme preference remembered
- ✅ Works across app restarts

---

#### **Test 2.5: Navigation with Themes**

**Steps:**
```
1. Set Dark mode
2. Tap "Back" to Groups screen
3. Create a group
4. Add an expense
5. Navigate through all screens
```

**Expected:**
- ✅ All screens respect dark theme
- ✅ Consistent colors throughout
- ✅ No white flashes
- ✅ StatusBar adapts on each screen

---

### 3️⃣ Group Management Testing

#### **Test 3.1: Create Group**

**Steps:**
```
1. From Groups screen
2. Tap "+ Add Group" (bottom)
3. Enter name: "Weekend Trip"
4. Enter description: "Beach trip with friends"
5. Tap "Create Group"
```

**Expected:**
- ✅ Group created successfully
- ✅ Return to Groups screen
- ✅ "Weekend Trip" appears in list
- ✅ Description visible

---

#### **Test 3.2: View Group**

**Steps:**
```
1. Tap on "Weekend Trip" card
```

**Expected:**
- ✅ Opens Group Detail screen
- ✅ Shows group name at top
- ✅ Shows "No expenses yet" (if empty)
- ✅ Shows "+ Add Expense" button
- ✅ Shows "← Back" button

---

#### **Test 3.3: Create Multiple Groups**

**Steps:**
```
1. Go back to Groups screen
2. Create another group: "Roommates"
3. Create another: "Office Lunch"
```

**Expected:**
- ✅ All groups appear in list
- ✅ Can scroll if many groups
- ✅ Each group has distinct card

---

### 4️⃣ Expense Management Testing

#### **Test 4.1: Add Simple Expense (Equal Split)**

**Steps:**
```
1. Open "Weekend Trip" group
2. Tap "+ Add Expense"
3. Description: "Dinner at restaurant"
4. Amount: 300
5. Date: Today's date (default)
6. Paid by: You (your email)
7. Split type: Equal
8. Select participants:
   - Check yourself
   - Check 2 other members (if available)
   OR add emails: friend1@example.com, friend2@example.com
9. Tap "Create Expense"
```

**Expected:**
- ✅ Expense created
- ✅ Appears in group's expense list
- ✅ Shows: "Dinner at restaurant"
- ✅ Shows: ₹300.00
- ✅ Shows: Date
- ✅ Shows: "Paid by You"
- ✅ Each person owes ₹100 (300 ÷ 3)

---

#### **Test 4.2: Add Custom Split Expense**

**Steps:**
```
1. Add another expense
2. Description: "Groceries"
3. Amount: 500
4. Split type: Custom
5. Person 1 (you): 200
6. Person 2: 150
7. Person 3: 150
8. Tap "Create Expense"
```

**Expected:**
- ✅ Expense created
- ✅ Custom amounts saved
- ✅ Validation: 200 + 150 + 150 = 500 ✅

---

#### **Test 4.3: View Expense Details**

**Steps:**
```
1. Tap on "Dinner at restaurant" expense
```

**Expected:**
- ✅ Opens Expense Detail screen
- ✅ Shows full description
- ✅ Shows total amount
- ✅ Shows who paid
- ✅ Shows split breakdown:
   - Person 1: ₹100.00
   - Person 2: ₹100.00
   - Person 3: ₹100.00
- ✅ Shows date
- ✅ "Edit" and "Delete" buttons visible

---

#### **Test 4.4: Edit Expense**

**Steps:**
```
1. From Expense Detail screen
2. Tap "Edit"
3. Change description: "Dinner at Italian restaurant"
4. Change amount: 350
5. Tap "Save"
```

**Expected:**
- ✅ Expense updated
- ✅ New description shows
- ✅ New amount shows
- ✅ Splits recalculated (₹116.67 each)

---

#### **Test 4.5: Delete Expense**

**Steps:**
```
1. From Expense Detail screen
2. Tap "Delete"
3. Confirm deletion
```

**Expected:**
- ✅ Confirmation dialog appears
- ✅ After confirm: Returns to Group screen
- ✅ Expense removed from list
- ✅ Balances updated

---

### 5️⃣ Balance & Settlement Testing

#### **Test 5.1: View Balances**

**Steps:**
```
1. In Group Detail screen
2. Look at balance section
```

**Expected:**
- ✅ Shows who owes what
- ✅ Positive = owed to you (green)
- ✅ Negative = you owe (red)
- ✅ Zero = settled (gray)

**Example:**
```
Group: Weekend Trip
Expenses: ₹800 total

Balances:
- You: +₹200 (You're owed)
- Alice: -₹100 (Alice owes you)
- Bob: -₹100 (Bob owes you)
```

---

#### **Test 5.2: Simplified Debts**

**Steps:**
```
1. Add multiple expenses with different payers
2. Check "Settlements" or "Balances" section
```

**Expected:**
- ✅ Shows optimized settlement plan
- ✅ Minimizes number of transactions
- ✅ Example:
  Before: 5 transactions
  After: 2 transactions

---

#### **Test 5.3: Record Settlement**

**Steps:**
```
1. From Group screen
2. Tap "Record Settlement" (if available)
3. Select payer: Alice
4. Select payee: You
5. Amount: 100
6. Date: Today
7. Tap "Record"
```

**Expected:**
- ✅ Settlement recorded
- ✅ Balances updated
- ✅ Alice's debt reduced by ₹100
- ✅ Shows in settlement history

---

### 6️⃣ Validation Testing

#### **Test 6.1: Invalid Expense Amount**

**Steps:**
```
1. Add new expense
2. Amount: -100 (negative)
3. Try to create
```

**Expected:**
- ❌ Error: "Amount must be positive"
- ❌ Cannot create expense

**Try these invalid amounts:**
- `0` → "Amount must be greater than 0"
- `-50` → "Amount must be positive"
- `abc` → "Invalid amount"
- Empty → "Amount is required"

---

#### **Test 6.2: Invalid Description**

**Steps:**
```
1. Add new expense
2. Description: (leave empty)
3. Try to create
```

**Expected:**
- ❌ Error: "Description is required"

---

#### **Test 6.3: Invalid Split Amounts**

**Steps:**
```
1. Add expense, amount: 300
2. Custom split:
   - Person 1: 100
   - Person 2: 100
   - Person 3: 50 (total = 250, not 300!)
3. Try to create
```

**Expected:**
- ❌ Error: "Split amounts must equal total (₹300.00)"
- ❌ Error: "Difference: ₹50.00"

---

#### **Test 6.4: Duplicate Participants**

**Steps:**
```
1. Add expense
2. Add same person twice in split
3. Try to create
```

**Expected:**
- ❌ Error: "Duplicate participants not allowed"

---

### 7️⃣ Error Handling Testing

#### **Test 7.1: Network Error**

**Steps:**
```
1. Turn off WiFi/mobile data
2. Try to create expense
```

**Expected:**
- ❌ Error: "Network error. Check connection."
- ✅ App doesn't crash
- ✅ Can retry when connection restored

---

#### **Test 7.2: Offline Mode**

**Steps:**
```
1. Load app with internet
2. Turn off internet
3. Try to navigate
```

**Expected:**
- ✅ Previously loaded data still visible
- ❌ Cannot create/edit (shows error)
- ✅ Graceful error messages

---

## 🔍 Edge Cases

### Decimal Precision

**Test:**
```
Expense: ₹100
Split equally among 3 people

Expected:
- Person 1: ₹33.33
- Person 2: ₹33.33
- Person 3: ₹33.34 (extra ₹0.01 to balance)
Total: ₹100.00 ✅
```

---

### Large Numbers

**Test:**
```
Amount: 9999999.99
Split: 2 people

Expected:
- Each: ₹4999999.995 (rounded to ₹5000000.00)
- No overflow errors
- Displays correctly
```

---

### Special Characters

**Test:**
```
Description: "Café ☕ & Bakery 🍰 - 50% off!"

Expected:
- ✅ Accepts emojis
- ✅ Accepts special characters
- ✅ Displays correctly
```

---

### Rapid Operations

**Test:**
```
1. Tap "Create Expense" 5 times rapidly
```

**Expected:**
- ✅ Only 1 expense created (debouncing)
- ✅ No duplicate submissions
```

---

## 🐛 Troubleshooting

### App Won't Start

**Error:** `Command not found: expo`

**Fix:**
```bash
npm install -g expo-cli
```

---

**Error:** `Module not found: @supabase/supabase-js`

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### iOS Simulator Issues

**Error:** `Unable to boot simulator`

**Fix:**
```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Restart Xcode
killall Xcode
open -a Xcode
```

---

### Android Emulator Issues

**Error:** `emulator: ERROR: x86 emulation currently requires hardware acceleration`

**Fix:**
1. Enable virtualization in BIOS
2. Install Intel HAXM (macOS/Windows)
3. Or use ARM64 emulator instead

---

### Supabase Connection Failed

**Error:** `Failed to fetch` or `Network request failed`

**Fix:**
```bash
# 1. Check .env.local exists
cat .env.local

# 2. Verify credentials are correct
# Compare with Supabase dashboard

# 3. Check internet connection
ping google.com

# 4. Restart app
# Press 'r' in terminal or restart completely
```

---

### White Screen / Blank Screen

**Fix:**
```bash
# 1. Clear Metro cache
npm start -- --reset-cache

# 2. Clear watchman
watchman watch-del-all

# 3. Restart
npm start
```

---

### App Crashes on Launch

**Fix:**
```bash
# Check logs
npx react-native log-ios     # iOS
npx react-native log-android  # Android

# Look for error messages
```

---

## 📝 Test Results Template

Use this to track your testing:

```markdown
## Test Session: [Date]

### Environment
- Device: iPhone 14 Pro / Pixel 6
- OS: iOS 17 / Android 13
- App Version: 1.0.0

### Tests Completed
- [x] Authentication ✅
- [x] Dark Mode ✅
- [x] Groups ✅
- [x] Expenses ✅
- [x] Settlements ✅
- [x] Validation ✅
- [x] Error Handling ✅

### Issues Found
1. None! Everything works! 🎉

### Notes
- Dark mode looks amazing—prefer it!
- Debt simplification works perfectly
- Validation catches all errors
```

---

## ✅ Testing Complete!

If all tests pass:

**🎉 Congratulations!**

Your app is:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Tested and verified
- ✅ Ready to ship!

---

## 🚀 Next Steps

1. **Deploy to App Store / Play Store**
2. **Share with friends for beta testing**
3. **Build Phase 2 features** (Notifications, Analytics, OCR)
4. **Add more tests** (automated E2E tests)
5. **Collect user feedback**

---

**Questions? Issues?**

Open an issue on GitHub: [splitYourBills/issues](https://github.com/aniket-r2Dev2/splitYourBills/issues)

---

**Happy Testing! 🧪**
