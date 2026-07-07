-- V10__drop_users_role_check.sql
-- Drop the check constraint on the users table that limits roles.
-- Since the Role enum has been expanded to include MANAGEMENT, the old constraint prevents insertions of MANAGEMENT users.
-- We drop it so Spring Validation and the Java enum govern valid roles instead.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
