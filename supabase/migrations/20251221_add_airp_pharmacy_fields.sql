-- Add AIRP-specific fields to pharmacies table
-- This migration enhances the pharmacies table to capture all data from AIRP

-- Make user_id nullable for AIRP imports (pharmacies without registered users)
ALTER TABLE public.pharmacies
ALTER COLUMN user_id DROP NOT NULL;

-- Add new fields for AIRP pharmacy data
ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS manager_name TEXT, -- Nom et prénom du gérant
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'OFFICINES PRIVEES DE PHARMACIE',
ADD COLUMN IF NOT EXISTS airp_source BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_region ON public.pharmacies(region);
CREATE INDEX IF NOT EXISTS idx_pharmacies_department ON public.pharmacies(department);
CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON public.pharmacies(city);
CREATE INDEX IF NOT EXISTS idx_pharmacies_airp_source ON public.pharmacies(airp_source);
CREATE INDEX IF NOT EXISTS idx_pharmacies_name_search ON public.pharmacies USING gin(to_tsvector('french', name));

-- Add comments
COMMENT ON COLUMN public.pharmacies.region IS 'Région administrative (ex: ABIDJAN, WORODOUGOU)';
COMMENT ON COLUMN public.pharmacies.department IS 'Département (ex: SEGUELA, MAN)';
COMMENT ON COLUMN public.pharmacies.city IS 'Ville ou commune';
COMMENT ON COLUMN public.pharmacies.manager_name IS 'Nom et prénom du gérant de la pharmacie';
COMMENT ON COLUMN public.pharmacies.airp_source IS 'Indicates if data was imported from AIRP database';

-- Update RLS policies to allow viewing AIRP pharmacies without user_id
DROP POLICY IF EXISTS "Public can view verified pharmacies" ON public.pharmacies;
CREATE POLICY "Public can view verified pharmacies" ON public.pharmacies 
  FOR SELECT USING (verified = true OR airp_source = true);
