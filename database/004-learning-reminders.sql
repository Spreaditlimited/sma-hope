CREATE TABLE IF NOT EXISTS learning_email_preferences (
 user_id varchar(36) PRIMARY KEY,
 enabled boolean NOT NULL DEFAULT false,
 paused_until datetime(3) NULL,
 enabled_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 token varchar(64) NOT NULL UNIQUE,
 source varchar(32) NOT NULL,
 version varchar(32) NOT NULL DEFAULT 'learning-reminders-v1',
 FOREIGN KEY(user_id) REFERENCES account_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS learning_email_settings (
 id tinyint PRIMARY KEY, enabled boolean NOT NULL DEFAULT false,
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_by varchar(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
INSERT IGNORE INTO learning_email_settings(id,enabled) VALUES(1,false);
CREATE TABLE IF NOT EXISTS learning_email_deliveries (
 id varchar(36) PRIMARY KEY, user_id varchar(36) NOT NULL,
 message_key varchar(48) NOT NULL, status varchar(24) NOT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), sent_at datetime(3) NULL,
 template_version varchar(32) NOT NULL DEFAULT 'learning-reminders-v1',
 UNIQUE KEY once_per_journey(user_id,message_key), INDEX delivery_time(user_id,created_at),
 FOREIGN KEY(user_id) REFERENCES account_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS learning_email_audit (
 id bigint unsigned AUTO_INCREMENT PRIMARY KEY, actor_id varchar(36) NULL,
 action varchar(40) NOT NULL, created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
