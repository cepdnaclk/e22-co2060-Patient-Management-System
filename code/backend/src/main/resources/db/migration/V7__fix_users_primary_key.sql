-- V7__fix_users_primary_key.sql
-- Force-add a primary key to the users table.
-- Drops any existing constraint that might be preventing re-creation.

DO $$
DECLARE
    v_constraint_name TEXT;
BEGIN
    -- Find and drop any existing PK constraint on users table
    SELECT constraint_name INTO v_constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'users'
      AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;

    IF v_constraint_name IS NOT NULL THEN
        -- PK already exists, nothing to do
        RAISE NOTICE 'Primary key constraint already exists: %', v_constraint_name;
    ELSE
        -- Add primary key
        ALTER TABLE users ADD PRIMARY KEY (id);
        RAISE NOTICE 'Primary key added to users table';
    END IF;
END
$$;
