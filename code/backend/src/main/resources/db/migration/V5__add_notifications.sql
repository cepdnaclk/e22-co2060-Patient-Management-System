-- V5__add_notifications.sql
-- Creates notifications table for in-app alerts to doctors, patients, and staff.

CREATE TABLE IF NOT EXISTS notifications (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(50)  NOT NULL DEFAULT 'INFO',
    -- Types: INFO, WARNING, APPOINTMENT, PRESCRIPTION, BILLING, SYSTEM
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    link_url     VARCHAR(500),
    -- Optional deep link (e.g., /dashboard/doctor?section=records&id=42)
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    read_at      TIMESTAMP
);

-- ─── OPD QUEUE ─────────────────────────────────────────────────────────────
-- OPD (Out Patient Department) token queue for receptionists.
CREATE TABLE IF NOT EXISTS opd_tokens (
    id           BIGSERIAL PRIMARY KEY,
    token_number VARCHAR(20)  NOT NULL,
    -- e.g. "OPD-2024-0045"
    patient_id   BIGINT       REFERENCES patients(id),
    patient_name VARCHAR(255) NOT NULL,
    doctor_id    BIGINT       REFERENCES doctors(id),
    status       VARCHAR(30)  NOT NULL DEFAULT 'WAITING',
    -- Statuses: WAITING, IN_PROGRESS, COMPLETED, SKIPPED
    priority     VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',
    -- Priorities: NORMAL, URGENT, EMERGENCY
    notes        TEXT,
    issued_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    called_at    TIMESTAMP,
    completed_at TIMESTAMP
);

-- ─── INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_opd_tokens_status     ON opd_tokens(status);
CREATE INDEX IF NOT EXISTS idx_opd_tokens_doctor     ON opd_tokens(doctor_id);
