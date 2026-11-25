-- Apply once after migrations 006-008. Existing paid agreements remain unchanged.
ALTER TABLE diagnostic_clinicians
 ADD COLUMN default_remuneration varchar(12) NOT NULL DEFAULT 'paid',
 ADD CONSTRAINT diagnostic_default_remuneration CHECK(default_remuneration IN ('paid','donated'));
ALTER TABLE diagnostic_cases
 ADD COLUMN offered_fee_kobo bigint unsigned DEFAULT NULL,
 ADD COLUMN remuneration varchar(12) NOT NULL DEFAULT 'paid',
 ADD CONSTRAINT diagnostic_case_remuneration CHECK(remuneration IN ('paid','donated')),
 ADD CONSTRAINT diagnostic_donated_fee CHECK(remuneration<>'donated' OR (fee_kobo IS NOT NULL AND fee_kobo=0));
UPDATE diagnostic_cases SET offered_fee_kobo=fee_kobo WHERE clinician_id IS NOT NULL;
