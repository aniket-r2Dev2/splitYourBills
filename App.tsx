import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';

function AppContent() {
  const { session, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'groups' | 'createGroup'>('groups');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <CreateGroupScreen 
          onGroupCreated={() => {
            setCurrentScreen('groups');
            setRefreshTrigger(prev => prev + 1);
          }}
          onCancel={() => setCurrentScreen('groups')}
        />
      )}
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
