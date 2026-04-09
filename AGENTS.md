# Medical Forms

Medical forms monorepo for structured clinical assessments, patient intake,
cardiovascular risk calculators, and administrative healthcare documents.
Each form collects patient data via a step-by-step questionnaire, applies a
validated scoring or grading engine, and generates a clinical report with
flagged issues.

## Tools

- `bin/list-forms` — list all form directory names
- `bin/test` — run all form validation tests
- `bin/test-form <slug>` — test a single form by slug
- `bin/create-form` — scaffold a new form directory
- `bin/update` — update, upgrade, fix, harmonize, audit, test
- `bin/generate-xml-representations.py` — generate XML and DTD from SQL migrations
- `bin/generate-fhir-r5-representations.py` — generate FHIR HL7 R5 JSON from SQL migrations

## Form directory structure

Each form lives in `forms/<slug>/` with a consistent layout:

```
forms/<slug>/
  index.md                                         # Form description and scoring details
  README.md -> index.md                            # Symlink for GitHub rendering
  AGENTS.md                                        # Agent instructions for this form
  CLAUDE.md                                        # Claude Code project instructions
  plan.md                                          # Implementation plan and status
  tasks.md                                         # Task tracking
  doc/                                             # Documentation and references
  sql-migrations/                                  # PostgreSQL schema migrations
  xml-representations/                             # XML and DTD per SQL table entity
  fhir-r5/                                         # FHIR HL7 R5 JSON per SQL table entity
  front-end-patient-form-with-html/                # Patient questionnaire (HTML)
  front-end-patient-form-with-svelte/              # Patient questionnaire (SvelteKit)
  front-end-clinician-dashboard-with-html/         # Clinician dashboard (HTML + table)
  front-end-clinician-dashboard-with-svelte/       # Clinician dashboard (SvelteKit + SVAR Grid)
  full-stack-with-rust-axum-loco-tera-htmx-alpine/ # Full-stack Rust backend
```

## Technology stacks

See AGENTS subdirectory files for per-stack details:

- [Front-end with SvelteKit Tailwind SVAR](AGENTS/front-end-with-sveltekit-tailwind-svar.md)
- [Full-stack with Rust axum Loco HTMX Alpine](AGENTS/full-stack-with-rust-axum-loco-htmx-alpine.md)
- [SQL migrations](AGENTS/sql-migrations.md)
- [XML representations](AGENTS/xml-representations.md)
- [FHIR HL7 R5 representations](AGENTS/fhir-api.md)

## Compliance

- [MDCG 2019-11 Rev.1 — EU MDR/IVDR Software Classification](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en)
- [UK Medical Devices Regulations 2002](https://www.legislation.gov.uk/uksi/2002/618/contents)
- [ISO/IEC/IEEE 26514:2022 — Design and development of information for users](https://www.iso.org/standard/77451.html)
- [UK MHRA — Software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device)

## Verify

Run `bin/test`
