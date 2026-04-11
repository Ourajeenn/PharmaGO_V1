-- Fix user_profiles table to allow proper registration
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix patients table
ALTER TABLE patients
  ALTER COLUMN insurance_id DROP NOT NULL,
  ALTER COLUMN cmu_number DROP NOT NULL;

ALTER TABLE orders
  ALTER COLUMN patient_id DROP NOT NULL;

-- Clean up and recreate order policies
DROP POLICY IF EXISTS "Patients can create orders" ON orders;
DROP POLICY IF EXISTS "Patients can view their orders" ON orders;
DROP POLICY IF EXISTS "Patients can update their orders" ON orders;
DROP POLICY IF EXISTS "Patients can insert order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

-- Orders policies
CREATE POLICY "Patients can create orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM patients WHERE patients.user_id = auth.uid()));

CREATE POLICY "Patients can view their orders"
  ON orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM patients WHERE patients.user_id = orders.patient_id AND patients.user_id = auth.uid()));

CREATE POLICY "Patients can update their orders"
  ON orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM patients WHERE patients.user_id = orders.patient_id AND patients.user_id = auth.uid()));

-- Order items policies
CREATE POLICY "Patients can insert order items"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders o JOIN patients p ON o.patient_id = p.user_id WHERE o.id = order_items.order_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders o LEFT JOIN patients p ON o.patient_id = p.user_id WHERE o.id = order_items.order_id AND p.user_id = auth.uid()));