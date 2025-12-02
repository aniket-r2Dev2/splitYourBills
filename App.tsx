import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';

function AppContent() {
  const { session, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'groups' | 'createGroup' | 'groupDetail' | 'addExpense'>('groups');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentGroup, setCurrentGroup] = useState<any | null>(null);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!session ? (
        <LoginScreen />
      ) : currentScreen === 'groups' ? (
        <GroupsScreen 
          onAddGroup={() => setCurrentScreen('createGroup')}
          onOpenGroup={(g) => { setCurrentGroup(g); setCurrentScreen('groupDetail'); }}
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
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
