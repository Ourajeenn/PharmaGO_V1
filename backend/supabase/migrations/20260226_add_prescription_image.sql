-- Add image column to prescriptions
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies to allow patients to upload their own prescriptions
CREATE POLICY "Patients can upload own prescriptions" ON public.prescriptions
FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Storage bucket for prescriptions (if not already created)
-- Note: Supabase storage is usually managed via dashboard or special SQL function
-- But we can assume a bucket named 'prescriptions' exists or will be used
