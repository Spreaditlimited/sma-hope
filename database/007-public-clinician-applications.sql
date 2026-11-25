-- Public applications remain unverified until the email owner sets their password.
CREATE TABLE IF NOT EXISTS diagnostic_public_applications (
 id char(36) NOT NULL PRIMARY KEY,
 user_id varchar(36) NOT NULL UNIQUE,
 profile_json text NOT NULL,
 claimed_at datetime(3) DEFAULT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(user_id) REFERENCES account_identity(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
