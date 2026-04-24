# Outpatient Outcome Report — Design Spec

Date: 2026-04-23
Form slug: `outpatient-outcome-report`
Status: Draft — awaiting user review

## Purpose

A structured outpatient outcome report documenting encounter details, operational efficiency, clinical outcome, patient-reported outcome measures (PROMs), patient-reported experience measures (PREMs), and follow-up plan. Produces a composite letter grade across four domains and a set of flagged issues.

## Scoring engine — Outpatient Outcome Composite Grade (OOCG)

Four independent domain grades roll up to a single overall grade. The overall grade is the worst of the four ("highest severity wins", in the style of Clavien-Dindo).

### Domain grades (A–E)

| Domain | Source instrument(s) | Grade derivation |
|---|---|---|
| Clinical | Clinician-rated outcome classification | A=Resolved · B=Improved · C=Unchanged · D=Worsened · E=Died |
| PROM | EQ-5D-5L (5 dimensions + VAS, before/after) · Global Rating of Change (GRC) 7-point · PROMIS Global Health v1.2 (GPH + GMH T-scores) | Weighted composite: ≥2 instruments improved → A or B (by magnitude); all stable → C; any instrument worsened ≥ 1 level → D; multiple worsened or death-adjacent PROMIS drop → E |
| PREM | Friends and Family Test (NHS) | A=Very Good · B=Good · C=Neither good nor poor · D=Poor · E=Very Poor |
| Operational | NHS Data Dictionary *Attendance Outcome* code + wait-time-to-appointment vs service target + modality | A=attended & wait ≤ target · B=attended & wait ≤ 1.5× target · C=attended & wait > 1.5× target · D=patient cancelled or rebooked · E=DNA or provider-cancelled |

### Overall grade

`overall = max(clinical, prom, prem, operational)` on the A–E ordinal scale.

### Flagged issues

Emitted as rows in `grading_additional_flag`:

- DNA (Did Not Attend) or provider-cancelled appointment
- Any PROM instrument showing ≥ 1-level worsening
- FFT = Poor or Very Poor
- Wait time > service target
- Clinical outcome = Worsened or Died
- Missing PROM or PREM data (data-quality flag)
- Missing NHS Attendance Outcome code (data-quality flag)

### Licensing notes

- **EQ-5D-5L** — © EuroQol Research Foundation. Free for non-commercial/academic use with registration. Item wording in this repo is paraphrased; official wording must be obtained from EuroQol.
- **Friends and Family Test** — NHS England, Open Government Licence v3.0. Free to reuse with attribution.
- **PROMIS Global Health v1.2** — NIH-funded, public domain, free with attribution.
- **NHS Attendance Outcome** — NHS Data Dictionary, Open Government Licence.

Captured in `forms/outpatient-outcome-report/doc/licensing.md`.

## Assessment steps (11 steps, single-page wizard)

| # | Step | Key fields |
|---|---|---|
| 1 | Patient Details | given name, family name, DOB, NHS number, sex |
| 2 | Encounter Details | clinic date, specialty, clinician, modality (in-person / telephone / video), appointment type (new / follow-up / PIFU) |
| 3 | Operational Efficiency | referral date, appointment date, wait-time days, service target days, NHS Attendance Outcome code |
| 4 | Clinical Outcome | presenting complaint, diagnosis confirmed/updated, treatment delivered, outcome classification (Resolved / Improved / Unchanged / Worsened / Died) |
| 5 | PROM — EQ-5D-5L | 5 dimensions (1–5 each) × before + after; VAS 0–100 × before + after |
| 6 | PROM — GRC | 7-point change item (much worse → much better); self-rated health (excellent → poor) |
| 7 | PROM — PROMIS Global Health v1.2 | 10 items → GPH and GMH T-scores (before + after) |
| 8 | PREM — Friends and Family Test | FFT response (Very Good → Very Poor) + free-text comment |
| 9 | Follow-up Plan | disposition (discharge / PIFU / follow-up booked / onward referral); next-appointment date (if any) |
| 10 | Sign-off | reporting clinician name, role, date/time |
| 11 | Review & Submit | read-only summary; derived domain + overall grades + flags; submit action |

Single continuous page — no multi-page navigation. Step navigation via in-page progress bar and next/back buttons (same pattern as sibling forms).

## Data model

PostgreSQL via Liquibase-style numbered migrations. One top-level `assessment` row per report; child `assessment_*` tables one-to-one per step (excluding meta steps 1, 10, 11).

```
sql-migrations/
  00_extensions.sql
  01_create_function_set_updated_at.sql
  02_create_table_patient.sql
  03_create_table_clinician.sql
  04_create_table_assessment.sql               -- status lifecycle (draft/submitted/reviewed/urgent)
  05_create_table_assessment_encounter.sql     -- step 2
  06_create_table_assessment_operational.sql   -- step 3
  07_create_table_assessment_clinical.sql      -- step 4
  08_create_table_assessment_prom_eq5d5l.sql   -- step 5
  09_create_table_assessment_prom_grc.sql      -- step 6
  10_create_table_assessment_prom_promis.sql   -- step 7
  11_create_table_assessment_prem_fft.sql      -- step 8
  12_create_table_assessment_followup.sql      -- step 9
  13_create_table_assessment_signoff.sql       -- step 10
  14_create_table_grading_result.sql           -- overall + per-domain grades
  15_create_table_grading_fired_rule.sql       -- rule trace
  16_create_table_grading_additional_flag.sql  -- per-issue flags
```

Conventions (inherited from repo AGENTS.md):
- UUIDv4 primary keys (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- `created_at` + `updated_at TIMESTAMPTZ` with `set_updated_at()` trigger on every table
- `snake_case` column names
- `COMMENT ON TABLE` + `COMMENT ON COLUMN` for every table and column
- Each `assessment_*` child references `assessment(id) ON DELETE CASCADE`

Generated downstream:
- `schema.sql` — concatenation via `bin/generate-sql-combined.py`
- `schema-flat.sql` — all `assessment_*` children folded into one flat `assessment` via `bin/generate-sql-flat.py`
- `xml-representations/` + DTDs via `bin/generate-xml-representations.py`
- `fhir-r5/` JSON via `bin/generate-fhir-r5-representations.py`
- `cargo-loco-generate/` commands via `bin/generate-cargo-loco-scaffold.py`

## Front-ends

Four front-ends following the sibling-form patterns:

- **`front-end-form-with-html/`** — static HTML + vanilla JS single-page wizard; no build step.
- **`front-end-form-with-svelte/`** — SvelteKit 2 + Svelte 5 runes + Tailwind 4; step components `StepNName.svelte`; pure scoring engine in `src/lib/scoring/`; Vitest tests; PDF export via `/report/pdf` server endpoint.
- **`front-end-dashboard-with-html/`** — static HTML table of submitted reports.
- **`front-end-dashboard-with-svelte/`** — SvelteKit + SVAR DataGrid (Willow theme); sortable, filterable.

Scoring engine file layout (mirrors `post-operative-report`):

```
src/lib/scoring/
  types.ts
  oocg-grader.ts           -- orchestrator
  clinical-domain.ts
  prom-domain.ts           -- EQ-5D-5L + GRC + PROMIS composite
  prem-domain.ts
  operational-domain.ts
  rules.ts
  flagged-issues.ts
  utils.ts
  oocg-grader.test.ts
```

Pure functions, no I/O, fully unit-tested.

## Full-stack Rust backend

`full-stack-with-rust-axum-loco-tera-htmx-alpine/` — Loco.rs + axum + Tera templates + HTMX + Alpine.js, using the flat schema (`schema-flat.sql`) and `serde(rename_all = "camelCase")` on structs shared with the front-end. Scaffold commands generated into `cargo-loco-generate/`.

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR/IVDR software classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
- UK MHRA — Software and AI as a medical device

Captured in `index.md` compliance section.

## Deliverables checklist

- [ ] `index.md` with scoring system, steps table, directory structure, technology, compliance
- [ ] `AGENTS.md`, `CLAUDE.md` (-> AGENTS.md), `plan.md`, `tasks.md`
- [ ] `doc/licensing.md` with EuroQol / FFT / PROMIS / NHS attributions
- [ ] `sql-migrations/` — 17 numbered files + generated `schema.sql` + `schema-flat.sql`
- [ ] `xml-representations/` + DTDs
- [ ] `fhir-r5/` JSON
- [ ] `cargo-loco-generate/` commands
- [ ] `front-end-form-with-html/`
- [ ] `front-end-form-with-svelte/` with Vitest tests for OOCG grader
- [ ] `front-end-dashboard-with-html/`
- [ ] `front-end-dashboard-with-svelte/`
- [ ] `full-stack-with-rust-axum-loco-tera-htmx-alpine/`
- [ ] `bin/test-form outpatient-outcome-report` passes

## Non-goals

- Not a diagnostic instrument; does not replace clinical judgement.
- Not a patient-facing portal; designed for clinician data entry after encounter.
- Does not implement real EuroQol EQ-5D-5L item wording — paraphrased only. Production deployment requires a signed EuroQol licence.
- Does not compute PROMIS T-scores from raw responses using the official item-response-theory calibration tables; uses a documented linear approximation with an explicit note in `doc/licensing.md`. Production use requires the official scoring tables.
- No internationalisation in this iteration (English only).
- No autosave to localStorage in this iteration.
