-- V9__force_fix_users_primary_key.sql
-- The previous V7 migration ran but the PK was not actually created
-- (likely because pg_constraint has an unnamed unique index on id from BIGSERIAL).
-- This migration forcefully ensures the PK exists.

DO $$
DECLARE
    v_has_pk BOOLEAN;
BEGIN
    -- Check if users table actually has a PRIMARY KEY in pg_constraint
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'users'
          AND c.contype = 'p'
    ) INTO v_has_pk;

    IF NOT v_has_pk THEN
        -- Try to add primary key (will fail if duplicate values exist)
        ALTER TABLE users ADD PRIMARY KEY (id);
        RAISE NOTICE 'Primary key successfully added to users table';
    ELSE
        RAISE NOTICE 'Primary key already exists on users table';
    END IF;
END
$$;
