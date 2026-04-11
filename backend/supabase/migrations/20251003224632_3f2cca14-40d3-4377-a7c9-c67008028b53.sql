-- Fix user_profiles table to allow proper registration
-- Make email and name nullable initially, they will be updated by trigger
ALTER TABLE user_profiles 
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN name DROP NOT NULL;

-- Create or replace the trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role)
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies allow insertion
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add RLS policy to allow the trigger to insert
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
CREATE POLICY "Service role can insert profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix patients table to allow optional fields
ALTER TABLE patients
  ALTER COLUMN insurance_id DROP NOT NULL,
  ALTER COLUMN cmu_number DROP NOT NULL;

-- Ensure patients can be created without all fields
DROP POLICY IF EXISTS "Users can insert their own patient profile" ON patients;
CREATE POLICY "Users can insert their own patient profile"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Same for drivers
DROP POLICY IF EXISTS "Drivers can insert their own profile" ON drivers;
CREATE POLICY "Drivers can insert their own profile"
  ON drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Same for pharmacies
DROP POLICY IF EXISTS "Pharmacies can insert their own profile" ON pharmacies;
CREATE POLICY "Pharmacies can insert their own profile"
  ON pharmacies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Same for doctors
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON doctors;
CREATE POLICY "Doctors can insert their own profile"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Same for insurers
DROP POLICY IF EXISTS "Insurers can insert their own profile" ON insurers;
CREATE POLICY "Insurers can insert their own profile"
  ON insurers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create orders table if not exists with proper structure
-- First check if we need to modify the orders table
ALTER TABLE orders
  ALTER COLUMN patient_id DROP NOT NULL;

-- Allow patients to insert orders
DROP POLICY IF EXISTS "Patients can manage their orders" ON orders;
CREATE POLICY "Patients can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.user_id = orders.patient_id
    )
  );

CREATE POLICY "Patients can view their orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.user_id = orders.patient_id
    )
  );

CREATE POLICY "Patients can update their orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.user_id = orders.patient_id
    )
  );

-- Allow order_items to be inserted
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;

CREATE POLICY "Patients can insert order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN patients p ON o.patient_id = p.user_id
      WHERE o.id = order_items.order_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      LEFT JOIN patients p ON o.patient_id = p.user_id
      LEFT JOIN pharmacies ph ON o.pharmacy_id = ph.id
      LEFT JOIN drivers d ON o.driver_id = d.user_id
      WHERE o.id = order_items.order_id
      AND (p.user_id = auth.uid() OR ph.user_id = auth.uid() OR d.user_id = auth.uid())
    )
  );