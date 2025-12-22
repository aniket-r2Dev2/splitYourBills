-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- Error: 42P17 - infinite recursion detected
-- ============================================

-- The problem: RLS policies were referencing each other in a loop
-- Solution: Simplify policies to avoid circular dependencies

-- ============================================
-- Step 1: Drop ALL existing policies
-- ============================================

-- Groups policies
DROP POLICY IF EXISTS "Users can view their groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update" ON groups;
DROP POLICY IF EXISTS "Group creators can delete" ON groups;
DROP POLICY IF EXISTS "Users can see their groups" ON groups;
DROP POLICY IF EXISTS "Group creator can update" ON groups;
DROP POLICY IF EXISTS "Group creator can delete" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;

-- Group members policies
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Users can remove themselves" ON group_members;
DROP POLICY IF EXISTS "Users can see group members" ON group_members;
DROP POLICY IF EXISTS "Group creator can add members" ON group_members;

-- ============================================
-- Step 2: Create SIMPLE, NON-RECURSIVE policies
-- ============================================

-- ========== GROUPS TABLE ==========

-- SELECT: Users can see groups they created
-- (Simple - no joins, no EXISTS subqueries)
CREATE POLICY "allow_select_own_groups"
  ON groups FOR SELECT
  USING (created_by = auth.uid());

-- INSERT: Authenticated users can create groups
CREATE POLICY "allow_insert_groups"
  ON groups FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- UPDATE: Creators can update their groups
CREATE POLICY "allow_update_own_groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Creators can delete their groups
CREATE POLICY "allow_delete_own_groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- ========== GROUP_MEMBERS TABLE ==========

-- SELECT: Simple - allow reading all group_members for authenticated users
-- This avoids recursion by NOT checking if user is in the group
CREATE POLICY "allow_select_group_members"
  ON group_members FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Allow inserting if user is the group creator OR adding themselves
-- We check the groups table directly without recursing through group_members
CREATE POLICY "allow_insert_group_members"
  ON group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
        AND groups.created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- UPDATE: Allow group creators to update members
CREATE POLICY "allow_update_group_members"
  ON group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
        AND groups.created_by = auth.uid()
    )
  );

-- DELETE: Allow users to remove themselves OR group creator to remove anyone
CREATE POLICY "allow_delete_group_members"
  ON group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
        AND groups.created_by = auth.uid()
    )
  );

-- ============================================
-- Step 3: Ensure user profiles exist
-- ============================================

-- Backfill profiles for existing users
INSERT INTO public.users (id, email, name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', '') as name
FROM auth.users au
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- Fix the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Step 4: Update Users table policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can read user profiles" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Allow reading user records" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Simple policies for users table
CREATE POLICY "allow_select_users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "allow_insert_own_user"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "allow_update_own_user"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- Step 5: Verify tables have RLS enabled
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Success!
-- ============================================

SELECT 'Infinite recursion fixed! Policies simplified.' as message;
