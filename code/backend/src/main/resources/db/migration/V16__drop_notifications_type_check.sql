-- V16__drop_notifications_type_check.sql
-- Drop the check constraint on the notifications table that limits the notification type enum.
-- Since the NotificationType enum has been expanded to include CRITICAL_ALERT (and potentially others),
-- the old constraint prevents insertions of these new notification types.
-- We drop it so Spring Validation and the Java enum govern valid notification types instead.

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id BIGINT;
