# Heart Health Check: SQL Migrations

PostgreSQL schema migrations for the Heart Health Check assessment. 15 files creating a normalised relational schema with UUID primary keys, timestamp tracking, and referential integrity.

@../../../AGENTS/sql-migrations.md

## Migration files

| File                           | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| 00-extensions.sql              | pgcrypto extension, set_updated_at() trigger         |
| 01-patient.sql                 | Patient demographics and contact details             |
| 02-assessment.sql              | Assessment header (status: draft/submitted/reviewed) |
| 03-demographics-ethnicity.sql  | Age, sex, ethnicity, Townsend deprivation            |
| 04-blood-pressure.sql          | Systolic, diastolic, SD, treatment status            |
| 05-cholesterol.sql             | Total cholesterol, HDL, TC/HDL ratio, statin         |
| 06-medical-conditions.sql      | Diabetes, AF, RA, CKD, migraine, SMI, ED, meds       |
| 07-family-history.sql          | CVD under 60, relationship, diabetes history         |
| 08-smoking-alcohol.sql         | Smoking status, quantity, alcohol use                |
| 09-physical-activity-diet.sql  | Activity minutes, intensity, diet quality            |
| 10-body-measurements.sql       | Height, weight, BMI, waist circumference             |
| 11-review-calculate.sql        | Clinician name, date, notes, AUDIT score             |
| 12-grading-result.sql          | Risk category, 10-year risk %, heart age             |
| 13-grading-fired-rule.sql      | Individual fired rules (HHC-001 to HHC-020)          |
| 14-grading-additional-flag.sql | Clinical flags (FLAG-AGE-001, etc.)                  |

## Schema conventions

- UUID primary keys via `gen_random_uuid()` (pgcrypto)
- `created_at` and `updated_at` timestamps on all tables
- `updated_at` maintained by `set_updated_at()` trigger
- Foreign keys cascade on delete
- CHECK constraints for enum values
- Comments on all tables and columns
- One-to-one child tables for each assessment section (03–11)
- One-to-one grading_result per assessment
- One-to-many grading_fired_rule and grading_additional_flag per grading_result

## Status

Implemented.
