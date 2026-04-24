# Medical Forms

Medical forms monorepo for structured clinical assessments, patient intake,
cardiovascular risk calculators, administrative healthcare documents, privacy
notices, and staff training checklists. Each project collects data via a
single-page, step-by-step questionnaire, applies a validated scoring or grading
engine, and generates a clinical report with flagged issues.

## Contents

- 116 form projects, each in `forms/<slug>/`
- PostgreSQL SQL migrations (Liquibase SQL format)
- XML + DTD representations per SQL entity
- FHIR HL7 R5 JSON resources per SQL entity
- Four front-end implementations per form (form and dashboard, each in HTML and SvelteKit)
- Full-stack Rust implementation (axum + Loco + Tera + HTMX + Alpine.js)

For the full list of form projects, see [`forms/AGENTS.md`](forms/AGENTS.md)
or run `bin/list-forms-as-kebab-case`.

## Form categories

| Category                  | Examples                                                                  |
| ------------------------- | ------------------------------------------------------------------------- |
| Risk scores & calculators | Framingham, QRISK3-based heart health check, PREVENT, SCORE2-Diabetes     |
| Specialty assessments     | Cardiology (NYHA/CCS), Oncology (ECOG), Pulmonology (GOLD), Renal (KDIGO) |
| Symptom scales            | PHQ-9, GAD-7, PCL-5, DLQI, PSQI, ESAS-r, SNOT-22, DHI                     |
| Pre-op / peri-op          | Pre-operative assessment (ASA), Anesthesiology, Post-operative report     |
| Safety & safeguarding     | Fall risk, Casualty card (NEWS2), Medical error report, Consent           |
| Administrative            | Patient intake, Medical records release, Hospital discharge, Transfer     |
| Donation & eligibility    | Blood donation (JPAC), Organ donation, Bone marrow, Semaglutide           |
| Occupational & workplace  | Workplace safety (HSE), Workplace stress, Workplace climate, Ergonomics   |
| Training & certification  | CPR training, First aid, EMT psychomotor, Medical language speaking       |
| Privacy & legal           | Care privacy notice, Code of conduct notice, Research privacy notice      |
| WHO referral & emergency  | Acute referral, Counter-referral, Prehospital, Emergency unit forms       |
| UK statutory              | DVLA B1/M1/V1, MAT B1 maternity certificate                               |

## Repository structure

```
.
├── AGENTS.md                       # Cross-cutting agent instructions (this repo)
├── AGENTS/                         # Per-stack agent documentation
│   ├── front-end-with-sveltekit-tailwind-svar.md
│   ├── full-stack-with-rust-axum-loco-htmx-alpine.md
│   ├── sql-migrations.md
│   ├── xml-representations.md
│   └── fhir-r5.md
├── bin/                            # Tools (list-forms-as-kebab-case, create-form, test, etc.)
├── docs/                           # Repo-wide docs (specs, plans)
├── forms/                          # All form projects
│   ├── AGENTS.md                   # Index of all forms
│   └── <slug>/                     # One directory per form (see below)
├── index.md                        # This file
├── plan.md                         # Development plan / roadmap
└── tasks.md                        # Task tracking
```

## Per-form structure

Each form lives in `forms/<slug>/` with a consistent layout:

```
forms/<slug>/
  index.md                                         # Form description + scoring system
  README.md -> index.md                            # Symlink for GitHub rendering
  AGENTS.md                                        # Agent instructions for this form
  CLAUDE.md                                        # Claude Code project instructions
  plan.md                                          # Implementation plan and status
  tasks.md                                         # Task tracking
  doc/                                             # Documentation and references
  sql-migrations/                                  # PostgreSQL Liquibase migrations
  xml-representations/                             # XML + DTD per SQL table entity
  fhir-r5/                                         # FHIR HL7 R5 JSON per SQL entity
  front-end-form-with-html/                        # Patient questionnaire (HTML)
  front-end-form-with-svelte/                      # Patient questionnaire (SvelteKit)
  front-end-dashboard-with-html/                   # Dashboard (HTML)
  front-end-dashboard-with-svelte/                 # Dashboard (SvelteKit)
  full-stack-with-rust-axum-loco-tera-htmx-alpine/ # Full-stack Rust backend
```

## Design patterns

### Form

1. Single-page, step-by-step wizard with `StepNavigation` and `ProgressBar`
2. Pure scoring engine: `types.ts` → `*-rules.ts` → `*-grader.ts` → `flagged-issues.ts`
3. Class-based Svelte 5 reactive store (`assessment.svelte.ts`) — no Svelte stores
4. PDF report generation via SvelteKit server endpoint (`/report/pdf`)
5. Vitest unit tests for grading logic

### Dashboard

- SVAR DataGrid with sortable columns and dropdown filters
- Willow theme wrapper for consistent styling
- Backend API client with sample data fallback
- Row list with computed scores, severities, and safety flags

### Backend

- Loco framework with axum routing (port 5150 in development)
- Rust scoring engine mirrors TypeScript types with `serde(rename_all = "camelCase")`
- SeaORM entities against PostgreSQL 18
- Tera templates with `<body hx-boost="true">` for HTMX-driven navigation

## Technology stacks

See the per-stack agent docs:

- [Front-end with SvelteKit / Tailwind / SVAR](AGENTS/front-end-with-sveltekit-tailwind-svar.md)
- [Full-stack with Rust / axum / Loco / HTMX / Alpine.js](AGENTS/full-stack-with-rust-axum-loco-htmx-alpine.md)
- [SQL migrations](AGENTS/sql-migrations.md)
- [XML representations](AGENTS/xml-representations.md)
- [FHIR HL7 R5 representations](AGENTS/fhir-r5.md)

## Tools

- `bin/list-forms-as-kebab-case` — list all form directory slugs
- `bin/create-form <slug>` — scaffold a new form directory
- `bin/test` — validate structure of all forms
- `bin/test-form <slug>` — validate one form
- `bin/update` — run the update/upgrade/fix/harmonize/audit/test prompt via Claude Code
- `bin/generate-xml-representations.py` — generate XML + DTD from SQL migrations
- `bin/generate-fhir-r5-representations.py` — generate FHIR R5 JSON from SQL migrations

## Compliance

- [MDCG 2019-11 Rev.1 — EU MDR/IVDR Software Classification](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en)
- [UK Medical Devices Regulations 2002](https://www.legislation.gov.uk/uksi/2002/618/contents)
- [ISO/IEC/IEEE 26514:2022 — Design and development of information for users](https://www.iso.org/standard/77451.html)
- [UK MHRA — Software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device)

## Install

### Claude Code (optional)

```claudecode
/plugin marketplace add sveltejs/ai-tools
/plugin install svelte
```

### Claude terminal (optional)

```sh
claude mcp add -t stdio -s project svelte -- npx -y @sveltejs/mcp
```

### Rust full stack

Loco:

```sh
cargo install loco
cargo install sea-orm-cli
```

Create database default role:

```sql
CREATE USER loco PASSWORD 'loco';
CREATE DATABASE pre_operative_assessment_by_clinician_development OWNER loco;
CREATE DATABASE pre_operative_assessment_by_clinician_test OWNER loco;
```

Create languages:

```txt
assets/i18n/de-DE/main.ftl
assets/i18n/en-US/main.ftl
assets/i18n/en-GB/main.ftl
assets/i18n/cy-GB/main.ftl
```

## Verify

```sh
bin/test
```
