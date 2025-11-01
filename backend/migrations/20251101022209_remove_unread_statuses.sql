-- Remove all UNREAD (status_id = 0) reading statuses
-- UNREAD is the default state when no status is set, so we don't need to track it
DELETE FROM reading_status WHERE status_id = 0;
