-- V1__init_schema.sql
-- Baseline schema: maps what already exists in the database.
-- Flyway will mark this as applied without re-running DDL (since tables already exist).
-- If starting fresh, this will create all tables from scratch.

-- ─── USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    firstname     VARCHAR(255)        NOT NULL,
    lastname      VARCHAR(255)        NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    mobilenumber  VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    role          VARCHAR(50)         NOT NULL,
    is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP                    DEFAULT NOW()
);

-- ─── PATIENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id                          BIGSERIAL PRIMARY KEY,
    user_id                     BIGINT UNIQUE REFERENCES users(id),
    date_of_birth               DATE,
    gender                      VARCHAR(20),
    blood_type                  VARCHAR(10),
    blood_pressure              VARCHAR(30),
    heart_rate                  INTEGER,
    temperature                 DOUBLE PRECISION,
    oxygen_saturation           DOUBLE PRECISION,
    respiratory_rate            INTEGER,
    height                      DOUBLE PRECISION,
    weight                      DOUBLE PRECISION,
    last_vitals_update          TIMESTAMP,
    patient_id                  VARCHAR(50),
    primary_doctor              VARCHAR(255),
    admission_date              TIMESTAMP,
    admission_reason            VARCHAR(1000),
    admission_status            VARCHAR(50),
    discharge_date              TIMESTAMP,
    address                     VARCHAR(1000),
    emergency_contact_name      VARCHAR(255),
    emergency_contact_phone     VARCHAR(50),
    emergency_contact_relation  VARCHAR(100),
    medical_history             VARCHAR(1000),
    allergies                   VARCHAR(1000),
    current_medications         VARCHAR(1000),
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP          DEFAULT NOW()
);

-- ─── DOCTORS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT UNIQUE REFERENCES users(id),
    specialization   VARCHAR(255),
    license_number   VARCHAR(255) UNIQUE,
    hospital_name    VARCHAR(255),
    department       VARCHAR(255),
    consultation_fee DOUBLE PRECISION,
    is_available     BOOLEAN DEFAULT TRUE,
    bio              TEXT,
    experience_years INTEGER,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP          DEFAULT NOW()
);

-- ─── APPOINTMENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
    id               BIGSERIAL PRIMARY KEY,
    patient_id       BIGINT REFERENCES patients(id),
    doctor_id        BIGINT REFERENCES doctors(id),
    appointment_date TIMESTAMP,
    duration_minutes INTEGER,
    status           VARCHAR(50) DEFAULT 'SCHEDULED',
    notes            TEXT,
    reason_for_visit VARCHAR(1000),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP          DEFAULT NOW()
);

-- ─── MEDICAL RECORDS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_records (
    id             BIGSERIAL PRIMARY KEY,
    patient_id     BIGINT REFERENCES patients(id),
    doctor_id      BIGINT REFERENCES doctors(id),
    record_type    VARCHAR(50),
    title          VARCHAR(255),
    description    TEXT,
    diagnosis      TEXT,
    treatment      TEXT,
    prescription   TEXT,
    test_results   TEXT,
    attachments    VARCHAR(500),
    record_date    TIMESTAMP,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP          DEFAULT NOW()
);

-- ─── INDEXES for performance ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_user_id     ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor  ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_pat  ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doc  ON medical_records(doctor_id);
