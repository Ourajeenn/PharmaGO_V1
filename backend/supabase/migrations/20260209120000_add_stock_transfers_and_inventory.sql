-- Create stock_transfers table
CREATE TABLE IF NOT EXISTS public.stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    from_pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id),
    to_pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_transit', 'completed')),
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add min_stock and max_stock to pharmacy_inventory
ALTER TABLE public.pharmacy_inventory
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS auto_reorder BOOLEAN DEFAULT false;

-- Add RLS policies for stock_transfers
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pharmacies can view transfers involving them"
ON public.stock_transfers
FOR ALL
TO authenticated
USING (
    auth.uid() = from_pharmacy_id OR 
    auth.uid() = to_pharmacy_id
);

-- Add updated_at trigger for stock_transfers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_stock_transfers_updated_at ON public.stock_transfers;
CREATE TRIGGER update_stock_transfers_updated_at
    BEFORE UPDATE ON public.stock_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
