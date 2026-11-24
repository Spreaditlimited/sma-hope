CREATE TABLE IF NOT EXISTS learning_feedback (
 user_id varchar(36) NOT NULL,
 course_slug varchar(100) NOT NULL,
 rating tinyint unsigned NOT NULL,
 helpful text NOT NULL,
 improvement text NOT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(user_id,course_slug),
 INDEX feedback_recent(updated_at),
 CONSTRAINT feedback_rating CHECK(rating BETWEEN 1 AND 5),
 FOREIGN KEY(user_id) REFERENCES account_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
