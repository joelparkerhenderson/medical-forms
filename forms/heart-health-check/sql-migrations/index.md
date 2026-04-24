# heart-health-check — sql-migrations

PostgreSQL migrations for this form. See
`AGENTS/sql-migrations.md` for conventions.

## Canonical files

- `00_extensions.sql` — required extensions (pgcrypto).
- `01_create_function_set_updated_at.sql` — trigger function used by every `updated_at` column.
- `02_create_table_patient.sql` — patient table.
- `03_create_table_clinician.sql` — clinician table.

## Form-specific tables

- `assessment`
- `demographics_ethnicity`
- `blood_pressure`
- `cholesterol`
- `medical_conditions`
- `family_history`
- `smoking_alcohol`
- `physical_activity_diet`
- `body_measurements`
- `review_calculate`
- `grading_result`
- `grading_fired_rule`
- `grading_additional_flag`

## Derived artefacts

- `schema.sql` — every migration concatenated (generated).
