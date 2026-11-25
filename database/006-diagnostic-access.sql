-- Apply to an isolated database first. Intake starts closed; no real records until readiness is approved.
CREATE TABLE IF NOT EXISTS diagnostic_settings (
 id tinyint NOT NULL PRIMARY KEY,
 intake_open boolean NOT NULL DEFAULT 0,
 consultation_fee_kobo bigint unsigned DEFAULT NULL,
 readiness_reference varchar(500) NOT NULL DEFAULT '',
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 CONSTRAINT diagnostic_one_settings CHECK(id=1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
INSERT IGNORE INTO diagnostic_settings(id,consultation_fee_kobo) VALUES(1,2500000);
CREATE TABLE IF NOT EXISTS diagnostic_clinicians (
 id char(36) PRIMARY KEY, user_id varchar(36) NOT NULL UNIQUE,
 full_name varchar(180) NOT NULL, registration_number varchar(80) NOT NULL,
 specialty varchar(180) NOT NULL, workplace varchar(240) NOT NULL,
 state varchar(40) NOT NULL, phone varchar(30) NOT NULL, availability varchar(1000) NOT NULL,
 status varchar(16) NOT NULL DEFAULT 'pending', verification_reference varchar(500) NOT NULL DEFAULT '',
 verified_until date DEFAULT NULL, verified_by varchar(36) DEFAULT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(user_id) REFERENCES account_identity(id),
 CONSTRAINT diagnostic_clinician_status CHECK(status IN ('pending','approved','suspended','declined'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS diagnostic_cases (
 id char(36) PRIMARY KEY, reference varchar(30) NOT NULL UNIQUE,
 user_id varchar(36) NOT NULL, patient_name varchar(180) NOT NULL,
 age_months smallint unsigned NOT NULL, state varchar(40) NOT NULL, lga varchar(100) NOT NULL,
 phone varchar(30) NOT NULL, relationship varchar(20) NOT NULL,
 concerns text NOT NULL, history text NOT NULL, consent_version varchar(30) NOT NULL,
 consented_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 sharing_consent boolean NOT NULL, registry_consent boolean NOT NULL DEFAULT 0,
 status varchar(30) NOT NULL DEFAULT 'reported', clinician_id char(36) DEFAULT NULL,
 fee_kobo bigint unsigned DEFAULT NULL, fee_scope varchar(1500) DEFAULT NULL,
 accepted_at datetime(3) DEFAULT NULL, completed_at datetime(3) DEFAULT NULL,
 clinical_summary text DEFAULT NULL, family_message text DEFAULT NULL,
 outcome varchar(30) DEFAULT NULL, version int unsigned NOT NULL DEFAULT 1,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 INDEX diagnostic_case_owner(user_id,created_at), INDEX diagnostic_case_assigned(clinician_id,status),
 FOREIGN KEY(user_id) REFERENCES account_identity(id), FOREIGN KEY(clinician_id) REFERENCES diagnostic_clinicians(id),
 CONSTRAINT diagnostic_case_status CHECK(status IN ('reported','assigned','assessment','testing_recommended','testing_arranged','completed','withdrawn'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS diagnostic_attachments (
 id char(36) PRIMARY KEY, case_id char(36) NOT NULL, uploaded_by varchar(36) NOT NULL,
 name varchar(180) NOT NULL, mime varchar(80) NOT NULL, size_bytes int unsigned NOT NULL,
 received_bytes int unsigned NOT NULL DEFAULT 0, provider_session text DEFAULT NULL,
 provider_id varchar(180) DEFAULT NULL, status varchar(16) NOT NULL DEFAULT 'uploading',
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(case_id) REFERENCES diagnostic_cases(id),
 CONSTRAINT diagnostic_attachment_status CHECK(status IN ('uploading','quarantined','ready','deleted'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS diagnostic_finance (
 id char(36) PRIMARY KEY, case_id char(36) NOT NULL, kind varchar(20) NOT NULL,
 amount_kobo bigint unsigned NOT NULL, description varchar(500) NOT NULL,
 evidence_reference varchar(500) NOT NULL, created_by varchar(36) NOT NULL,
 approved_by varchar(36) DEFAULT NULL, paid_reference varchar(180) DEFAULT NULL,
 paid_by varchar(36) DEFAULT NULL, status varchar(16) NOT NULL DEFAULT 'proposed',
 donor_allocation varchar(180) NOT NULL, created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(case_id) REFERENCES diagnostic_cases(id),
 CONSTRAINT diagnostic_finance_kind CHECK(kind IN ('consultation','laboratory','transport','other')),
 CONSTRAINT diagnostic_finance_status CHECK(status IN ('proposed','approved','paid')),
 CONSTRAINT diagnostic_independent_approval CHECK(approved_by IS NULL OR approved_by<>created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS diagnostic_audit (
 id bigint unsigned AUTO_INCREMENT PRIMARY KEY,
 actor_id varchar(36) NOT NULL, actor_role varchar(20) NOT NULL,
 action varchar(80) NOT NULL, subject_id varchar(80) NOT NULL,
 details_json text NOT NULL, previous_hash char(64) NOT NULL, event_hash char(64) NOT NULL,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
