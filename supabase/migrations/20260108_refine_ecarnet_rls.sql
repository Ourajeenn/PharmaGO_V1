-- Refine E-Carnet RLS Policies
-- Ensures patients can only access their own medical records

-- 1. Fix type of patient_id in E-Carnet tables to match patients.user_id (UUID)
DO $$ 
BEGIN
    -- This script assumes the tables were created with TEXT patient_id as per previous migration
    -- and attempts to convert them to UUID for proper relationship mapping.
    
    ALTER TABLE public.birth_records ALTER COLUMN patient_id TYPE UUID USING patient_id::UUID;
    ALTER TABLE public.vaccinations ALTER COLUMN patient_id TYPE UUID USING patient_id::UUID;
    ALTER TABLE public.growth_records ALTER COLUMN patient_id TYPE UUID USING patient_id::UUID;
    ALTER TABLE public.medical_visits ALTER COLUMN patient_id TYPE UUID USING patient_id::UUID;
    ALTER TABLE public.medical_documents ALTER COLUMN patient_id TYPE UUID USING patient_id::UUID;
    ALTER TABLE public.medical_alerts ALTER COLUMN patient_id TYPE UUID USING patient_id::UUID;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Skipping type conversion, columns might already be UUID or do not exist.';
END $$;

-- 2. Drop broad policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.birth_records;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.vaccinations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.growth_records;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.medical_visits;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.medical_documents;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.medical_alerts;

-- 3. Create Refined Policies (Access only for owner)
-- We check if patient_id (UUID) matches auth.uid() directly since 1 user = 1 patient primary record usually.
-- Or more robustly, if the patient_id links to a patient record owned by the user.

-- Birth Records
CREATE POLICY "Users can manage own birth records" ON public.birth_records
    FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Vaccinations
CREATE POLICY "Users can manage own vaccinations" ON public.vaccinations
    FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Growth Records
CREATE POLICY "Users can manage own growth records" ON public.growth_records
    FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Medical Visits
CREATE POLICY "Users can manage own medical visits" ON public.medical_visits
    FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Medical Documents
CREATE POLICY "Users can manage own medical documents" ON public.medical_documents
    FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Medical Alerts
CREATE POLICY "Users can manage own medical alerts" ON public.medical_alerts
    FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- 4. Grant access to Doctors (Optional but common for E-Carnet)
-- Note: Doctors could view patient records if they have an active prescription/order link.
-- For now, we keep it simple for the user owner.
