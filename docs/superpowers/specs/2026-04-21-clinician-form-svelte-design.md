# Pre-op assessment: front-end clinician form (SvelteKit) — Design

**Date:** 2026-04-21
**Subproject:** `forms/pre-operative-assessment-by-clinician/front-end-clinician-form-with-svelte/`
**Status:** Approved design — ready for implementation plan

## Purpose

A SvelteKit TypeScript application that lets a clinician complete an independent
pre-operative assessment of a patient, using clinician-observed objective data
(exam findings, vitals, labs, imaging). The form computes its own ASA grade and
safety flags, and generates a clinician-signed PDF report.

This subproject is **independent** of the patient self-report form. The two
forms are symmetric siblings in the monorepo; correlation between them (e.g.
side-by-side comparison) belongs in the clinician dashboard, not here.

## Scope

- **In scope:** 16-step clinician wizard, independent ASA engine operating on
  clinician-observed data, PDF report generation, unit tests for the engine.
- **Out of scope:** Backend persistence (no POST to Rust Axum Loco backend, no
  new SQL migrations), authentication, inter-form correlation with the patient
  self-report, multi-clinician review workflows.

## Architecture

### Stack

- SvelteKit + TypeScript
- Svelte 5 runes (`$state`, `$derived`, `$bindable`, `$props`)
- Tailwind CSS 4
- `pdfmake` (server-side PDF generation)
- Vitest (unit tests for the ASA engine)

### Pattern

Mirrors `front-end-form-with-svelte/` exactly. Symmetric subprojects
keep the monorepo predictable: the same file layout, the same engine shape,
the same report pipeline, so a contributor who knows one knows both.

### Directory structure

```
src/
├── app.css                              # Tailwind CSS entry + custom theme
├── app.html                             # HTML shell
├── app.d.ts                             # App-level type declarations
├── params/
│   └── step.ts                          # Route param matcher (1-16)
├── lib/
│   ├── engine/
│   │   ├── types.ts                     # ClinicianAssessment + sub-types
│   │   ├── utils.ts                     # BMI, METs, age helpers
│   │   ├── asa-rules.ts                 # ASA rules on clinician-observed data
│   │   ├── asa-grader.ts                # calculateASA() pure function
│   │   ├── flagged-issues.ts            # detectAdditionalFlags()
│   │   └── asa-grader.test.ts           # Vitest unit tests
│   ├── config/
│   │   └── steps.ts                     # 16-step wizard definitions
│   ├── stores/
│   │   └── assessment.svelte.ts         # $state reactive store
│   ├── components/
│   │   ├── ui/                          # Reusable form components
│   │   └── steps/                       # Step1*.svelte … Step16*.svelte
│   └── report/
│       └── pdf-builder.ts               # pdfmake document builder
└── routes/
    ├── +layout.svelte                   # Root layout
    ├── +page.svelte                     # Landing page
    ├── assessment/
    │   ├── +layout.svelte               # Assessment layout + progress bar
    │   └── [step=step]/+page.svelte     # Dynamic step renderer
    └── report/
        ├── +page.svelte                 # Report preview
        └── pdf/+server.ts               # PDF generation endpoint
```

## 16-step wizard

Mapped to the 11 body systems of the pre-op assessment project plus clinician-
specific administrative and planning steps. Each step collects **objective**
clinician findings — not patient self-report.

| # | Step | Key fields |
|---|------|------------|
| 1 | Clinician identification | Clinician name, role, licence/registration number, assessment date/time |
| 2 | Patient identification | NHS number, patient name, DOB, weight, height, planned procedure, surgical urgency (elective / urgent / emergency) |
| 3 | Vitals & anthropometrics | BP, HR, SpO₂, RR, temperature, BMI (auto-computed from weight/height) |
| 4 | Airway assessment | Mallampati I–IV, thyromental distance, mouth opening (cm), neck ROM, dentition condition, loose teeth, beard, cervical spine mobility |
| 5 | Cardiovascular | Auscultation (rhythm, murmurs), peripheral pulses, JVP, ECG review (rate, rhythm, axis, ischaemic changes), echo EF% if available |
| 6 | Respiratory | Auscultation (wheeze, crackles), chest wall, CXR findings, PFT FEV1/FVC if available |
| 7 | Neurological | GCS, cognitive status, cranial nerves summary, motor, sensory, reflexes |
| 8 | Renal & hepatic | Creatinine, eGFR, urea, bilirubin, ALT, AST, albumin |
| 9 | Haematology & coagulation | Hb, platelets, INR, APTT, group & save / crossmatch status |
| 10 | Endocrine | Fasting glucose, HbA1c, thyroid status (TSH if indicated) |
| 11 | Gastrointestinal | Abdominal exam, reflux assessment, fasting status confirmation |
| 12 | Musculoskeletal & integumentary | Spine for neuraxial, joint ROM for positioning, skin at IV / regional block sites |
| 13 | Medications & allergies | Clinician-reconciled medication list, anticoagulant hold status, confirmed allergies with reactions |
| 14 | Functional capacity | METs estimate, Clinical Frailty Scale, exercise-tolerance notes |
| 15 | Anesthesia plan | Proposed technique (GA / regional / sedation / MAC), airway plan, monitoring level, post-op disposition (ward / HDU / ICU) |
| 16 | Summary & ASA | Computed ASA grade + fired rules, safety flags, optional clinician override + reason, additional notes, sign-off |

## ASA grading engine

### Shape

Same engine signature as the patient form:

```ts
calculateASA(data: ClinicianAssessment): {
  asaGrade: 1 | 2 | 3 | 4 | 5 | 6;
  firedRules: FiredRule[];
}
```

- Max-grade algorithm: the worst comorbidity sets the grade.
- ASA I is the default when no rules fire.
- Each rule has a unique ID for audit trail.

### Rule adaptation

The 42-rule structure is preserved, but each rule's predicate fires on
objective clinician data rather than patient self-report. Examples:

| Patient-form rule | Clinician-form rule |
|---|---|
| Patient reports angina symptoms | Active angina noted or ECG shows ischaemic changes |
| Patient reports asthma, controlled | Chest clear, FEV1/FVC ≥ 70 %, no rescue-inhaler use on review |
| Patient reports diabetes | HbA1c > 7 % or fasting glucose > 10 mmol/L |

### Clinician-only rules

New rules exist that have no patient-form analogue, because they depend on
clinician observation:

- **Airway flag** — Mallampati ≥ III → difficult-airway flag.
- **Cardiac flag** — echo EF < 40 % → severe cardiac flag.
- **Coagulopathy flag** — INR > 1.5 off anticoagulants → bleeding-risk flag.

### Override

The ASA engine produces a computed grade. The clinician may override on step 16
with a reason; both the computed and final grades are stored in state and
rendered in the PDF report.

## Safety flags

Independent of ASA grade. 20+ flag categories, including the three new
clinician-only flags above (difficult airway, severe cardiac, coagulopathy).
Flags have priority levels (high / medium / low) as in the patient form.

## Report generation

- `/report` route renders an HTML preview.
- `/report/pdf` server endpoint returns a PDF generated by `pdfmake`, including:
  - Clinician identification (name, licence, date/time, signature line)
  - Patient identification
  - All 11 body-system findings
  - Computed ASA grade, fired rules, safety flags
  - Override grade + reason (if set)
  - Anesthesia plan
- Same pipeline as the patient form — only the document template changes.

## Testing

- Vitest unit tests in `src/lib/engine/asa-grader.test.ts`.
- Coverage: ASA I–IV grading, rule-ID uniqueness, safety-flag detection,
  clinician-only rules (Mallampati ≥ III, EF < 40 %, INR > 1.5).
- Run with `npx vitest run`.

## Conventions

- camelCase property names in TypeScript.
- Empty string `''` for unanswered text fields; `null` for unanswered numeric
  fields (matching project convention).
- Step components named `StepNName.svelte` (1-indexed).
- UI components in `src/lib/components/ui/`.
- Imports use the `$lib` path alias.

## Non-goals (explicit)

- No backend persistence in this subproject.
- No authentication or multi-user workflow.
- No coupling to the patient self-report form or its data.
- No new SQL migrations, no new FHIR resources, no new XML representations.
- No mobile-specific layout beyond Tailwind's responsive defaults.
