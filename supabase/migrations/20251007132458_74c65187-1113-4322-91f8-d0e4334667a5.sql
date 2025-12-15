-- FIX CRITICAL: Remove public access to chat when user_id is NULL
-- This prevents exposing sensitive medical questions to anyone

-- Drop existing policies on chat_conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;

-- Drop existing policies on chat_messages
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;

-- Create new secure policies for chat_conversations
CREATE POLICY "Authenticated users can create conversations"
  ON public.chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new secure policies for chat_messages
CREATE POLICY "Authenticated users can create messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- Add policies to allow legitimate business access to patient data
CREATE POLICY "Doctors can view their patients data"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN doctors d ON d.user_id = o.doctor_id
      WHERE o.patient_id = patients.user_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can view patient data for their orders"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN pharmacies p ON p.id = o.pharmacy_id
      WHERE o.patient_id = patients.user_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Insurers can view patient data for claims"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM insurance_claims ic
      JOIN insurers ins ON ins.user_id = ic.insurer_id
      WHERE ic.patient_id = patients.user_id
      AND ins.user_id = auth.uid()
    )
  );

-- Allow patients to view verified doctor profiles
CREATE POLICY "Anyone can view verified doctor profiles"
  ON public.doctors FOR SELECT
  TO authenticated
  USING (verified = true);

-- Allow patients and pharmacies to view driver information for active orders
CREATE POLICY "Patients can view their assigned drivers"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN patients p ON p.user_id = o.patient_id
      WHERE o.driver_id = drivers.user_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can view drivers for their orders"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN pharmacies ph ON ph.id = o.pharmacy_id
      WHERE o.driver_id = drivers.user_id
      AND ph.user_id = auth.uid()
    )
  );

-- Allow authenticated users to view verified insurer profiles
CREATE POLICY "Anyone can view verified insurer profiles"
  ON public.insurers FOR SELECT
  TO authenticated
  USING (verified = true);