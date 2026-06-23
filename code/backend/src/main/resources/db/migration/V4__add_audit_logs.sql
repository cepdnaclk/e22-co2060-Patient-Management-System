-- V4__add_audit_logs.sql
-- Creates audit_logs table for comprehensive system activity tracking.
-- Required for healthcare compliance and security monitoring.

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       REFERENCES users(id),
    user_email   VARCHAR(255),
    action       VARCHAR(100) NOT NULL,
    -- e.g. LOGIN, LOGOUT, LOGIN_FAILED, VIEW_PATIENT, UPDATE_RECORD, CREATE_INVOICE
    entity_type  VARCHAR(100),
    -- e.g. Patient, MedicalRecord, Invoice, User
    entity_id    VARCHAR(100),
    details      TEXT,
    -- Human-readable summary or JSON delta of old/new values
    ip_address   VARCHAR(50),
    status       VARCHAR(20)  NOT NULL DEFAULT 'SUCCESS',
    -- SUCCESS or FAILED
    timestamp    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Index for fast querying by user or time range
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action    ON audit_logs(action);
