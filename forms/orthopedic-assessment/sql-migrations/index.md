# orthopedic-assessment — sql-migrations

PostgreSQL migrations for this form. See
`AGENTS/sql-migrations.md` for conventions.

## Canonical files

- `00_extensions.sql` — required extensions (pgcrypto).
- `01_create_function_set_updated_at.sql` — trigger function used by every `updated_at` column.
- `02_create_table_patient.sql` — patient table.
- `03_create_table_clinician.sql` — clinician table.

## Form-specific tables

- `assessment`
- `assessment_range_of_motion`
- `assessment_rom_measurement`
- `assessment_strength_testing`
- `assessment_strength_test_item`
- `assessment_imaging_history`
- `assessment_imaging_item`
- `assessment_surgical_history`
- `assessment_surgery_item`
- `grading_result`
- `grading_fired_rule`
- `grading_additional_flag`

## Derived artefacts

- `schema.sql` — every migration concatenated (generated).
