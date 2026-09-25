-- Add critical_status column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS critical_status BOOLEAN DEFAULT FALSE;
