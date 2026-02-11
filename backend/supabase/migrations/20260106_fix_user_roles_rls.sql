-- FIX: Grant permissions for client-side profile repair
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on user_roles (should already be enabled, but let's be sure)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies and create comprehensive ones for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

CREATE POLICY "Users can manage own roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Ensure role-specific tables also allow repair if needed
-- Drivers
DROP POLICY IF EXISTS "Drivers can insert their own profile" ON public.drivers;
CREATE POLICY "Drivers can insert their own profile" ON public.drivers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Patients
DROP POLICY IF EXISTS "Users can insert their own patient profile" ON public.patients;
CREATE POLICY "Users can insert their own patient profile" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Doctors
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON public.doctors;
CREATE POLICY "Doctors can insert their own profile" ON public.doctors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insurers
DROP POLICY IF EXISTS "Insurers can insert their own profile" ON public.insurers;
CREATE POLICY "Insurers can insert their own profile" ON public.insurers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Pharmacy (already handled usually, but for consistency)
DROP POLICY IF EXISTS "Pharmacies can insert their own profile" ON public.pharmacies;
CREATE POLICY "Pharmacies can insert their own profile" ON public.pharmacies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
