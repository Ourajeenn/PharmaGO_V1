-- Add missing health fields to patients table to support the Profile UI
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_history TEXT;

-- Update RLS policies to ensuring patients can update their own data
-- (Assuming policies already exist, but ensuring update capability)
CREATE POLICY "Users can update own patient data" 
ON public.patients FOR UPDATE 
USING (auth.uid() = user_id);
