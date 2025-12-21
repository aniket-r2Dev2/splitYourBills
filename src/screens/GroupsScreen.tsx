import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase, getUserGroups } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface Group {
  id: string;
  name: string;
  description?: string;
}

export const GroupsScreen: React.FC<{ 
  onAddGroup?: () => void; 
  onOpenGroup?: (group: Group) => void; 
  onOpenSettings?: () => void;
  refreshTrigger?: number 
}> = ({ 
  onAddGroup,
  onOpenGroup,
  onOpenSettings,
  refreshTrigger 
}) => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, [refreshTrigger]);

  const loadGroups = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getUserGroups(user.id);
      if (fetchError) {
        setError(fetchError.message);
      } else {
        // Extract groups from the nested structure
        const userGroups = data?.map((item: any) => item.groups).filter(Boolean) || [];
        setGroups(userGroups);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to logout');
    }
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity 
      style={[
        styles.groupCard, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]} 
      onPress={() => onOpenGroup && onOpenGroup(item)}
    >
      <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
      {item.description && (
        <Text style={[styles.groupDesc, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[
        styles.header,
        { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }
      ]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Groups</Text>
          <Text style={[styles.userEmail, { color: colors.textTertiary }]}>{user?.email}</Text>
        </View>
        <View style={styles.headerButtons}>
          {onOpenSettings && (
            <TouchableOpacity 
              style={[
                styles.settingsBtn,
                { backgroundColor: colors.backgroundSecondary }
              ]} 
              onPress={onOpenSettings}
            >
              <Text style={[styles.settingsBtnText, { color: colors.primary }]}>⚙️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[
              styles.logoutBtn,
              { backgroundColor: colors.backgroundSecondary }
            ]} 
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryBtn, { backgroundColor: colors.primary }]} 
            onPress={loadGroups}
          >
            <Text style={[styles.retryText, { color: colors.textInverse }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {groups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No groups yet
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>
                Create a group to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              renderItem={renderGroup}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      )}

      <TouchableOpacity 
        style={[styles.addBtn, { backgroundColor: colors.primary }]} 
        onPress={onAddGroup}
      >
        <Text style={[styles.addBtnText, { color: colors.textInverse }]}>+ Add Group</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  settingsBtnText: {
    fontSize: 18,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 12,
  },
  groupCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    fontWeight: '600',
  },
  addBtn: {
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
