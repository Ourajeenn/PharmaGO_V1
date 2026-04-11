-- Ajouter les champs manquants relatifs à la santé dans le tableau des patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_history TEXT;
