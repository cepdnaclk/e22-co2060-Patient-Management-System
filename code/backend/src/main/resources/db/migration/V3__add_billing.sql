-- V3__add_billing.sql
-- Creates invoices and invoice_items tables for the billing system.

-- ─── INVOICES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
    id               BIGSERIAL PRIMARY KEY,
    invoice_number   VARCHAR(50) UNIQUE NOT NULL,
    patient_id       BIGINT             NOT NULL REFERENCES patients(id),
    appointment_id   BIGINT             REFERENCES appointments(id),
    created_by_id    BIGINT             REFERENCES users(id),
    status           VARCHAR(30)        NOT NULL DEFAULT 'DRAFT',
    -- Status values: DRAFT, ISSUED, PAID, PARTIALLY_PAID, CANCELLED
    payment_method   VARCHAR(30),
    -- Payment methods: CASH, CARD, INSURANCE, ONLINE
    subtotal         NUMERIC(12, 2)     NOT NULL DEFAULT 0,
    discount         NUMERIC(12, 2)     NOT NULL DEFAULT 0,
    tax              NUMERIC(12, 2)     NOT NULL DEFAULT 0,
    total_amount     NUMERIC(12, 2)     NOT NULL DEFAULT 0,
    paid_amount      NUMERIC(12, 2)     NOT NULL DEFAULT 0,
    notes            TEXT,
    issued_at        TIMESTAMP,
    due_date         TIMESTAMP,
    paid_at          TIMESTAMP,
    created_at       TIMESTAMP          NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP                   DEFAULT NOW()
);

-- ─── INVOICE ITEMS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
    id           BIGSERIAL PRIMARY KEY,
    invoice_id   BIGINT         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description  VARCHAR(500)   NOT NULL,
    quantity     INTEGER        NOT NULL DEFAULT 1,
    unit_price   NUMERIC(12, 2) NOT NULL,
    total_price  NUMERIC(12, 2) NOT NULL,
    item_type    VARCHAR(50),
    -- Item types: CONSULTATION, MEDICINE, LAB_TEST, PROCEDURE, BED_CHARGE, OTHER
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invoices_patient    ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_inv   ON invoice_items(invoice_id);
