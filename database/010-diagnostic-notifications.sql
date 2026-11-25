CREATE TABLE IF NOT EXISTS diagnostic_notifications (
 id char(36) NOT NULL PRIMARY KEY,
 event_key varchar(100) NOT NULL UNIQUE,
 kind varchar(20) NOT NULL,
 source_id char(36) NOT NULL,
 status varchar(12) NOT NULL DEFAULT 'pending',
 attempts int unsigned NOT NULL DEFAULT 0,
 next_attempt_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 locked_until datetime(3) DEFAULT NULL,
 lock_token char(36) DEFAULT NULL,
 last_error varchar(100) DEFAULT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 sent_at datetime(3) DEFAULT NULL,
 INDEX diagnostic_notification_due(status,next_attempt_at),
 CONSTRAINT diagnostic_notification_kind CHECK(kind IN ('report','clinician')),
 CONSTRAINT diagnostic_notification_status CHECK(status IN ('pending','sent'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
