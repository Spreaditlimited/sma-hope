CREATE TABLE IF NOT EXISTS diagnostic_public_reports (
 id char(36) NOT NULL PRIMARY KEY,
 user_id varchar(36) NOT NULL,
 fingerprint char(64) NOT NULL,
 report_json text NOT NULL,
 email_confirmed_at datetime(3) DEFAULT NULL,
 case_id char(36) DEFAULT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE diagnostic_public_report_duplicate(user_id,fingerprint),
 FOREIGN KEY(user_id) REFERENCES account_identity(id),
 FOREIGN KEY(case_id) REFERENCES diagnostic_cases(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
