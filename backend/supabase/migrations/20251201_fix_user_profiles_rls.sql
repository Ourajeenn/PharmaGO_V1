-- Fix RLS permissions for user_profiles to allow updates
-- This migration explicitly drops and recreates the UPDATE policy to ensure users can update their own profile

-- Drop existing UPDATE policy if it exists (to avoid conflicts or stale policies)
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create the UPDATE policy allowing users to update their own profile
-- Using (auth.uid() = id) ensures users can only update rows where their ID matches the row ID
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure the INSERT policy is also correct (just in case)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure the SELECT policy is also correct
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
