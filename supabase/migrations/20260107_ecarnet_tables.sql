-- E-Carnet de Santé Database Schema

-- 1. Extend Patients table if needed (most fields already added in previous migrations)
-- We ensure the primary key is user_id for direct 1:1 with auth.users if needed, 
-- but existing schema uses user_id as a foreign key and ID as UUID.
-- We will follow the existing pattern in migrations.

-- 2. Birth Records
CREATE TABLE IF NOT EXISTS public.birth_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL, -- Logical ID linking to patients.id (which is currently TEXT in some places)
    birth_weight INTEGER, -- grams
    birth_height NUMERIC(5,2), -- cm
    head_circumference NUMERIC(5,2), -- cm
    apgar_1min INTEGER,
    apgar_5min INTEGER,
    apgar_10min INTEGER,
    gestational_age INTEGER,
    delivery_type TEXT,
    complications TEXT,
    neonatal_screening JSONB DEFAULT '{"done": false}',
    doctor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vaccinations
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    vaccine_name TEXT NOT NULL,
    disease TEXT,
    is_required BOOLEAN DEFAULT true,
    administration_date DATE,
    next_due_date DATE,
    batch_number TEXT,
    administered_by TEXT,
    status TEXT DEFAULT 'À venir',
    booster_dates JSONB DEFAULT '[]',
    notes TEXT,
    side_effects TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Growth Records
CREATE TABLE IF NOT EXISTS public.growth_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    measurement_date DATE DEFAULT CURRENT_DATE,
    age_in_months INTEGER,
    weight NUMERIC(5,2), -- kg
    height NUMERIC(5,2), -- cm
    head_circumference NUMERIC(5,2), -- cm
    bmi NUMERIC(4,2),
    notes TEXT,
    measured_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Medical Visits
CREATE TABLE IF NOT EXISTS public.medical_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    visit_date TIMESTAMPTZ DEFAULT NOW(),
    visit_type TEXT DEFAULT 'Consultation',
    doctor_name TEXT,
    specialty TEXT,
    reason TEXT,
    symptoms JSONB DEFAULT '[]',
    vital_signs JSONB DEFAULT '{}',
    diagnosis TEXT,
    exams_ordered JSONB DEFAULT '[]',
    prescriptions JSONB DEFAULT '[]',
    recommendations TEXT,
    next_visit_date DATE,
    next_visit_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Medical Documents (Metadata)
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT,
    description TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    storage_path TEXT, -- Link to Supabase Storage
    document_date DATE,
    uploaded_by TEXT,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Medical Alerts
CREATE TABLE IF NOT EXISTS public.medical_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    type TEXT,
    priority TEXT DEFAULT 'Moyenne',
    title TEXT NOT NULL,
    message TEXT,
    due_date DATE,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Simplified for dev)
ALTER TABLE public.birth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_alerts ENABLE ROW LEVEL SECURITY;

-- Broad policies for authenticated users (should be refined with patient_id checks in prod)
CREATE POLICY "Enable all for authenticated users" ON public.birth_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.vaccinations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.growth_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.medical_visits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.medical_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.medical_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
