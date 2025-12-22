-- ============================================
-- FIX: Row Level Security Policies for Groups
-- Run this in Supabase SQL Editor
-- ============================================

-- First, ensure user profile exists (this handles edge cases)
-- This function will be called to ensure user profile exists before operations
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user profile exists, if not create it
  INSERT INTO public.users (id, email, name)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = auth.uid()), '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Fix Groups RLS Policies
-- ============================================

-- Drop all existing group policies
DROP POLICY IF EXISTS "Users can see their groups" ON groups;
DROP POLICY IF EXISTS "Group creator can update" ON groups;
DROP POLICY IF EXISTS "Group creator can delete" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Allow all for testing" ON groups;

-- Allow users to see groups they are members of
CREATE POLICY "Users can view their groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
    )
  );

-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- Allow group creators to update their groups
CREATE POLICY "Group creators can update"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Allow group creators to delete their groups
CREATE POLICY "Group creators can delete"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- ============================================
-- Fix Group Members RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Users can see group members" ON group_members;
DROP POLICY IF EXISTS "Group creator can add members" ON group_members;
DROP POLICY IF EXISTS "Users can remove themselves" ON group_members;

-- Allow users to see members of groups they belong to
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );

-- Allow group creators to add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
        AND (groups.created_by = auth.uid() OR group_members.user_id = auth.uid())
    )
  );

-- Allow users to remove themselves from groups
CREATE POLICY "Users can remove themselves"
  ON group_members FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- Fix Users Table RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Allow reading user records" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Allow users to read all user profiles (needed for group member display)
CREATE POLICY "Anyone can read user profiles"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- Fix Expenses RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Users can see group expenses" ON expenses;
DROP POLICY IF EXISTS "Expense payer can update" ON expenses;
DROP POLICY IF EXISTS "Expense payer can delete" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON expenses;

-- Allow users to see expenses in groups they belong to
CREATE POLICY "Users can view group expenses"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Allow group members to create expenses
CREATE POLICY "Group members can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    paid_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Allow expense creator to update
CREATE POLICY "Expense creators can update"
  ON expenses FOR UPDATE
  USING (paid_by = auth.uid())
  WITH CHECK (paid_by = auth.uid());

-- Allow expense creator to delete
CREATE POLICY "Expense creators can delete"
  ON expenses FOR DELETE
  USING (paid_by = auth.uid());

-- ============================================
-- Fix Splits RLS Policies  
-- ============================================

DROP POLICY IF EXISTS "Users can see expense splits" ON splits;
DROP POLICY IF EXISTS "Expense payer can create splits" ON splits;

-- Allow users to see splits for expenses in their groups
CREATE POLICY "Users can view splits"
  ON splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      JOIN group_members ON group_members.group_id = expenses.group_id
      WHERE expenses.id = splits.expense_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Allow expense creators to create splits
CREATE POLICY "Expense creators can create splits"
  ON splits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = splits.expense_id
        AND expenses.paid_by = auth.uid()
    )
  );

-- ============================================
-- Fix Settlements RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Users can see group settlements" ON settlements;

-- Allow users to see settlements in groups they belong to
CREATE POLICY "Users can view group settlements"
  ON settlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = settlements.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Allow group members to create settlements
CREATE POLICY "Group members can create settlements"
  ON settlements FOR INSERT
  WITH CHECK (
    (from_user_id = auth.uid() OR to_user_id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = settlements.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- ============================================
-- Refresh Trigger for User Profile Creation
-- ============================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate user profile auto-creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Ensure current users have profiles
-- ============================================

-- Backfill user profiles for existing auth users
INSERT INTO public.users (id, email, name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', '') as name
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- ============================================
-- Success!
-- ============================================

SELECT 'RLS policies updated successfully!' as message;
