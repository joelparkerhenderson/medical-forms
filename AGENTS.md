# Medical Forms

Medical forms monorepo for structured clinical assessments, patient intake,
cardiovascular risk calculators, administrative healthcare documents, privacy
notices, and staff training checklists. Each form collects data via a
single-page, step-by-step questionnaire, applies a validated scoring or grading
engine, and generates a clinical report with flagged issues.

## Tools

- `bin/list-forms-as-kebab-case` — list all form directory slugs
- `bin/test` — run all form validation tests
- `bin/test-form <slug>` — test a single form by slug
- `bin/create-form <slug>` — scaffold a new form directory
- `bin/update` — update, upgrade, fix, harmonize, audit, test (via Claude Code)
- `bin/migrate-sql-filenames.py` — one-shot migration of each form's sql-migrations/ to the canonical `NN_create_table_<name>.sql` layout
- `bin/generate-sql-comments.py` — append missing `COMMENT ON TABLE` / `COMMENT ON COLUMN` to numbered SQL migrations
- `bin/generate-sql-combined.py` — combine each form's numbered SQL migrations into `schema.sql`
- `bin/generate-xml-representations.py` — generate XML and DTD from SQL migrations
- `bin/generate-fhir-r5-representations.py` — generate FHIR HL7 R5 JSON from SQL migrations
- `bin/generate-cargo-loco-scaffold.py` — generate Loco scaffold commands from SQL migrations (assessment_* children are merged into the assessment scaffold)

## Form index

See [`forms/AGENTS.md`](forms/AGENTS.md) for the alphabetical index of every
form project.

## Form directory structure

Each form lives in `forms/<slug>/` with a consistent layout (the scaffolding
is created by `bin/create-form`):

```
forms/<slug>/
  index.md                                         # Form description and scoring details
  README.md -> index.md                            # Symlink for GitHub rendering
  AGENTS.md                                        # Agent instructions for this form
  CLAUDE.md                                        # Claude Code project instructions
  plan.md                                          # Implementation plan and status
  tasks.md                                         # Task tracking
  doc/                                             # Documentation and references
  sql-migrations/                                  # PostgreSQL Liquibase migrations
  xml-representations/                             # XML + DTD per SQL table entity
  fhir-r5/                                         # FHIR HL7 R5 JSON per SQL entity
  front-end-form-with-html/                        # Questionnaire (HTML)
  front-end-form-with-svelte/                      # Questionnaire (SvelteKit)
  front-end-dashboard-with-html/                   # Dashboard (HTML + table)
  front-end-dashboard-with-svelte/                 # Dashboard (SvelteKit + SVAR Grid)
  full-stack-with-rust-axum-loco-tera-htmx-alpine/ # Full-stack Rust backend
  cargo-loco-generate/                             # Commands for loco.rs to create
```

Generated FHIR HL7 R5 JSON resources live in `fhir-r5/`.

## Standard workflow for a new form

1. `bin/create-form <slug>` — scaffold the directory
2. Fill in `forms/<slug>/index.md`, `AGENTS.md`, `plan.md`, `tasks.md` with the design spec
3. Author SQL migrations in `forms/<slug>/sql-migrations/`
4. Generate XML + DTD representations (`bin/generate-xml-representations.py`)
5. Generate FHIR R5 JSON (`bin/generate-fhir-r5-representations.py`)
6. Generate Loco scaffold commands (`bin/generate-cargo-loco-scaffold.py`)
7. Build the front-ends (form and dashboard, each in HTML and SvelteKit)
8. Build the full-stack Rust implementation
9. `bin/test-form <slug>` — validate structure

## User interface

IMPORTANT: the form must be one continuous single-page wizard. No
multi-page forms.

## Technology stacks

See the per-stack agent docs:

- [Front-end with SvelteKit / Tailwind / SVAR](AGENTS/front-end-with-sveltekit-tailwind-svar.md)
- [Full-stack with Rust / axum / Loco / HTMX / Alpine.js](AGENTS/full-stack-with-rust-axum-loco-htmx-alpine.md)
- [SQL migrations](AGENTS/sql-migrations.md)
- [XML representations](AGENTS/xml-representations.md)
- [FHIR HL7 R5 representations](AGENTS/fhir-r5.md)
- [cargo loco generate scaffold](AGENTS/cargo-loco-generate-scaffold.md)

## Conventions

- Empty string `''` for unanswered text fields; `null` for unanswered numeric fields
- camelCase property names in TypeScript; snake_case in SQL and Rust
- Step components named `StepNName.svelte` (1-indexed)
- UI components in `src/lib/components/ui/`
- `serde(rename_all = "camelCase")` on Rust structs shared with the front-end
- UUIDv4 primary keys; `created_at` + `updated_at` timestamps on every table

## Compliance

- [MDCG 2019-11 Rev.1 — EU MDR/IVDR Software Classification](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en)
- [UK Medical Devices Regulations 2002](https://www.legislation.gov.uk/uksi/2002/618/contents)
- [ISO/IEC/IEEE 26514:2022 — Design and development of information for users](https://www.iso.org/standard/77451.html)
- [UK MHRA — Software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device)

## Verify

```sh
bin/test
```
