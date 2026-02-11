-- Add insurance_name column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_name TEXT;
