-- ===============================================
-- PHARMA-GO SUPABASE - MIGRATIONS CONSOLIDÉES
-- ===============================================
-- Ce fichier regroupe toutes les migrations essentielles
-- À exécuter dans Supabase SQL Editor
-- ===============================================

-- ÉTAPE 1: Types Énumérés
-- ===============================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'pharmacy', 'driver', 'insurer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ÉTAPE 2: Tables Principales
-- ===============================================

-- Table User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    email TEXT UNIQUE,
    phone TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Table Doctors
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    specialization TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    experience_years INTEGER,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Pharmacies
CREATE TABLE IF NOT EXISTS public.pharmacies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    license_number TEXT,
    verified BOOLEAN DEFAULT false,
    is_on_duty BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    license_plate TEXT,
    experience_years INTEGER,
    verified BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    insurance_id TEXT,
    insurance_name TEXT,
    cmu_number TEXT,
    address TEXT,
    birth_date DATE,
    gender TEXT,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Insurers
CREATE TABLE IF NOT EXISTS public.insurers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    license_number TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    related_type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÉTAPE 3: Indexes
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_user_id ON public.pharmacies(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_insurers_user_id ON public.insurers(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ÉTAPE 4: Trigger d'Inscription Automatique
-- ===============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Determine role (default to patient)
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'patient'::public.user_role);

  -- 1. Create User Profile
  INSERT INTO public.user_profiles (id, name, role, email, phone, verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    v_role,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    false
  )
  ON CONFLICT (id) DO NOTHING;

  -- 1.1 Create User Role mapping
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;

  -- 2. Create Role-Specific Entry
  CASE v_role
    WHEN 'patient' THEN
      INSERT INTO public.patients (user_id, insurance_id, cmu_number, address)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'insurance_id',
        NEW.raw_user_meta_data->>'cmu_number',
        NEW.raw_user_meta_data->>'address'
      )
      ON CONFLICT (user_id) DO NOTHING;

    WHEN 'driver' THEN
      INSERT INTO public.drivers (user_id, vehicle_type, license_plate, experience_years, verified, available)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'vehicle_type',
        NEW.raw_user_meta_data->>'license_plate',
        (NEW.raw_user_meta_data->>'experience_years')::integer,
        false,
        false
      )
      ON CONFLICT (user_id) DO NOTHING;

    WHEN 'pharmacy' THEN
      INSERT INTO public.pharmacies (id, user_id, name, address, license_number, verified, is_on_duty)
      VALUES (
        gen_random_uuid(),
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Pharmacie Sans Nom'),
        COALESCE(NEW.raw_user_meta_data->>'clinic_address', 'Adresse non renseignée'),
        NEW.raw_user_meta_data->>'license_number',
        false,
        false
      )
      ON CONFLICT DO NOTHING;
      
    WHEN 'doctor' THEN
      INSERT INTO public.doctors (user_id, license_number, specialization, clinic_name, clinic_address, verified)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
        NEW.raw_user_meta_data->>'specialization',
        NEW.raw_user_meta_data->>'clinic_name',
        NEW.raw_user_meta_data->>'clinic_address',
        false
      )
      ON CONFLICT (user_id) DO NOTHING;

    WHEN 'insurer' THEN
      INSERT INTO public.insurers (user_id, company_name, license_number, verified)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company_name', COALESCE(NEW.raw_user_meta_data->>'name', 'Assurance Sans Nom')),
        COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
        false
      )
      ON CONFLICT (user_id) DO NOTHING;

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ÉTAPE 5: Row Level Security (RLS)
-- ===============================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Doctors Policies
CREATE POLICY "Doctors can view own data" ON public.doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update own data" ON public.doctors
    FOR UPDATE USING (auth.uid() = user_id);

-- Pharmacies Policies
CREATE POLICY "Pharmacies can view own data" ON public.pharmacies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pharmacies can update own data" ON public.pharmacies
    FOR UPDATE USING (auth.uid() = user_id);

-- Drivers Policies
CREATE POLICY "Drivers can view own data" ON public.drivers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own data" ON public.drivers
    FOR UPDATE USING (auth.uid() = user_id);

-- Patients Policies
CREATE POLICY "Patients can view own data" ON public.patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own data" ON public.patients
    FOR UPDATE USING (auth.uid() = user_id);

-- Insurers Policies
CREATE POLICY "Insurers can view own data" ON public.insurers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insurers can update own data" ON public.insurers
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===============================================
-- ✅ MIGRATION TERMINÉE
-- ===============================================
-- Les tables sont créées et sécurisées.
-- L'inscription automatique est activée.
-- Testez maintenant l'inscription docteur!
-- ===============================================
