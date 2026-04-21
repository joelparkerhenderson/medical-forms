# Psychology Assessment

Self-report psychological screening using the DASS-21 (Depression Anxiety
Stress Scales — 21 item) instrument. Computes severity categories per
subscale and raises safety flags on risk-screen items for clinician review.

## Directory structure

- `./index.md` — project overview and documentation
- `./AGENTS.md` — this file (referenced by `CLAUDE.md`)
- `./plan.md` — development roadmap
- `./tasks.md` — task tracking
- `./doc/` — clinical reference documentation (DASS-21 scoring, risk policy)
- `./sql-migrations/` — Liquibase-formatted Postgres schema
- `./xml-representations/` — generated XML + DTD per SQL table
- `./fhir-r5/` — generated FHIR HL7 R5 JSON per SQL entity
- `./front-end-form-with-html/` — static single-page patient wizard
- `./front-end-form-with-svelte/` — SvelteKit single-page patient wizard
- `./front-end-dashboard-with-html/` — HTML review table
- `./front-end-dashboard-with-svelte/` — SvelteKit SVAR DataGrid review
- `./full-stack-with-rust-axum-loco-tera-htmx-alpine/` — Rust backend with
  server-rendered HTMX UI

## Scoring system

- **Instrument**: DASS-21 (Depression Anxiety Stress Scales — 21 item).
- **Subscales**: Depression, Anxiety, Stress; 7 items each.
- **Item scale**: 0–3 Likert (did not apply → applied very much).
- **Raw range**: 0–21 per subscale, doubled to match DASS-42 reference norms.
- **Categories**: Normal, Mild, Moderate, Severe, Extremely Severe.

## Engine files

- `types.ts`, `utils.ts`
- `dass21-rules.ts` — per-item scoring, subscale totalling, doubling
- `dass21-grader.ts` — assigns severity category per subscale
- `flagged-issues.ts` — risk escalation (suicidal ideation, severe+)
- Tests: `dass21-grader.test.ts`

## Safety flags

- **Suicidal ideation** — risk-screen item positive → urgent clinician review.
- **Extremely severe depression/anxiety/stress** — subscale in top category.
- **Functional impairment** — self-reported inability to perform daily roles.

## Conventions

- Empty string `''` for unanswered text / enum fields.
- `null` for unanswered numeric fields.
- camelCase property names in TypeScript.
- snake_case in SQL and Rust.
- Step components named `StepNName.svelte` (1-indexed).
- UI components in `src/lib/components/ui/`.
- `serde(rename_all = "camelCase")` on Rust structs shared with the front-end.
- UUIDv4 primary keys; `created_at` + `updated_at` timestamps on every table.

## Clinical grounding

- Lovibond, S.H. & Lovibond, P.F. (1995) *Manual for the Depression Anxiety
  Stress Scales*. Psychology Foundation of Australia.
- DASS-21 is a public-domain instrument suitable for routine screening.

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification).
- UK Medical Devices Regulations 2002.
- ISO/IEC/IEEE 26514:2022.
- UK MHRA Software and AI as a Medical Device.

## Verify

```sh
bin/test-form psychology-assessment
```
