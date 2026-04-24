# vaccinations-assessment — sql-migrations

PostgreSQL migrations for this form. See
`AGENTS/sql-migrations.md` for conventions.

## Canonical files

- `00_extensions.sql` — required extensions (pgcrypto).
- `01_create_function_set_updated_at.sql` — trigger function used by every `updated_at` column.
- `02_create_table_patient.sql` — patient table.
- `03_create_table_clinician.sql` — clinician table.

## Form-specific tables

- `assessment`
- `immunization_history`
- `childhood_vaccinations`
- `adult_vaccinations`
- `travel_vaccinations`
- `occupational_vaccinations`
- `contraindications_allergies`
- `consent_information`
- `administration_record`
- `clinical_review`
- `fired_rule`
- `additional_flag`
- `grading_result`

## Derived artefacts

- `schema.sql` — every migration concatenated (generated).
