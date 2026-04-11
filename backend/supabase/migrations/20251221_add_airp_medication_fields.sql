-- Add AIRP-specific fields to medicines table
-- This migration enhances the medicines table to capture all data from AIRP

ALTER TABLE public.medicines
ADD COLUMN IF NOT EXISTS amm_number TEXT,
ADD COLUMN IF NOT EXISTS amm_acquisition_date DATE,
ADD COLUMN IF NOT EXISTS amm_expiration_date DATE,
ADD COLUMN IF NOT EXISTS dci TEXT, -- Dénomination Commune Internationale (active ingredients)
ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
ADD COLUMN IF NOT EXISTS rcp_url TEXT, -- Résumé des Caractéristiques du Produit
ADD COLUMN IF NOT EXISTS notice_url TEXT, -- Notice patient
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'medication' CHECK (product_type IN ('medication', 'phytomedicine', 'supplement')),
ADD COLUMN IF NOT EXISTS airp_source BOOLEAN DEFAULT false;

-- Create index on AMM number for faster lookups
CREATE INDEX IF NOT EXISTS idx_medicines_amm_number ON public.medicines(amm_number);

-- Create index on product type for filtering
CREATE INDEX IF NOT EXISTS idx_medicines_product_type ON public.medicines(product_type);

-- Create index on AIRP source flag
CREATE INDEX IF NOT EXISTS idx_medicines_airp_source ON public.medicines(airp_source);

-- Add comment to table
COMMENT ON COLUMN public.medicines.amm_number IS 'Numéro d''Autorisation de Mise sur le Marché';
COMMENT ON COLUMN public.medicines.dci IS 'Dénomination Commune Internationale - Active ingredients';
COMMENT ON COLUMN public.medicines.product_type IS 'Type of product: medication, phytomedicine, or supplement';
COMMENT ON COLUMN public.medicines.airp_source IS 'Indicates if data was imported from AIRP database';
