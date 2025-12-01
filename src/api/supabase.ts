import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project dashboard
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase URL and/or Anon Key are missing. Add them to your .env file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for common operations
export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const fetchGroups = async () => {
  return await supabase.from('groups').select('*');
};

export const fetchGroupMembers = async (groupId: string) => {
  return await supabase
    .from('group_members')
    .select('*, users(*)')
    .eq('group_id', groupId);
};

export const fetchExpenses = async (groupId: string) => {
  return await supabase
    .from('expenses')
    .select('*, splits(*)')
    .eq('group_id', groupId);
};

// Create a new group and add the creator as a member
export const createGroup = async (data: {
  name: string;
  description?: string;
  createdBy: string;
}) => {
  try {
    // Insert the group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: data.name,
        description: data.description || null,
        created_by: data.createdBy,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: data.createdBy,
      });

    if (memberError) throw memberError;

    return groupData;
  } catch (error) {
    throw error;
  }
};

// Add a user to a group (group creator only)
export const addGroupMember = async (groupId: string, userId: string) => {
  return await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
    })
    .select()
    .single();
};

// Get groups for the current user (groups they're members of)
export const getUserGroups = async (userId: string) => {
  return await supabase
    .from('group_members')
    .select('groups(*)')
    .eq('user_id', userId);
};

