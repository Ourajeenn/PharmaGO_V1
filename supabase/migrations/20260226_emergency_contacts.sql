-- =====================================================
-- TABLE: EMERGENCY_CONTACTS
-- =====================================================
-- Permet de stocker les contacts d'urgence pour chaque patient
-- =====================================================

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ACTIVER RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- POLITIQUES DE SÉCURITÉ
-- Un utilisateur peut gérer les contacts d'urgence des patients qu'il possède
CREATE POLICY "Users can manage emergency contacts of own patients"
ON public.emergency_contacts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.patients
        WHERE public.patients.id = public.emergency_contacts.patient_id
        AND public.patients.user_id = auth.uid()
    )
);

-- TRIGGER POUR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
