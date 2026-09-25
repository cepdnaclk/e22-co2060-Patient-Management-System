-- ============================================================================
-- V18: Allow deleting/updating users by configuring ON DELETE actions
-- on tables that reference users(id).
-- ============================================================================

-- 1. audit_logs: Preserve audit trail but set user_id to NULL when user is deleted
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. management_activity_logs: Set performed_by / target_user to NULL
ALTER TABLE management_activity_logs DROP CONSTRAINT IF EXISTS fk_management_log_performed_by;
ALTER TABLE management_activity_logs ADD CONSTRAINT fk_management_log_performed_by 
    FOREIGN KEY (performed_by_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE management_activity_logs DROP CONSTRAINT IF EXISTS fk_management_log_target_user;
ALTER TABLE management_activity_logs ADD CONSTRAINT fk_management_log_target_user 
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. profile_change_requests: Cascade delete requests when user is deleted, set reviewer to NULL
ALTER TABLE profile_change_requests DROP CONSTRAINT IF EXISTS profile_change_requests_user_id_fkey;
ALTER TABLE profile_change_requests ADD CONSTRAINT profile_change_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE profile_change_requests DROP CONSTRAINT IF EXISTS profile_change_requests_reviewed_by_fkey;
ALTER TABLE profile_change_requests ADD CONSTRAINT profile_change_requests_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- 4. invoices: Preserve invoices when creator is deleted
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_created_by_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_id_fkey 
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
