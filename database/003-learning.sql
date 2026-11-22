CREATE TABLE IF NOT EXISTS learning_courses (
 slug varchar(120) PRIMARY KEY,
 title varchar(255) NOT NULL,
 is_free boolean NOT NULL DEFAULT true,
 is_published boolean NOT NULL DEFAULT false,
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
INSERT IGNORE INTO learning_courses(slug,title) VALUES('understanding-sma','Understanding SMA: Recognise the Signs and Take the Next Step');
CREATE TABLE IF NOT EXISTS learning_enrolments (
 id varchar(36) PRIMARY KEY, user_id varchar(36) NOT NULL, course_slug varchar(120) NOT NULL,
 active boolean NOT NULL DEFAULT true, enrolled_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY learner_course(user_id,course_slug), INDEX cohort(course_slug,enrolled_at),
 FOREIGN KEY(user_id) REFERENCES account_identity(id) ON DELETE CASCADE,
 FOREIGN KEY(course_slug) REFERENCES learning_courses(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS learning_progress (
 user_id varchar(36) NOT NULL, course_slug varchar(120) NOT NULL, lesson_slug varchar(120) NOT NULL,
 position_seconds int NOT NULL DEFAULT 0, completed_at datetime(3), updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(user_id,course_slug,lesson_slug),
 FOREIGN KEY(user_id) REFERENCES account_identity(id) ON DELETE CASCADE,
 FOREIGN KEY(course_slug) REFERENCES learning_courses(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS learning_attempts (
 id bigint unsigned AUTO_INCREMENT PRIMARY KEY, user_id varchar(36) NOT NULL,
 course_slug varchar(120) NOT NULL, lesson_slug varchar(120) NOT NULL, quiz_version varchar(32) NOT NULL,
 answers_json json NOT NULL, score int NOT NULL, total int NOT NULL, passed boolean NOT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 INDEX learner_lesson(user_id,lesson_slug,id), INDEX course_attempts(course_slug,created_at),
 FOREIGN KEY(user_id) REFERENCES account_identity(id) ON DELETE CASCADE,
 FOREIGN KEY(course_slug) REFERENCES learning_courses(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
