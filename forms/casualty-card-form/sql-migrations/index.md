# casualty-card-form — sql-migrations

PostgreSQL migrations for this form. See
`AGENTS/sql-migrations.md` for conventions.

## Canonical files

- `00_extensions.sql` — required extensions (pgcrypto).
- `01_create_function_set_updated_at.sql` — trigger function used by every `updated_at` column.
- `02_create_table_patient.sql` — patient table.
- `03_create_table_clinician.sql` — clinician table.

## Form-specific tables

- `casualty_card`
- `casualty_card_demographics`
- `casualty_card_next_of_kin`
- `casualty_card_gp`
- `casualty_card_arrival_triage`
- `casualty_card_presenting_complaint`
- `casualty_card_pain_assessment`
- `casualty_card_medical_history`
- `casualty_card_medication`
- `casualty_card_allergy`
- `casualty_card_vital_signs`
- `casualty_card_primary_survey`
- `casualty_card_clinical_examination`
- `casualty_card_investigations`
- `casualty_card_treatment`
- `casualty_card_assessment_plan`
- `casualty_card_disposition`
- `casualty_card_safeguarding_consent`
- `news2_result`
- `flagged_issue`

## Derived artefacts

- `schema.sql` — every migration concatenated (generated).
