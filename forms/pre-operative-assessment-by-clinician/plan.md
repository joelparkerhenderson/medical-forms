# Plan: Pre-operative Assessment by Clinician

## Current status

Scaffolded 2026-04-21. Design based on the approved spec
`docs/superpowers/specs/2026-04-21-clinician-form-svelte-design.md`, extended
to the full monorepo stack (SQL, FHIR, XML, HTML, SvelteKit, Rust full-stack).

## Why this form exists

A pre-operative assessment must ultimately be *validated by a clinician*. A
patient self-report questionnaire captures symptoms and history but cannot
record auscultation findings, ECG interpretation, laboratory results, or
airway anatomy. This form is the clinician-operated record of objective
findings used to set the ASA grade and the anaesthesia plan. It is the
document that an anaesthetist reviews before signing the WHO Safer Surgery
Checklist on the day of surgery.

## Design principles

- **Objective, clinician-observed data only** — every field is populated
  from examination, investigation, or reconciled medication list rather than
  patient recall.
- **Max-grade composite scoring** — the worst finding sets the risk band;
  safety flags fire independently.
- **Clinician override is first-class** — the computed ASA grade is never
  silently discarded; both computed and final are stored and printed.
- **Single-page wizard** — 16 steps on one continuous page (no multi-page
  forms; monorepo rule).
- **Symmetric with patient self-report** — if a patient-facing sibling form
  exists, its 11-body-system structure is preserved so that side-by-side
  review is possible in the clinician dashboard.
- **Pure scoring engine** — `calculateASA()` is a pure function with no
  side-effects, fully unit-tested with Vitest.
- **FHIR-first exchange** — the canonical interchange format is FHIR R5
  Bundle; XML is an archival fallback.

## Scoring engine

The composite grader runs four validated instruments in parallel and combines
their outputs into a single perioperative risk category.

- **ASA Physical Status (I–VI)** captures overall systemic disease burden and
  is the primary output. Rules fire on objective findings (e.g. echo EF,
  eGFR, HbA1c) rather than self-reported symptoms.
- **Mallampati class (I–IV)** augmented with thyromental distance, mouth
  opening, inter-incisor gap, neck range of motion, and dentition predicts
  difficult airway.
- **Revised Cardiac Risk Index (RCRI, 0–6)** sums six cardiac predictors —
  high-risk surgery, history of IHD, history of CHF, history of stroke / TIA,
  insulin-requiring diabetes, creatinine > 177 µmol/L — to estimate major
  cardiac complications.
- **STOP-BANG (0–8)** screens for obstructive sleep apnoea.
- **Clinical Frailty Scale (1–9)** classifies frailty in patients aged ≥ 65.

The composite rule promotes any single high-band finding to the overall
category and reports the *drivers* so the anaesthetist can target
pre-optimisation (anticoagulant bridging, difficult-airway trolley, iron
infusion for anaemia, insulin sliding scale for uncontrolled diabetes).

## Build order

1. [x] Scaffold directory via `bin/create-form`.
2. [x] Write top-level documentation: `index.md`, `AGENTS.md`, `plan.md`,
       `tasks.md`, `doc/*.md`.
3. [x] Author SQL Liquibase migrations for patient, assessment, 11 body
       systems, medication, allergy, surgery plan, functional capacity,
       grading result, fired rules, additional flags.
4. [x] Generate XML + DTD representations with
       `bin/generate-xml-representations.py`.
5. [x] Generate FHIR HL7 R5 JSON with
       `bin/generate-fhir-r5-representations.py`.
6. [x] Build SvelteKit patient-form (single-page clinician wizard).
7. [x] Build HTML patient-form (static single-page, Alpine.js).
8. [x] Build clinician-dashboard SvelteKit (SVAR DataGrid).
9. [x] Build clinician-dashboard HTML (static review table).
10. [x] Build Rust full-stack with axum/Loco/Tera/HTMX/Alpine.
11. [x] Unit-test composite grader (Vitest).
12. [x] Run `bin/test-form pre-operative-assessment-by-clinician`.

## Future enhancements

- Zod runtime validation on the SvelteKit client.
- Axe-core accessibility audit.
- End-to-end tests with Playwright.
- LocalStorage autosave with draft-recovery.
- Bilingual (English / Cymraeg) UI in line with NHS Wales.
- Integration with NHS Digital Personal Demographics Service (PDS) for NHS
  number validation.
- Clinical safety case (DCB0129 / DCB0160) documentation.
- User acceptance testing with an anaesthetic pre-assessment team.
- Audit log of every clinician override.
- Electronic signature captured as SVG path plus trust-provided SSO claim.
