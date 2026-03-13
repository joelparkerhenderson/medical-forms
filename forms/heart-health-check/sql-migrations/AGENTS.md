# Heart Health Check: SQL Migrations

PostgreSQL schema migrations for the Heart Health Check assessment. 15 files creating a normalised relational schema with UUID primary keys, timestamp tracking, and referential integrity.

@../../../AGENTS/sql-migrations.md

## Migration files

| File                           | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| 00_extensions.sql              | pgcrypto extension, set_updated_at() trigger         |
| 01_patient.sql                 | Patient demographics and contact details             |
| 02_assessment.sql              | Assessment header (status: draft/submitted/reviewed) |
| 03_demographics_ethnicity.sql  | Age, sex, ethnicity, Townsend deprivation            |
| 04_blood_pressure.sql          | Systolic, diastolic, SD, treatment status            |
| 05_cholesterol.sql             | Total cholesterol, HDL, TC/HDL ratio, statin         |
| 06_medical_conditions.sql      | Diabetes, AF, RA, CKD, migraine, SMI, ED, meds       |
| 07_family_history.sql          | CVD under 60, relationship, diabetes history         |
| 08_smoking_alcohol.sql         | Smoking status, quantity, alcohol use                |
| 09_physical_activity_diet.sql  | Activity minutes, intensity, diet quality            |
| 10_body_measurements.sql       | Height, weight, BMI, waist circumference             |
| 11_review_calculate.sql        | Clinician name, date, notes, AUDIT score             |
| 12_grading_result.sql          | Risk category, 10-year risk %, heart age             |
| 13_grading_fired_rule.sql      | Individual fired rules (HHC-001 to HHC-020)          |
| 14_grading_additional_flag.sql | Clinical flags (FLAG-AGE-001, etc.)                  |

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
