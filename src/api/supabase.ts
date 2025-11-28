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
