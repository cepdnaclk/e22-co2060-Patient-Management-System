-- ============================================================================
-- V17: Add email OTP verification support
-- ============================================================================

-- Table to store OTP codes for email verification during signup
CREATE TABLE IF NOT EXISTS email_otps (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    otp_hash        VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP    NOT NULL,
    verified        BOOLEAN      NOT NULL DEFAULT FALSE,
    attempts        INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by email + unverified status
CREATE INDEX IF NOT EXISTS idx_email_otps_email_verified
    ON email_otps (email, verified);

-- Add email_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing active users are considered email-verified
UPDATE users SET email_verified = TRUE WHERE is_active = TRUE;
