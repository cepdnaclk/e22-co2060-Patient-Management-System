-- V12: Ensure appointments table has the correct column names that Hibernate expects.
-- Hibernate with ddl-auto=update generates: appointment_date_time and reason
-- The V1 schema used: appointment_date and reason_for_visit
-- This migration adds the Hibernate-expected columns if they don't exist,
-- and copies existing data from the V1 column names.

-- Add appointment_date_time if it doesn't exist (Hibernate's auto-generated name)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date_time TIMESTAMP;

-- Copy existing data from appointment_date to appointment_date_time
UPDATE appointments SET appointment_date_time = appointment_date WHERE appointment_date_time IS NULL AND appointment_date IS NOT NULL;

-- Add reason column if it doesn't exist (Hibernate's auto-generated name for 'reason' field)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason VARCHAR(1000);

-- Copy existing data from reason_for_visit to reason
UPDATE appointments SET reason = reason_for_visit WHERE reason IS NULL AND reason_for_visit IS NOT NULL;

-- Add duration_minutes column if it doesn't exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Set default duration if null
UPDATE appointments SET duration_minutes = 30 WHERE duration_minutes IS NULL;
