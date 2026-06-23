-- Add critical_status column to patients table
ALTER TABLE patients ADD COLUMN critical_status BOOLEAN DEFAULT FALSE;
