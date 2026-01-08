-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT NOT NULL DEFAULT 'Consultation',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Doctors can manage their appointments" ON public.appointments FOR ALL USING (
  auth.uid() = doctor_id
);

CREATE POLICY "Patients can view their appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = patient_id
);

-- Add missing columns to prescriptions
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS medications JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT;
