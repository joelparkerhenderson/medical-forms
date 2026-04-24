# encounter-satisfaction — sql-migrations

PostgreSQL migrations for this form. See
`AGENTS/sql-migrations.md` for conventions.

## Canonical files

- `00_extensions.sql` — required extensions (pgcrypto).
- `01_create_function_set_updated_at.sql` — trigger function used by every `updated_at` column.
- `02_create_table_patient.sql` — patient table.
- `03_create_table_clinician.sql` — clinician table.

## Form-specific tables

- `encounter_satisfaction`
- `visit_information`
- `access_scheduling`
- `communication`
- `staff_professionalism`
- `care_quality`
- `environment`
- `overall_satisfaction`
- `satisfaction_result`
- `flagged_issue`

## Derived artefacts

- `schema.sql` — every migration concatenated (generated).
