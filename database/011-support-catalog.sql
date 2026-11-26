-- Additive catalogue only. Donation preferences use the existing verified payment metadata.
CREATE TABLE IF NOT EXISTS support_items (
 id varchar(80) PRIMARY KEY,
 content json NOT NULL,
 revision int unsigned NOT NULL,
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS support_item_revisions (
 item_id varchar(80) NOT NULL,
 revision int unsigned NOT NULL,
 content json NOT NULL,
 actor_id varchar(36) NOT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(item_id,revision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
