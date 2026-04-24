# Outpatient Outcome Report

Structured outpatient outcome report covering clinical outcome, PROMs, PREMs, and operational efficiency, with a four-domain composite grade (OOCG).

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./doc/ - Reference material and licensing
- ./sql-migrations/ - PostgreSQL migrations
- ./xml-representations/ - XML + DTD per table
- ./fhir-r5/ - FHIR HL7 R5 JSON per table
- ./cargo-loco-generate/ - Loco scaffold shell scripts
- ./front-end-form-with-html/ - Static HTML wizard
- ./front-end-form-with-svelte/ - SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-html/ - Static HTML dashboard
- ./front-end-dashboard-with-svelte/ - SvelteKit + SVAR DataGrid dashboard
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Rust backend

## Scoring system

- **Instrument**: Outpatient Outcome Composite Grade (OOCG)
- **Domains**: Clinical, PROM, PREM, Operational (each A–E; overall = worst)
- **PROM sub-instruments**: EQ-5D-5L, Global Rating of Change (GRC), PROMIS Global Health v1.2
- **PREM sub-instrument**: Friends and Family Test (FFT)
- **Operational sub-instruments**: NHS Attendance Outcome code, wait-time vs target, modality

## Assessment steps (11 total)

1. Patient Details
2. Encounter Details
3. Operational Efficiency
4. Clinical Outcome
5. PROM — EQ-5D-5L
6. PROM — Global Rating of Change
7. PROM — PROMIS Global Health v1.2
8. PREM — Friends and Family Test
9. Follow-up Plan
10. Sign-off
11. Review & Submit

## Conventions

Follow the root `AGENTS.md` conventions: UUIDv4 keys, `created_at`/`updated_at`, camelCase in TS, snake_case in SQL/Rust, empty string for unanswered text, `null` for unanswered numeric.

## Compliance

- MDCG 2019-11 Rev.1
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
- UK MHRA — Software and AI as a medical device
