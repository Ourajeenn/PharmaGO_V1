-- Migration: Family Accounts support
-- Date: 2026-02-26

-- 1. Remove the 1-to-1 restriction between auth.users and patients
-- Postgres normally names the unique constraint [table]_[column]_key
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_user_id_key;

-- 2. Add relationship column to identify members
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'Moi';

-- 3. Update E-Carnet RLS policies to allow access to all family members
-- Instead of matching patient_id directly to auth.uid(), we check if the patient profile belongs to the user

-- birth_records
DROP POLICY IF EXISTS "Users can manage own birth records" ON public.birth_records;
CREATE POLICY "Users can manage family birth records" ON public.birth_records
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = birth_records.patient_id AND public.patients.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = birth_records.patient_id AND public.patients.user_id = auth.uid()));

-- vaccinations
DROP POLICY IF EXISTS "Users can manage own vaccinations" ON public.vaccinations;
CREATE POLICY "Users can manage family vaccinations" ON public.vaccinations
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = vaccinations.patient_id AND public.patients.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = vaccinations.patient_id AND public.patients.user_id = auth.uid()));

-- growth_records
DROP POLICY IF EXISTS "Users can manage own growth records" ON public.growth_records;
CREATE POLICY "Users can manage family growth records" ON public.growth_records
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = growth_records.patient_id AND public.patients.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = growth_records.patient_id AND public.patients.user_id = auth.uid()));

-- medical_visits
DROP POLICY IF EXISTS "Users can manage own medical visits" ON public.medical_visits;
CREATE POLICY "Users can manage family medical visits" ON public.medical_visits
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = medical_visits.patient_id AND public.patients.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = medical_visits.patient_id AND public.patients.user_id = auth.uid()));

-- medical_documents
DROP POLICY IF EXISTS "Users can manage own medical documents" ON public.medical_documents;
CREATE POLICY "Users can manage family medical documents" ON public.medical_documents
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = medical_documents.patient_id AND public.patients.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = medical_documents.patient_id AND public.patients.user_id = auth.uid()));

-- medical_alerts
DROP POLICY IF EXISTS "Users can manage own medical alerts" ON public.medical_alerts;
CREATE POLICY "Users can manage family medical alerts" ON public.medical_alerts
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = medical_alerts.patient_id AND public.patients.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE public.patients.id = medical_alerts.patient_id AND public.patients.user_id = auth.uid()));
