# Care Privacy Notice — Design Spec

## Overview

A 3-step read-and-acknowledge privacy notice form based on the BMA GDPR template for GP practices. Practice staff configure their details, patients read the rendered privacy notice, confirm understanding via checkbox, type their full name and today's date. The clinician dashboard lists all completed acknowledgments.

## Source

- BMA template: <https://www.bma.org.uk/advice-and-support/ethics/confidentiality-and-health-records/gdpr-privacy-notices-for-gp-practices>
- Seed file: `forms/care-privacy-notice/seed.md`

## Patient Form — 3 Steps

### Step 1: Practice Configuration

Admin/staff enters practice-specific values that populate placeholders in the notice text.

| Field | Type | Required |
|-------|------|----------|
| Practice name | text | yes |
| Practice address | text | yes |
| DPO name | text | yes |
| DPO contact details | text | yes |
| Research organisations | text | no |
| Data sharing partners | text | no |

### Step 2: Privacy Notice

Renders the full BMA template text (from seed.md) with practice details interpolated into `[Insert ...]` placeholders. Read-only prose. Patient scrolls through to read. Sections covered:

1. How information is used for medical research, service planning, and quality of care
2. Medical research and service planning
3. Checking the quality of care — national clinical audits
4. Data Controller and DPO contact details
5. Purpose of processing
6. Lawful basis (UK GDPR Articles 6(1)(e), 9(2)(a)/(j), 9(2)(h))
7. Recipients of processed data
8. Right to object and National Data Opt-out
9. Right of access and right to correct
10. Right to restriction of processing
11. Retention period
12. Right to complain (ICO)

### Step 3: Acknowledgment & Signature

| Field | Type | Required |
|-------|------|----------|
| "I have read, understand, and agree to the above privacy notice" | checkbox | yes |
| Full name (typed by patient) | text | yes |
| Today's date (typed by patient) | date | yes |

## Grading Engine

No clinical scoring. Simple completeness check:

- **Complete** — checkbox checked, name provided, date provided
- **Incomplete** — any of the above missing

Flagged issues: `acknowledgment-not-checked`, `name-blank`, `date-blank`.

## SQL Schema

| Migration | Table | Purpose |
|-----------|-------|---------|
| 00-extensions | — | pgcrypto |
| 01-patient | patient | first_name, last_name, dob, nhs_number, sex |
| 02-assessment | assessment | Links patient_id, status (draft/submitted/reviewed) |
| 03-practice-configuration | practice_configuration | practice_name, practice_address, dpo_name, dpo_contact_details, research_organisations, data_sharing_partners |
| 04-acknowledgment | acknowledgment | agreed (boolean), patient_typed_full_name (varchar), patient_typed_date (date), acknowledged_at (timestamptz) |
| 05-grading-result | grading_result | overall_status (complete/incomplete), completeness_score, flagged_issues_count |
| 06-grading-fired-rule | grading_fired_rule | rule_code, rule_name, severity, message |

## Clinician Dashboard

### Columns

| Column | Source |
|--------|--------|
| Patient Name | patient.first_name + patient.last_name |
| NHS Number | patient.nhs_number |
| Date Acknowledged | acknowledgment.patient_typed_date |
| Status | grading_result.overall_status |
| Practice Name | practice_configuration.practice_name |

### Features

- Sortable columns (click header to toggle ascending/descending)
- Text search (name, NHS number)
- Status dropdown filter (all/complete/incomplete)
- Patient count footer

## Technology

Same stacks as all other forms:
- SvelteKit 2.x + Svelte 5 + Tailwind 4 (patient form & dashboard)
- SVAR DataGrid + Willow theme (dashboard)
- HTML/CSS/JS fallbacks (patient form & dashboard)
- SQL migrations (PostgreSQL)
- XML representations (generated)
- FHIR R5 JSON (generated)
- Rust full-stack (axum, Loco, Tera, HTMX, Alpine.js)

## Deliverables

All standard form directory artifacts:
- `index.md`, `README.md` (symlink), `AGENTS.md`, `CLAUDE.md`, `plan.md`, `tasks.md`
- `doc/` — reference documentation
- `sql-migrations/` — PostgreSQL schema
- `xml-representations/` — generated from SQL
- `fhir-r5/` — generated from SQL
- `front-end-patient-form-with-html/`
- `front-end-patient-form-with-svelte/`
- `front-end-clinician-dashboard-with-html/`
- `front-end-clinician-dashboard-with-svelte/`
- `full-stack-with-rust-axum-loco-tera-htmx-alpine/`
