# Pre-operative assessment

Pre-op assessment system that collects patient health data via a structured
questionnaire, computes an ASA (American Society of Anesthesiologists) Physical Status
Classification grade, and identifies safety-critical issues for anaesthetic planning.

## Directory structure

- ./index.md always update this with new information; use Markdown
- ./README.md is a symlink; use Bash(ln -sfn index.md README.md)
- ./AGENTS.md always update this with new information; use Markdown
- ./doc documentation; use Markdown
- ./db database schema; use PostgreSQL with one SQL file per SQL table
- ./front-end-patient-form front-end patient form intake questionnaire;use SvelteKit TypeScript + SVAR
- ./front-end-clinician-dashboard front-end clinician dashboard with sort and filter; use SvelteKit TypeScript + SVAR + SVAR DataGrid
- ./back back-end server application; use Rust Axum Loco

## Details

- Requires a patient-completed questionnaire
- Covering 11 body systems across 16 assessment steps
- To produce an ASA grade (I-VI) using 42 declarative rules
- And identify 20+ safety flags that might affect fitness for surgery

## Documentation using Markdown in folder ./doc

Comprehensive documentation:

- [ASA Grading Rules Reference](doc/asa-grading-rules.md) - 42 rules across 11 body systems
- [Medical Capabilities](doc/medical-capabilities.md) - Clinical assessment scope
- [Risk Factors and Flagged Issues](doc/risk-factors-and-flagged-issues.md) - 20+ safety flags
- [Questionnaire Specification](doc/questionnaire-specification.md) - All 16 steps detailed
- [Technical Architecture](doc/technical-architecture.md) - System design and data flow
- [Backend API Reference](doc/backend-api-reference.md) - REST API documentation
- [Regulatory Compliance](doc/regulatory-compliance.md) - GDPR, HIPAA, medical device classification
- [Clinical Safety Case](doc/clinical-safety-case.md) - Hazard analysis and mitigations
- [Clinical Validation](doc/clinical-validation.md) - Test scenarios and expected outcomes
- [Hospital Deployment](doc/hospital-deployment.md) - Infrastructure and setup guide
- [Administrator Guide](doc/administrator-guide.md) - Configuration and maintenance
- [Patient Information Leaflet](doc/patient-information-leaflet.md) - Plain-language patient guide
- [Documentation Index](doc/index.md) - Navigation guide

Put all the documentation files in ./doc directory.

## Database schema using PostgreSQL in ./db

- PostgreSQL 18 database schema
- UUIDv4 primary key (gen_random_uuid() via pgcrypto)
- One file per database table, numbered 00-22
- CHECK constraints on TEXT columns instead of ENUM types
- Empty string '' for unanswered fields (matches TypeScript convention)
- Auto-updated timestamps via shared trigger function (00-extensions.sql)
- 42 ASA rules seeded in asa_rule table (19_asa_rule.sql)
- Denormalized fired rules for clinical audit trail
- Apply schema: `for f in db/*.sql; do psql -f "$f"; done`
- Comprehensive SQL comments about each table, column, and constraint

Rules:

- Every table has auto-updated created_at/updated_at timestamps
- CHECK constraints on TEXT columns (not ENUM types) for easy evolution
- Empty string '' for unanswered fields, matching TypeScript convention
- Denormalized fired rules preserve exact grading context for clinical audit
- override column allows clinician judgement to differ from computed grade
- override_reason required when asa_grade_override is set
- Unique constraint on (grading_result_id, flag_id) prevents duplicate flags
- Diabetes control/insulin fields constrained to only be set when diabetes is present
- recent_mi_weeks constrained to only be set when recent_mi = 'yes'
- Conditional CHECK constraints enforce dependent field validity (e.g., hypertension_controlled only when hypertension = 'yes')
- Applies to: cardiovascular, respiratory, renal, hepatic, neurological tables

## Front-end for patient using SvelteKit in ./front-end-for-patient

Patient intake questionnaire application:

- SvelteKit with TypeScript
- Svelte 5 runes ($state, $derived, $bindable, $props)
- Tailwind CSS 4 styling
- 16-step patient questionnaire wizard
- ASA grading engine (42 rules, 11 body systems)
- Safety flag detection (20+ alert categories)
- PDF report generation (server-side pdfmake)
- Vitest unit tests
- See ./front-end-for-patient/AGENTS.md for specific instructions

## Front-end for clinician using SvelteKit in ./front-end-for-clinician

Clinician dashboard application:

- SvelteKit with TypeScript
- Svelte 5 runes ($state, $derived, $props)
- Tailwind CSS 4 styling
- SVAR DataGrid (@svar-ui/svelte-grid) for patient list
- Column sorting (click headers, Ctrl+click for multi-sort)
- Text search across NHS number, patient name, procedure
- Dropdown filters for ASA grade, allergy flag, adverse incident flag
- See ./front-end-for-clinician/ for specific instructions

## Back-end application using Rust Axum Loco in ./backend

- Rust edition 2024
- Axum web framework via Loco
- SeaORM for database access
- PostgreSQL 18 with JSONB storage
- REST API for assessment CRUD
- ASA grading engine (42 rules, ported from frontend)
- Safety flag detection
- Text report generation
- CORS configuration for frontend integration
- Input validation on all write endpoints (POST, PUT)
- Pagination capped at 100 per page
- See ./backend/AGENTS.md for backend-specific instructions

## American Society of Anesthesiologists (ASA) Physical Status Classification (PSC)

Purpose:

- Assess a patient's pre-operative health and predict surgical risks
- Standardize patient assessment

Levels:

- ASA I: Normal, healthy patient
- ASA II: Patient with mild systemic disease
- ASA III: Patient with severe systemic disease that is not immediately life-threatening
- ASA IV: Patient with severe, incapacitating systemic disease that is a constant threat to life
- ASA V: A moribund patient not expected to survive without the operation
- ASA VI: A brain-dead patient whose organs are being removed for donor purposes

## Compliance

- [MDCG 2019-11 Rev.1 Guidance on Qualification and Classification of Software in Regulation (EU) 2017/745 – MDR and Regulation (EU) 2017/746 – IVDR](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en)

- [United Kingdom: The Medical Devices Regulations 2002](https://www.legislation.gov.uk/uksi/2002/618/contents)

- [ISO/IEC/IEEE 26514:2022 Systems and software engineering — Design and development of information for users](https://www.iso.org/standard/77451.html)

- [Software and artificial intelligence (AI) as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device)
