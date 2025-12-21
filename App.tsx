import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useTheme } from './src/hooks/useTheme';
import { LoginScreen } from './src/screens/LoginScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function AppContent() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  
  const [currentScreen, setCurrentScreen] = useState<'groups' | 'createGroup' | 'groupDetail' | 'addExpense' | 'settings'>('groups');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentGroup, setCurrentGroup] = useState<any | null>(null);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!session ? (
        <LoginScreen />
      ) : currentScreen === 'groups' ? (
        <GroupsScreen 
          onAddGroup={() => setCurrentScreen('createGroup')}
          onOpenGroup={(g) => { setCurrentGroup(g); setCurrentScreen('groupDetail'); }}
          onOpenSettings={() => setCurrentScreen('settings')}
          refreshTrigger={refreshTrigger}
        />
      ) : currentScreen === 'createGroup' ? (
        <CreateGroupScreen 
          onGroupCreated={() => {
            setCurrentScreen('groups');
            setRefreshTrigger(prev => prev + 1);
          }}
          onCancel={() => setCurrentScreen('groups')}
        />
      ) : currentScreen === 'groupDetail' && currentGroup ? (
        <GroupDetailScreen
          group={currentGroup}
          onAddExpense={(groupId: string) => { setCurrentGroup({ ...currentGroup }); setCurrentScreen('addExpense'); }}
          onBack={() => setCurrentScreen('groups')}
          refreshTrigger={refreshTrigger}
        />
      ) : currentScreen === 'addExpense' && currentGroup ? (
        <AddExpenseScreen
          groupId={currentGroup.id}
          onCreated={() => { setCurrentScreen('groupDetail'); setRefreshTrigger(prev => prev + 1); }}
          onCancel={() => setCurrentScreen('groupDetail')}
        />
      ) : currentScreen === 'settings' ? (
        <SettingsScreen
          onBack={() => setCurrentScreen('groups')}
        />
      ) : null}
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </View>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppWithAuth />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
