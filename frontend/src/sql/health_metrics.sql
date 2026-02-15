-- Create health_metrics table
CREATE TABLE IF NOT EXISTS public.health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'blood_pressure', 'glucose', 'spO2', 'weight', 'heart_rate'
    value JSONB NOT NULL, -- Stores flexible values like {"systolic": 120, "diastolic": 80} or {"value": 98}
    unit VARCHAR(20),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own health metrics"
ON public.health_metrics FOR SELECT
TO authenticated
USING (patient_id = auth.uid());

CREATE POLICY "Users can insert their own health metrics"
ON public.health_metrics FOR INSERT
TO authenticated
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view their patients' health metrics"
ON public.health_metrics FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.appointments
        WHERE appointments.patient_id = health_metrics.patient_id
        AND appointments.doctor_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.patient_id = health_metrics.patient_id
        AND orders.doctor_id = auth.uid()
    )
);
