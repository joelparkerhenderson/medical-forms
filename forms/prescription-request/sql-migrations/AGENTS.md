# SQL Migrations for Prescription Request

PostgreSQL 18 with Liquibase SQL format.

## Tables

- 00-extensions.sql — pgcrypto extension
- 01-patient.sql — Patient demographics
- 02-clinician.sql — Clinician demographics
- 03-prescription-request.sql — Top-level request linking patient, clinician
- 04-prescription-details.sql — Medication, dosage, instructions
- 05-prescription-substitution-options.sql — Substitution preferences
- 06-prescription-request-type.sql — New/refill, emergency/normal flags
- 07-grading-result.sql — Priority classification result
- 08-grading-fired-rule.sql — Rules that fired
- 09-grading-additional-flag.sql — Additional flags
