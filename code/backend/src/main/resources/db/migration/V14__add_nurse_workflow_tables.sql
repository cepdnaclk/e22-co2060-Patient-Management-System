-- V14__add_nurse_workflow_tables.sql

-- ─── VITALS HISTORY ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vitals_history (
    id                 BIGSERIAL PRIMARY KEY,
    patient_id         BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    nurse_id           BIGINT REFERENCES users(id) ON DELETE SET NULL,
    blood_pressure     VARCHAR(30),
    heart_rate         INTEGER,
    temperature        DOUBLE PRECISION,
    oxygen_saturation  DOUBLE PRECISION,
    respiratory_rate   INTEGER,
    recorded_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── MEDICATION ORDERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medication_orders (
    id               BIGSERIAL PRIMARY KEY,
    patient_id       BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id        BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    medication_name  VARCHAR(255) NOT NULL,
    dosage           VARCHAR(100) NOT NULL,
    frequency        VARCHAR(100) NOT NULL,
    icd10_code       VARCHAR(50),
    status           VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DISCONTINUED, COMPLETED
    start_date       TIMESTAMP,
    end_date         TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- ─── MEDICATION ADMINISTRATIONS (MAR) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS medication_administrations (
    id               BIGSERIAL PRIMARY KEY,
    order_id         BIGINT NOT NULL REFERENCES medication_orders(id) ON DELETE CASCADE,
    nurse_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status           VARCHAR(50) NOT NULL, -- GIVEN, SKIPPED, REFUSED
    notes            VARCHAR(1000),
    administered_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── CLINICAL ORDERS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinical_orders (
    id               BIGSERIAL PRIMARY KEY,
    patient_id       BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id        BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    order_type       VARCHAR(100) NOT NULL, -- LAB, PROCEDURE, DIET, NURSING
    description      TEXT NOT NULL,
    status           VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMP,
    completed_by     BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- ─── INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vitals_history_patient ON vitals_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_history_recorded ON vitals_history(patient_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_med_orders_patient ON medication_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_admin_order ON medication_administrations(order_id);
CREATE INDEX IF NOT EXISTS idx_clin_orders_patient ON clinical_orders(patient_id);
