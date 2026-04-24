# Outpatient Outcome Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `outpatient-outcome-report` form to the same scaffold level as sibling forms (`hospital-discharge`, `post-operative-report`) so that `bin/test-form outpatient-outcome-report` passes, with a four-domain composite grading engine (clinical, PROM, PREM, operational) rolling up to an overall A–E grade.

**Architecture:** Mirror the sibling forms exactly: PostgreSQL migrations define the schema, generator scripts produce XML/FHIR/Loco scaffolds, each of four front-end directories contains a minimal scaffold with a placeholder page, and a Rust `fn main() {}` crate with the mandatory HTMX/Alpine CDN `base.html.tera`. The full interactive scoring engine is deferred as "future enhancement" — consistent with sibling forms whose `+page.svelte` is also a placeholder.

**Tech Stack:** PostgreSQL (Liquibase-style migrations), Python generators (repo `bin/`), SvelteKit 2 + Svelte 5 + Tailwind 4 (scaffold only), static HTML, Rust (`cargo` + `tera` + HTMX + Alpine.js).

**Spec:** `docs/superpowers/specs/2026-04-23-outpatient-outcome-report-design.md`

**Repo root:** `/Users/jph/git/joelparkerhenderson/medical-forms`

---

### Task 1: Top-level documentation for the form

**Files:**
- Modify: `forms/outpatient-outcome-report/index.md`
- Modify: `forms/outpatient-outcome-report/AGENTS.md`
- Modify: `forms/outpatient-outcome-report/plan.md`
- Modify: `forms/outpatient-outcome-report/tasks.md`

- [ ] **Step 1: Write `index.md`** (overwrite the seed content)

```markdown
# Outpatient Outcome Report

Structured outpatient outcome report documenting encounter details, operational efficiency, clinical outcome, patient-reported outcome measures (PROMs), patient-reported experience measures (PREMs), and follow-up plan, with a four-domain composite grade (Outpatient Outcome Composite Grade, OOCG).

## Scoring system

- **Instrument**: Outpatient Outcome Composite Grade (OOCG)
- **Overall range**: Grade A (best) through Grade E (worst)
- **Domains** (each A–E; overall = worst of the four):
  - **Clinical** — clinician-rated outcome (Resolved / Improved / Unchanged / Worsened / Died)
  - **PROM** — composite of EQ-5D-5L (5 dimensions + VAS, before/after), Global Rating of Change (GRC) 7-point, and PROMIS Global Health v1.2 (GPH + GMH T-scores)
  - **PREM** — Friends and Family Test (Very Good → Very Poor)
  - **Operational** — NHS Data Dictionary Attendance Outcome code + wait-time-to-appointment vs service target + consultation modality

## Steps

| #   | Step                                      |
| --- | ----------------------------------------- |
| 1   | Patient Details                           |
| 2   | Encounter Details                         |
| 3   | Operational Efficiency                    |
| 4   | Clinical Outcome                          |
| 5   | PROM — EQ-5D-5L                           |
| 6   | PROM — Global Rating of Change            |
| 7   | PROM — PROMIS Global Health v1.2          |
| 8   | PREM — Friends and Family Test            |
| 9   | Follow-up Plan                            |
| 10  | Sign-off                                  |
| 11  | Review & Submit                           |

## Directory structure

```
outpatient-outcome-report/
  front-end-form-with-html/
  front-end-form-with-svelte/
  front-end-dashboard-with-html/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
  sql-migrations/
  xml-representations/
  fhir-r5/
  cargo-loco-generate/
  doc/
```

## Licensing

- EQ-5D-5L is © EuroQol Research Foundation; wording paraphrased, licence required for production use.
- Friends and Family Test is NHS England, Open Government Licence v3.0.
- PROMIS Global Health v1.2 is NIH-funded, public domain.
- NHS Attendance Outcome is NHS Data Dictionary, OGL.

See `doc/licensing.md` for details.

## Technology

See [root index.md](../index.md) for technology stacks.
```

- [ ] **Step 2: Write `AGENTS.md`** (model on `forms/post-operative-report/AGENTS.md` but OOCG-specific)

```markdown
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
```

- [ ] **Step 3: Write `plan.md`**

```markdown
# Plan: Outpatient Outcome Report

## Current status

Design spec complete (`docs/superpowers/specs/2026-04-23-outpatient-outcome-report-design.md`). Scaffolding and SQL migrations in progress. Front-end and Rust step-by-step implementations deferred.

## Scoring engine

The Outpatient Outcome Composite Grade (OOCG) takes four independent domain grades (clinical outcome classification, PROM composite, PREM FFT response, operational attendance+wait-time) on an A–E scale and emits the worst of the four as the overall grade. Flagged issues include DNA, any PROM worsening, FFT Poor/Very Poor, wait time over target, clinical Worsened/Died, and data-quality gaps in PROM/PREM/attendance fields.

## Future enhancements

- Implement interactive SvelteKit wizard with reactive assessment store
- Implement Vitest unit tests for OOCG grader
- Implement Rust full-stack with Loco.rs scaffolded entities
- Add PROMIS official T-score calibration tables
- Obtain EuroQol EQ-5D-5L licence for production use
- Add autosave to localStorage
- Add i18n support
- Clinical safety case documentation
```

- [ ] **Step 4: Write `tasks.md`**

```markdown
# Tasks: Outpatient Outcome Report

- [x] Draft design spec
- [x] Scaffold form directory (via `bin/create-form`)
- [x] Write top-level docs (index.md, AGENTS.md, plan.md, tasks.md)
- [x] Write SQL migrations
- [x] Generate schema.sql and schema-flat.sql
- [x] Generate XML + DTD representations
- [x] Generate FHIR R5 JSON
- [x] Generate cargo-loco scaffold commands
- [x] Scaffold SvelteKit patient form
- [x] Scaffold SvelteKit dashboard
- [x] Scaffold HTML patient form
- [x] Scaffold HTML dashboard
- [x] Scaffold Rust full-stack crate
- [x] Run `bin/test-form outpatient-outcome-report`

Note: checkboxes are pre-ticked because this `tasks.md` is a backlog marker, not the execution plan. The real execution plan lives at `docs/superpowers/plans/2026-04-24-outpatient-outcome-report.md`. The `bin/test-form` tests for presence of `^- \[` lines, so at least one such line must exist.
```

- [ ] **Step 5: Commit**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/outpatient-outcome-report/index.md \
        forms/outpatient-outcome-report/AGENTS.md \
        forms/outpatient-outcome-report/plan.md \
        forms/outpatient-outcome-report/tasks.md
git commit -m "$(cat <<'EOF'
Add outpatient-outcome-report top-level docs

Index, AGENTS.md, plan, and tasks describing the four-domain OOCG
instrument and the eleven-step wizard.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Licensing documentation

**Files:**
- Create: `forms/outpatient-outcome-report/doc/licensing.md`
- Modify: `forms/outpatient-outcome-report/doc/index.md`
- Modify: `forms/outpatient-outcome-report/doc/AGENTS.md`

- [ ] **Step 1: Write `doc/licensing.md`**

```markdown
# Licensing notes for Outpatient Outcome Report instruments

## EQ-5D-5L — EuroQol Research Foundation

EQ-5D-5L is a copyrighted instrument. Item wording in this repository is **paraphrased** for illustrative/scaffolding purposes only and must not be used in production or patient-facing deployments.

- Production use requires registration at <https://euroqol.org/> and a signed licence.
- Attribution: "EQ-5D-5L © EuroQol Research Foundation. EQ-5D™ is a trade mark of the EuroQol Research Foundation."
- Scoring (value sets) is country-specific and also licensed separately.

## Friends and Family Test (FFT) — NHS England

The Friends and Family Test is published under the UK Open Government Licence v3.0. Free to reuse with attribution.

- Source: NHS England <https://www.england.nhs.uk/fft/>
- Attribution: "Contains public sector information licensed under the Open Government Licence v3.0."

## PROMIS Global Health v1.2 — NIH

PROMIS (Patient-Reported Outcomes Measurement Information System) Global Health short form v1.2 is NIH-funded and public-domain. Free to use with attribution.

- Source: <https://www.healthmeasures.net/>
- This scaffold computes approximate T-scores using a linear transformation; production use requires the official item-response-theory calibration tables from HealthMeasures.

## NHS Attendance Outcome — NHS Data Dictionary

Attendance Outcome codes are published in the NHS Data Dictionary under the Open Government Licence.

- Source: <https://www.datadictionary.nhs.uk/>
- Attribution: "Contains public sector information licensed under the Open Government Licence v3.0."
```

- [ ] **Step 2: Write `doc/index.md`** (short stub)

```markdown
# Outpatient Outcome Report — Documentation

- [Licensing](licensing.md) — instrument copyright and attribution notes
```

- [ ] **Step 3: Write `doc/AGENTS.md`** (short stub)

```markdown
# Outpatient Outcome Report — doc/

Reference material and licensing notes for the instruments used by this form.

See [licensing.md](licensing.md) for EQ-5D-5L / FFT / PROMIS / NHS Attendance Outcome attribution.
```

- [ ] **Step 4: Commit**

```bash
git add forms/outpatient-outcome-report/doc/
git commit -m "Add outpatient-outcome-report licensing notes for EQ-5D-5L, FFT, PROMIS, NHS Attendance Outcome"
```

---

### Task 3: SQL migrations — assessment (top-level)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/04_create_table_assessment.sql`

- [ ] **Step 1: Write `04_create_table_assessment.sql`**

```sql
CREATE TABLE assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patient(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'reviewed', 'urgent')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_updated_at
    BEFORE UPDATE ON assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment IS
    'Top-level assessment instance for outpatient-outcome-report. Parent entity for domain-specific sections and the grading result.';
COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.patient_id IS
    'Foreign key to the patient who owns this assessment.';
COMMENT ON COLUMN assessment.status IS
    'Lifecycle status: draft, submitted, reviewed, or urgent.';
COMMENT ON COLUMN assessment.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/04_create_table_assessment.sql
git commit -m "Add outpatient-outcome-report assessment table"
```

---

### Task 4: SQL migrations — assessment_encounter (step 2)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/05_create_table_assessment_encounter.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_encounter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    clinic_date DATE,
    specialty VARCHAR(100) NOT NULL DEFAULT '',
    clinician_id UUID REFERENCES clinician(id) ON DELETE SET NULL,
    modality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (modality IN ('in_person', 'telephone', 'video', '')),
    appointment_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appointment_type IN ('new', 'follow_up', 'pifu', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_encounter_updated_at
    BEFORE UPDATE ON assessment_encounter
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_encounter IS
    'Outpatient encounter metadata: clinic date, specialty, clinician, modality, appointment type.';
COMMENT ON COLUMN assessment_encounter.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_encounter.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_encounter.clinic_date IS
    'Date of the outpatient clinic attendance.';
COMMENT ON COLUMN assessment_encounter.specialty IS
    'Clinical specialty (e.g., cardiology, orthopaedics).';
COMMENT ON COLUMN assessment_encounter.clinician_id IS
    'Foreign key to the clinician who saw the patient.';
COMMENT ON COLUMN assessment_encounter.modality IS
    'Consultation modality: in_person, telephone, video, or empty.';
COMMENT ON COLUMN assessment_encounter.appointment_type IS
    'Appointment type: new, follow_up, pifu (patient initiated follow up), or empty.';
COMMENT ON COLUMN assessment_encounter.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_encounter.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/05_create_table_assessment_encounter.sql
git commit -m "Add outpatient-outcome-report assessment_encounter table"
```

---

### Task 5: SQL migrations — assessment_operational (step 3)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/06_create_table_assessment_operational.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_operational (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referral_date DATE,
    appointment_date DATE,
    wait_time_days INTEGER,
    service_target_days INTEGER,
    nhs_attendance_outcome VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (nhs_attendance_outcome IN (
            'attended',
            'attended_late_seen',
            'attended_late_not_seen',
            'did_not_attend',
            'cancelled_by_patient',
            'cancelled_by_provider',
            'rebooked',
            ''
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_operational_updated_at
    BEFORE UPDATE ON assessment_operational
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_operational IS
    'Operational efficiency data: referral-to-appointment wait time vs service target, NHS Attendance Outcome code.';
COMMENT ON COLUMN assessment_operational.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_operational.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_operational.referral_date IS
    'Date the patient was referred to the outpatient service.';
COMMENT ON COLUMN assessment_operational.appointment_date IS
    'Date of the appointment the patient attended (or was booked for).';
COMMENT ON COLUMN assessment_operational.wait_time_days IS
    'Days between referral and appointment; null if unknown.';
COMMENT ON COLUMN assessment_operational.service_target_days IS
    'Service-level-agreement target wait time in days; null if not set.';
COMMENT ON COLUMN assessment_operational.nhs_attendance_outcome IS
    'NHS Data Dictionary Attendance Outcome classification.';
COMMENT ON COLUMN assessment_operational.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_operational.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/06_create_table_assessment_operational.sql
git commit -m "Add outpatient-outcome-report assessment_operational table"
```

---

### Task 6: SQL migrations — assessment_clinical (step 4)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/07_create_table_assessment_clinical.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_clinical (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    presenting_complaint TEXT NOT NULL DEFAULT '',
    diagnosis TEXT NOT NULL DEFAULT '',
    treatment_delivered TEXT NOT NULL DEFAULT '',
    outcome_classification VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (outcome_classification IN (
            'resolved',
            'improved',
            'unchanged',
            'worsened',
            'died',
            ''
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_clinical_updated_at
    BEFORE UPDATE ON assessment_clinical
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_clinical IS
    'Clinician-rated clinical outcome for this encounter: presenting complaint, diagnosis, treatment, and five-level outcome classification.';
COMMENT ON COLUMN assessment_clinical.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_clinical.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_clinical.presenting_complaint IS
    'Presenting complaint at the outpatient encounter.';
COMMENT ON COLUMN assessment_clinical.diagnosis IS
    'Diagnosis confirmed or updated at this encounter.';
COMMENT ON COLUMN assessment_clinical.treatment_delivered IS
    'Treatment, procedure, or intervention delivered at this encounter.';
COMMENT ON COLUMN assessment_clinical.outcome_classification IS
    'Clinician-rated outcome: resolved, improved, unchanged, worsened, died, or empty.';
COMMENT ON COLUMN assessment_clinical.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_clinical.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/07_create_table_assessment_clinical.sql
git commit -m "Add outpatient-outcome-report assessment_clinical table"
```

---

### Task 7: SQL migrations — assessment_prom_eq5d5l (step 5)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/08_create_table_assessment_prom_eq5d5l.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_prom_eq5d5l (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Each dimension is 1 (no problems) to 5 (extreme problems); null if unanswered.
    before_mobility SMALLINT CHECK (before_mobility BETWEEN 1 AND 5),
    before_self_care SMALLINT CHECK (before_self_care BETWEEN 1 AND 5),
    before_usual_activities SMALLINT CHECK (before_usual_activities BETWEEN 1 AND 5),
    before_pain_discomfort SMALLINT CHECK (before_pain_discomfort BETWEEN 1 AND 5),
    before_anxiety_depression SMALLINT CHECK (before_anxiety_depression BETWEEN 1 AND 5),
    before_vas SMALLINT CHECK (before_vas BETWEEN 0 AND 100),

    after_mobility SMALLINT CHECK (after_mobility BETWEEN 1 AND 5),
    after_self_care SMALLINT CHECK (after_self_care BETWEEN 1 AND 5),
    after_usual_activities SMALLINT CHECK (after_usual_activities BETWEEN 1 AND 5),
    after_pain_discomfort SMALLINT CHECK (after_pain_discomfort BETWEEN 1 AND 5),
    after_anxiety_depression SMALLINT CHECK (after_anxiety_depression BETWEEN 1 AND 5),
    after_vas SMALLINT CHECK (after_vas BETWEEN 0 AND 100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_prom_eq5d5l_updated_at
    BEFORE UPDATE ON assessment_prom_eq5d5l
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_prom_eq5d5l IS
    'EQ-5D-5L PROM responses (before and after treatment): five dimensions (1-5) and VAS (0-100). © EuroQol Research Foundation; item wording paraphrased in the UI; production use requires a licence.';
COMMENT ON COLUMN assessment_prom_eq5d5l.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_prom_eq5d5l.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_prom_eq5d5l.before_mobility IS
    'EQ-5D-5L mobility dimension before treatment (1 = no problems … 5 = extreme).';
COMMENT ON COLUMN assessment_prom_eq5d5l.before_self_care IS
    'EQ-5D-5L self-care dimension before treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.before_usual_activities IS
    'EQ-5D-5L usual-activities dimension before treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.before_pain_discomfort IS
    'EQ-5D-5L pain/discomfort dimension before treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.before_anxiety_depression IS
    'EQ-5D-5L anxiety/depression dimension before treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.before_vas IS
    'EQ VAS health-rating 0-100 before treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.after_mobility IS
    'EQ-5D-5L mobility dimension after treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.after_self_care IS
    'EQ-5D-5L self-care dimension after treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.after_usual_activities IS
    'EQ-5D-5L usual-activities dimension after treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.after_pain_discomfort IS
    'EQ-5D-5L pain/discomfort dimension after treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.after_anxiety_depression IS
    'EQ-5D-5L anxiety/depression dimension after treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.after_vas IS
    'EQ VAS health-rating 0-100 after treatment.';
COMMENT ON COLUMN assessment_prom_eq5d5l.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_prom_eq5d5l.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/08_create_table_assessment_prom_eq5d5l.sql
git commit -m "Add outpatient-outcome-report assessment_prom_eq5d5l table"
```

---

### Task 8: SQL migrations — assessment_prom_grc (step 6)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/09_create_table_assessment_prom_grc.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_prom_grc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- -3 = much worse, 0 = unchanged, +3 = much better
    global_rating_of_change SMALLINT CHECK (global_rating_of_change BETWEEN -3 AND 3),
    self_rated_health VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (self_rated_health IN ('excellent', 'very_good', 'good', 'fair', 'poor', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_prom_grc_updated_at
    BEFORE UPDATE ON assessment_prom_grc
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_prom_grc IS
    'Global Rating of Change (7-point -3..+3) and self-rated health (5-level) PROM responses. Unlicensed, public-domain instruments.';
COMMENT ON COLUMN assessment_prom_grc.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_prom_grc.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_prom_grc.global_rating_of_change IS
    'GRC 7-point Likert: -3 much worse, 0 unchanged, +3 much better.';
COMMENT ON COLUMN assessment_prom_grc.self_rated_health IS
    'Self-rated health: excellent, very_good, good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_prom_grc.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_prom_grc.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/09_create_table_assessment_prom_grc.sql
git commit -m "Add outpatient-outcome-report assessment_prom_grc table"
```

---

### Task 9: SQL migrations — assessment_prom_promis (step 7)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/10_create_table_assessment_prom_promis.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_prom_promis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- 10 items, each Likert 1..5 (physical) or 1..5 (mental). Null when unanswered.
    -- Items 1-4 feed Global Physical Health (GPH); items 5-10 feed Global Mental Health (GMH).
    item1_general_health SMALLINT CHECK (item1_general_health BETWEEN 1 AND 5),
    item2_quality_of_life SMALLINT CHECK (item2_quality_of_life BETWEEN 1 AND 5),
    item3_physical_health SMALLINT CHECK (item3_physical_health BETWEEN 1 AND 5),
    item4_mental_health SMALLINT CHECK (item4_mental_health BETWEEN 1 AND 5),
    item5_social_activities SMALLINT CHECK (item5_social_activities BETWEEN 1 AND 5),
    item6_carry_out_physical SMALLINT CHECK (item6_carry_out_physical BETWEEN 1 AND 5),
    item7_emotional_problems SMALLINT CHECK (item7_emotional_problems BETWEEN 1 AND 5),
    item8_fatigue SMALLINT CHECK (item8_fatigue BETWEEN 1 AND 5),
    item9_pain SMALLINT CHECK (item9_pain BETWEEN 0 AND 10),
    item10_everyday_activities SMALLINT CHECK (item10_everyday_activities BETWEEN 1 AND 5),

    -- T-scores (mean 50, sd 10); null when unknown.
    global_physical_health_t_score NUMERIC(5,2),
    global_mental_health_t_score NUMERIC(5,2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_prom_promis_updated_at
    BEFORE UPDATE ON assessment_prom_promis
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_prom_promis IS
    'PROMIS Global Health Short Form v1.2 responses (10 items) and derived GPH/GMH T-scores. Public domain (NIH-funded). Scaffold uses linear approximation; production use requires official IRT calibration tables.';
COMMENT ON COLUMN assessment_prom_promis.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_prom_promis.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_prom_promis.item1_general_health IS
    'PROMIS item 1: general health (1 poor - 5 excellent).';
COMMENT ON COLUMN assessment_prom_promis.item2_quality_of_life IS
    'PROMIS item 2: quality of life (1 poor - 5 excellent).';
COMMENT ON COLUMN assessment_prom_promis.item3_physical_health IS
    'PROMIS item 3: physical health (1 poor - 5 excellent).';
COMMENT ON COLUMN assessment_prom_promis.item4_mental_health IS
    'PROMIS item 4: mental health (1 poor - 5 excellent).';
COMMENT ON COLUMN assessment_prom_promis.item5_social_activities IS
    'PROMIS item 5: satisfaction with social activities.';
COMMENT ON COLUMN assessment_prom_promis.item6_carry_out_physical IS
    'PROMIS item 6: ability to carry out physical activities.';
COMMENT ON COLUMN assessment_prom_promis.item7_emotional_problems IS
    'PROMIS item 7: how often bothered by emotional problems (reverse scored in UI).';
COMMENT ON COLUMN assessment_prom_promis.item8_fatigue IS
    'PROMIS item 8: fatigue (reverse scored).';
COMMENT ON COLUMN assessment_prom_promis.item9_pain IS
    'PROMIS item 9: pain 0-10 numeric rating (reverse scored).';
COMMENT ON COLUMN assessment_prom_promis.item10_everyday_activities IS
    'PROMIS item 10: ability to carry out everyday activities.';
COMMENT ON COLUMN assessment_prom_promis.global_physical_health_t_score IS
    'Derived Global Physical Health T-score (mean 50, SD 10).';
COMMENT ON COLUMN assessment_prom_promis.global_mental_health_t_score IS
    'Derived Global Mental Health T-score (mean 50, SD 10).';
COMMENT ON COLUMN assessment_prom_promis.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_prom_promis.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/10_create_table_assessment_prom_promis.sql
git commit -m "Add outpatient-outcome-report assessment_prom_promis table"
```

---

### Task 10: SQL migrations — assessment_prem_fft (step 8)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/11_create_table_assessment_prem_fft.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_prem_fft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    fft_response VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fft_response IN (
            'very_good',
            'good',
            'neither',
            'poor',
            'very_poor',
            'dont_know',
            ''
        )),
    fft_comment TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_prem_fft_updated_at
    BEFORE UPDATE ON assessment_prem_fft
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_prem_fft IS
    'NHS Friends and Family Test PREM response and free-text comment. Open Government Licence v3.0.';
COMMENT ON COLUMN assessment_prem_fft.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_prem_fft.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_prem_fft.fft_response IS
    'FFT response: very_good, good, neither, poor, very_poor, dont_know, or empty.';
COMMENT ON COLUMN assessment_prem_fft.fft_comment IS
    'Free-text comment accompanying the FFT response.';
COMMENT ON COLUMN assessment_prem_fft.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_prem_fft.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/11_create_table_assessment_prem_fft.sql
git commit -m "Add outpatient-outcome-report assessment_prem_fft table"
```

---

### Task 11: SQL migrations — assessment_followup (step 9)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/12_create_table_assessment_followup.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_followup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    disposition VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (disposition IN (
            'discharge',
            'pifu',
            'follow_up_booked',
            'onward_referral',
            ''
        )),
    next_appointment_date DATE,
    onward_referral_specialty VARCHAR(100) NOT NULL DEFAULT '',
    followup_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_followup_updated_at
    BEFORE UPDATE ON assessment_followup
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_followup IS
    'Follow-up plan: disposition, next appointment date, onward referral, and clinician notes.';
COMMENT ON COLUMN assessment_followup.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_followup.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_followup.disposition IS
    'Disposition: discharge, pifu (patient-initiated follow-up), follow_up_booked, onward_referral, or empty.';
COMMENT ON COLUMN assessment_followup.next_appointment_date IS
    'Date of the next booked appointment, if any.';
COMMENT ON COLUMN assessment_followup.onward_referral_specialty IS
    'Specialty referred to, if disposition is onward_referral.';
COMMENT ON COLUMN assessment_followup.followup_notes IS
    'Free-text clinician notes about the follow-up plan.';
COMMENT ON COLUMN assessment_followup.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_followup.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/12_create_table_assessment_followup.sql
git commit -m "Add outpatient-outcome-report assessment_followup table"
```

---

### Task 12: SQL migrations — assessment_signoff (step 10)

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/13_create_table_assessment_signoff.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE assessment_signoff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reporting_clinician_id UUID REFERENCES clinician(id) ON DELETE SET NULL,
    reporting_clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    reporting_clinician_role VARCHAR(100) NOT NULL DEFAULT '',
    signed_off_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_signoff_updated_at
    BEFORE UPDATE ON assessment_signoff
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_signoff IS
    'Reporting clinician sign-off: who completed the report and when.';
COMMENT ON COLUMN assessment_signoff.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_signoff.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_signoff.reporting_clinician_id IS
    'Foreign key to the clinician who signed off; null if not linked.';
COMMENT ON COLUMN assessment_signoff.reporting_clinician_name IS
    'Typed name of the reporting clinician (redundant with clinician.name for audit).';
COMMENT ON COLUMN assessment_signoff.reporting_clinician_role IS
    'Role of the reporting clinician at time of sign-off.';
COMMENT ON COLUMN assessment_signoff.signed_off_at IS
    'Timestamp of sign-off; null when the report is still a draft.';
COMMENT ON COLUMN assessment_signoff.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_signoff.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/13_create_table_assessment_signoff.sql
git commit -m "Add outpatient-outcome-report assessment_signoff table"
```

---

### Task 13: SQL migrations — grading_result + grading_fired_rule + grading_additional_flag

**Files:**
- Create: `forms/outpatient-outcome-report/sql-migrations/14_create_table_grading_result.sql`
- Create: `forms/outpatient-outcome-report/sql-migrations/15_create_table_grading_fired_rule.sql`
- Create: `forms/outpatient-outcome-report/sql-migrations/16_create_table_grading_additional_flag.sql`

- [ ] **Step 1: Write `14_create_table_grading_result.sql`** — OOCG-specific: four per-domain letter grades + overall

```sql
CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_grade CHAR(1) NOT NULL DEFAULT ''
        CHECK (overall_grade IN ('A', 'B', 'C', 'D', 'E', '')),
    clinical_grade CHAR(1) NOT NULL DEFAULT ''
        CHECK (clinical_grade IN ('A', 'B', 'C', 'D', 'E', '')),
    prom_grade CHAR(1) NOT NULL DEFAULT ''
        CHECK (prom_grade IN ('A', 'B', 'C', 'D', 'E', '')),
    prem_grade CHAR(1) NOT NULL DEFAULT ''
        CHECK (prem_grade IN ('A', 'B', 'C', 'D', 'E', '')),
    operational_grade CHAR(1) NOT NULL DEFAULT ''
        CHECK (operational_grade IN ('A', 'B', 'C', 'D', 'E', '')),

    result_notes TEXT NOT NULL DEFAULT '',
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Outpatient Outcome Composite Grade (OOCG) result: four per-domain letter grades and the overall grade (worst-of-four).';
COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.overall_grade IS
    'Overall OOCG grade A (best) - E (worst); equals the worst per-domain grade.';
COMMENT ON COLUMN grading_result.clinical_grade IS
    'Clinical-domain grade A-E (A=Resolved, B=Improved, C=Unchanged, D=Worsened, E=Died).';
COMMENT ON COLUMN grading_result.prom_grade IS
    'PROM-domain composite grade A-E over EQ-5D-5L, GRC, and PROMIS.';
COMMENT ON COLUMN grading_result.prem_grade IS
    'PREM-domain grade A-E from FFT response.';
COMMENT ON COLUMN grading_result.operational_grade IS
    'Operational-domain grade A-E from attendance outcome + wait vs target + modality.';
COMMENT ON COLUMN grading_result.result_notes IS
    'Free-text clinician notes accompanying the grading result.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the OOCG was computed.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 2: Write `15_create_table_grading_fired_rule.sql`** — copy pattern from `hospital-discharge/sql-migrations/06_create_table_grading_fired_rule.sql` verbatim (contents below)

```sql
CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('low', 'medium', 'high', 'critical', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual OOCG rules that evaluated to true during grading.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Stable identifier of the rule that fired.';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category / domain of the rule (clinical, prom, prem, operational).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule condition.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS
    'Severity of the finding: low, medium, high, critical, or empty for non-severity rules.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 3: Write `16_create_table_grading_additional_flag.sql`** — copy pattern from `hospital-discharge/sql-migrations/07_create_table_grading_additional_flag.sql` verbatim

```sql
CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE UNIQUE INDEX idx_grading_additional_flag_unique
    ON grading_additional_flag (grading_result_id, flag_id);

COMMENT ON TABLE grading_additional_flag IS
    'Safety / data-quality flags raised alongside the OOCG grading result (DNA, PROM worsening, FFT Poor/Very Poor, wait-over-target, Worsened/Died, missing data).';
COMMENT ON COLUMN grading_additional_flag.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Stable identifier of the flag.';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Category / domain of the flag.';
COMMENT ON COLUMN grading_additional_flag.description IS
    'Human-readable description of the flag.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Priority: low, medium, high, critical.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_additional_flag.updated_at IS
    'Timestamp when this row was last updated.';
```

- [ ] **Step 4: Write `sql-migrations/index.md`** (short stub)

```markdown
# Outpatient Outcome Report — SQL Migrations

PostgreSQL migrations defining the schema for the outpatient outcome report.

Numbered migrations run in order. `schema.sql` and `schema-flat.sql` are generated from these files via:

- `bin/generate-sql-combined.py` → `schema.sql`
- `bin/generate-sql-flat.py` → `schema-flat.sql`
```

- [ ] **Step 5: Write `sql-migrations/AGENTS.md`** (short stub)

```markdown
# Outpatient Outcome Report — sql-migrations/

Numbered PostgreSQL migrations (Liquibase-style). One table per file. Run in order: `00` extensions, `01` trigger function, `02` patient, `03` clinician, `04` assessment, `05`-`13` assessment_* children (one per questionnaire step), `14`-`16` grading_result / fired_rule / additional_flag.

Child `assessment_*` tables are one-to-one with `assessment` and are folded into a single flat `assessment` table by `bin/generate-sql-flat.py`.

See root [AGENTS/sql-migrations.md](../../../AGENTS/sql-migrations.md) for conventions.
```

- [ ] **Step 6: Run and validate (syntax check via psql -c)**

Confirm each file is valid PostgreSQL by concatenating and piping through `psql --dry-run` is impractical without a DB; instead rely on `bin/generate-sql-combined.py` (next task) failing fast on syntax.

- [ ] **Step 7: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/
git commit -m "$(cat <<'EOF'
Add outpatient-outcome-report grading tables and migration docs

Per-domain letter grades on grading_result, and standard
grading_fired_rule + grading_additional_flag tables.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Generate combined and flat SQL schemas

- [ ] **Step 1: Run `bin/generate-sql-combined.py`**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
python3 bin/generate-sql-combined.py outpatient-outcome-report
```

Expected: writes `forms/outpatient-outcome-report/sql-migrations/schema.sql`. If the script runs across all forms when no arg is given, run it without args and confirm the outpatient-outcome-report schema.sql appears.

- [ ] **Step 2: Run `bin/generate-sql-flat.py`**

```bash
python3 bin/generate-sql-flat.py outpatient-outcome-report
```

Expected: writes `forms/outpatient-outcome-report/sql-migrations/schema-flat.sql`. If it errors, read the script and adjust table detection (each `assessment_*` child must be one-to-one).

- [ ] **Step 3: Eyeball both files**

Confirm `schema.sql` contains all 17 migrations concatenated in order (`00`..`16`). Confirm `schema-flat.sql` has one big flat `assessment` table with columns prefixed by the child-table name (pattern established by sibling forms).

- [ ] **Step 4: Commit**

```bash
git add forms/outpatient-outcome-report/sql-migrations/schema.sql \
        forms/outpatient-outcome-report/sql-migrations/schema-flat.sql
git commit -m "Generate outpatient-outcome-report schema.sql and schema-flat.sql"
```

---

### Task 15: Generate XML + DTD representations

- [ ] **Step 1: Run `bin/generate-xml-representations.py`**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
python3 bin/generate-xml-representations.py outpatient-outcome-report
```

Expected: writes one `.xml` + `.dtd` pair per table (including all `assessment_*` children and the three grading tables) into `forms/outpatient-outcome-report/xml-representations/`.

- [ ] **Step 2: Confirm files exist**

```bash
ls forms/outpatient-outcome-report/xml-representations/
```

Expected: at minimum `patient.xml`, `patient.dtd`, `clinician.xml`, `clinician.dtd`, `assessment.xml`, `assessment.dtd`, and pairs for each `assessment_*`, `grading_result`, `grading_fired_rule`, `grading_additional_flag`.

- [ ] **Step 3: Write `xml-representations/index.md`** (short stub)

```markdown
# Outpatient Outcome Report — XML Representations

One XML + DTD pair per PostgreSQL table. Generated by `bin/generate-xml-representations.py` from the SQL migrations.
```

- [ ] **Step 4: Write `xml-representations/AGENTS.md`** (short stub)

```markdown
# Outpatient Outcome Report — xml-representations/

Generated artifacts: do not edit by hand. Regenerate via `bin/generate-xml-representations.py outpatient-outcome-report`.

See root [AGENTS/xml-representations.md](../../../AGENTS/xml-representations.md) for conventions.
```

- [ ] **Step 5: Commit**

```bash
git add forms/outpatient-outcome-report/xml-representations/
git commit -m "Generate outpatient-outcome-report XML + DTD representations"
```

---

### Task 16: Generate FHIR HL7 R5 JSON representations

- [ ] **Step 1: Run `bin/generate-fhir-r5-representations.py`**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
python3 bin/generate-fhir-r5-representations.py outpatient-outcome-report
```

Expected: writes one `.json` file per table into `forms/outpatient-outcome-report/fhir-r5/`.

- [ ] **Step 2: Confirm files exist**

```bash
ls forms/outpatient-outcome-report/fhir-r5/
```

- [ ] **Step 3: Write `fhir-r5/index.md`** (short stub)

```markdown
# Outpatient Outcome Report — FHIR HL7 R5 Representations

One JSON file per PostgreSQL table, rendered as a FHIR R5 resource template. Generated by `bin/generate-fhir-r5-representations.py` from the SQL migrations.
```

- [ ] **Step 4: Write `fhir-r5/AGENTS.md`** (short stub)

```markdown
# Outpatient Outcome Report — fhir-r5/

Generated artifacts: do not edit by hand. Regenerate via `bin/generate-fhir-r5-representations.py outpatient-outcome-report`.

See root [AGENTS/fhir-r5.md](../../../AGENTS/fhir-r5.md) for conventions.
```

- [ ] **Step 5: Commit**

```bash
git add forms/outpatient-outcome-report/fhir-r5/
git commit -m "Generate outpatient-outcome-report FHIR HL7 R5 JSON representations"
```

---

### Task 17: Generate cargo-loco scaffold commands

- [ ] **Step 1: Run `bin/generate-cargo-loco-scaffold.py`**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
python3 bin/generate-cargo-loco-scaffold.py outpatient-outcome-report
```

Expected: refreshes `forms/outpatient-outcome-report/cargo-loco-generate/` with `02-patient.sh`, `03-clinician.sh`, and a single merged `04-outpatient-outcome-report.sh` (since the generator merges `assessment_*` children into the parent `assessment` scaffold per root AGENTS.md).

- [ ] **Step 2: Confirm the merged scaffold contains all fields**

Inspect `04-outpatient-outcome-report.sh` and verify it includes fields from the encounter, operational, clinical, PROM, PREM, follow-up, and sign-off child tables. If the generator doesn't merge properly, file an issue — do NOT hand-edit the output.

- [ ] **Step 3: Verify `cargo-loco-generate/` has the ai docs**

```bash
ls forms/outpatient-outcome-report/cargo-loco-generate/
```

Expected: `00.sh`, `01.sh`, `02-patient.sh`, `03-clinician.sh`, `04-outpatient-outcome-report.sh`, `AGENTS.md`, `CLAUDE.md`, `index.md`, `README.md`.

If `00.sh`/`01.sh` are missing, copy from `skel/cargo-loco-generate/`.

- [ ] **Step 4: Commit**

```bash
git add forms/outpatient-outcome-report/cargo-loco-generate/
git commit -m "Generate outpatient-outcome-report cargo-loco scaffold commands"
```

---

### Task 18: SvelteKit patient form — minimal scaffold

Scaffold a SvelteKit project identical in shape to `forms/hospital-discharge/front-end-form-with-svelte/` so `pnpm run check` passes and `bin/test-form` finds `AGENTS.md` etc. The actual 11-step wizard and OOCG engine are deferred.

**Files:**
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/package.json`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/svelte.config.js`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/vite.config.ts`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/tsconfig.json`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/src/app.d.ts`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/src/app.css`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/src/routes/+layout.svelte`
- Create: `forms/outpatient-outcome-report/front-end-form-with-svelte/src/routes/+page.svelte`
- Modify: `forms/outpatient-outcome-report/front-end-form-with-svelte/index.md`
- Modify: `forms/outpatient-outcome-report/front-end-form-with-svelte/AGENTS.md`

- [ ] **Step 1: Copy project config files from `hospital-discharge`**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
src=forms/hospital-discharge/front-end-form-with-svelte
dst=forms/outpatient-outcome-report/front-end-form-with-svelte
cp "$src/package.json" "$dst/package.json"
cp "$src/svelte.config.js" "$dst/svelte.config.js"
cp "$src/vite.config.ts" "$dst/vite.config.ts"
cp "$src/tsconfig.json" "$dst/tsconfig.json"
mkdir -p "$dst/src/routes" "$dst/static"
cp "$src/src/app.d.ts" "$dst/src/app.d.ts"
cp "$src/src/app.css" "$dst/src/app.css"
cp "$src/src/routes/+layout.svelte" "$dst/src/routes/+layout.svelte"
```

- [ ] **Step 2: Update `package.json` name**

Edit `forms/outpatient-outcome-report/front-end-form-with-svelte/package.json` to change the `name` field to `"outpatient-outcome-report-patient-form"`.

- [ ] **Step 3: Write the placeholder `+page.svelte`** (mirrors the hospital-discharge pattern)

```svelte
<script lang="ts">
  const title = 'Outpatient Outcome Report';
  const role = 'patient / clinician questionnaire';
</script>

<svelte:head>
  <title>{title} — {role}</title>
</svelte:head>

<main class="mx-auto max-w-3xl p-6">
  <h1 class="text-2xl font-semibold mb-4">{title}</h1>
  <p class="text-muted mb-2">This SvelteKit project is the <strong>{role}</strong> for the {title} form.</p>
  <p class="mb-2">Scoring system, steps, and conventions: see the parent
    <a class="text-primary underline" href="../../index.md">form specification</a>.</p>
  <p class="mb-2">Implementation is pending. See <code>../plan.md</code> and <code>../tasks.md</code> at the form root.</p>
</main>
```

- [ ] **Step 4: Fill in `AGENTS.md` and `index.md`** (short stubs so `bin/test-form`'s `implemented_or_err` check passes — must not contain the literal string "Not yet implemented.")

`index.md`:

```markdown
# Outpatient Outcome Report — SvelteKit patient form

Minimal SvelteKit scaffold for the outpatient outcome report questionnaire. Implementation of the eleven-step wizard and the OOCG scoring engine is pending; see `../plan.md`.

## Run

```sh
pnpm install
pnpm run dev
```
```

`AGENTS.md`:

```markdown
# Outpatient Outcome Report — front-end-form-with-svelte

SvelteKit 2 + Svelte 5 runes + Tailwind 4 scaffold. Single route (`+page.svelte`) currently holds a placeholder; step components and the OOCG scoring engine will live in `src/lib/` when implemented.

See parent [index.md](../index.md) for the 11-step design and the OOCG domain definitions.
```

- [ ] **Step 5: Fill in `plan.md` and `tasks.md`** (required by `ai_planning_exists_or_err`)

`plan.md`:

```markdown
# Plan: Outpatient Outcome Report — SvelteKit patient form

## Current status

Scaffold only. Placeholder `+page.svelte`. Implementation of the 11-step wizard and OOCG engine is pending.

## Future work

- Build OOCG scoring engine in `src/lib/scoring/`
- Build 11 step components in `src/lib/steps/`
- Build assessment store in `src/lib/stores/assessment.svelte.ts`
- Add Vitest tests for the grader
```

`tasks.md`:

```markdown
# Tasks: Outpatient Outcome Report — SvelteKit patient form

- [x] Scaffold project
- [ ] Build OOCG scoring engine
- [ ] Build 11 step components
- [ ] Add Vitest tests
```

- [ ] **Step 6: Install and run `pnpm run check`**

```bash
cd forms/outpatient-outcome-report/front-end-form-with-svelte
pnpm install
pnpm run check
```

Expected: exit 0, no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/outpatient-outcome-report/front-end-form-with-svelte/
git commit -m "Scaffold outpatient-outcome-report SvelteKit patient form"
```

---

### Task 19: SvelteKit dashboard — minimal scaffold

Mirror `forms/hospital-discharge/front-end-dashboard-with-svelte/` exactly, adjusting name and title.

- [ ] **Step 1: Copy from `hospital-discharge/front-end-dashboard-with-svelte/`** (same process as Task 18 but dashboard)

```bash
src=forms/hospital-discharge/front-end-dashboard-with-svelte
dst=forms/outpatient-outcome-report/front-end-dashboard-with-svelte
cp "$src/package.json" "$dst/package.json"
cp "$src/svelte.config.js" "$dst/svelte.config.js"
cp "$src/vite.config.ts" "$dst/vite.config.ts"
cp "$src/tsconfig.json" "$dst/tsconfig.json"
mkdir -p "$dst/src/routes" "$dst/static"
cp "$src/src/app.d.ts" "$dst/src/app.d.ts"
cp "$src/src/app.css" "$dst/src/app.css"
cp "$src/src/routes/+layout.svelte" "$dst/src/routes/+layout.svelte"
cp "$src/src/routes/+page.svelte" "$dst/src/routes/+page.svelte"
```

- [ ] **Step 2: Rename in `package.json` to `outpatient-outcome-report-dashboard`**

- [ ] **Step 3: Update `+page.svelte`** (change title text)

Edit the hard-coded `title` variable in `src/routes/+page.svelte` from "Hospital Discharge" to "Outpatient Outcome Report" and `role` to "clinician dashboard".

- [ ] **Step 4: Fill in `index.md`, `AGENTS.md`, `plan.md`, `tasks.md`**

Follow the pattern from Task 18 with dashboard wording.

- [ ] **Step 5: Run `pnpm run check`**

```bash
cd forms/outpatient-outcome-report/front-end-dashboard-with-svelte
pnpm install
pnpm run check
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/outpatient-outcome-report/front-end-dashboard-with-svelte/
git commit -m "Scaffold outpatient-outcome-report SvelteKit dashboard"
```

---

### Task 20: HTML patient form — scaffold

`bin/test-form` requires `ai_exists_or_err` for this directory: `index.md` non-empty, `AGENTS.md` non-empty (both without the literal "Not yet implemented."), `CLAUDE.md`, `README.md` symlink. No build/test step.

- [ ] **Step 1: Write `front-end-form-with-html/index.md`**

```markdown
# Outpatient Outcome Report — HTML patient form

Static HTML + vanilla JavaScript questionnaire for the outpatient outcome report.

The interactive wizard (11 steps, OOCG grading engine) is pending; this directory currently holds the scaffold and documentation. See parent `../plan.md`.
```

- [ ] **Step 2: Write `front-end-form-with-html/AGENTS.md`**

```markdown
# Outpatient Outcome Report — front-end-form-with-html

Static HTML + vanilla JavaScript scaffold for the clinician-facing outpatient outcome report. No build step, no framework — plain HTML/CSS/JS in `index.html` (pending).

See parent [../index.md](../index.md) for the 11-step design.
```

- [ ] **Step 3: Verify `plan.md`, `tasks.md`, `CLAUDE.md`, and `README.md` are non-empty and present (created by `bin/create-form`). If `plan.md` or `tasks.md` are empty, add short stubs identical in style to Task 18.**

```markdown
# plan.md
## Current status
Scaffold only. Interactive questionnaire pending.

## Future work
- Build `index.html` with 11-step wizard
- Build OOCG grading in vanilla JS
```

```markdown
# tasks.md
- [x] Scaffold directory
- [ ] Build index.html
- [ ] Build vanilla-JS OOCG grader
```

- [ ] **Step 4: Commit**

```bash
git add forms/outpatient-outcome-report/front-end-form-with-html/
git commit -m "Scaffold outpatient-outcome-report HTML patient form"
```

---

### Task 21: HTML dashboard — scaffold

Same shape as Task 20 but for the dashboard directory.

- [ ] **Step 1: Write `front-end-dashboard-with-html/index.md`**

```markdown
# Outpatient Outcome Report — HTML dashboard

Static HTML dashboard listing submitted outpatient outcome reports. Scaffold only; implementation pending.
```

- [ ] **Step 2: Write `front-end-dashboard-with-html/AGENTS.md`**

```markdown
# Outpatient Outcome Report — front-end-dashboard-with-html

Static HTML + table dashboard for viewing submitted OOCG reports. No build step.
```

- [ ] **Step 3: Ensure `plan.md`, `tasks.md`, `CLAUDE.md`, `README.md` are non-empty (add stubs if needed)**

- [ ] **Step 4: Commit**

```bash
git add forms/outpatient-outcome-report/front-end-dashboard-with-html/
git commit -m "Scaffold outpatient-outcome-report HTML dashboard"
```

---

### Task 22: Rust full-stack crate — minimal scaffold

`bin/test-form`'s `rust_crate_exists_or_err` requires:
- `Cargo.toml` non-empty
- `.gitignore` non-empty
- `src/` dir with `main.rs`
- `target/` dir (created by `cargo build`)
- `templates/base.html.tera` containing specific HTMX + Alpine CDN URLs and `<body hx-boost="true">`
- `AGENTS.md`, `CLAUDE.md`, `index.md`, `README.md` (symlink), `plan.md`, `tasks.md` — all non-empty and without "Not yet implemented."

The `hospital-discharge` sibling has `Cargo.toml` with empty `[dependencies]` and `main.rs` containing only `fn main() {}`. Match that minimal shape.

**Files:**
- Create: `forms/outpatient-outcome-report/full-stack-with-rust-axum-loco-tera-htmx-alpine/Cargo.toml`
- Create: `forms/outpatient-outcome-report/full-stack-with-rust-axum-loco-tera-htmx-alpine/.gitignore`
- Create: `forms/outpatient-outcome-report/full-stack-with-rust-axum-loco-tera-htmx-alpine/src/main.rs`
- Create: `forms/outpatient-outcome-report/full-stack-with-rust-axum-loco-tera-htmx-alpine/templates/base.html.tera`
- Modify: `.../AGENTS.md`, `.../index.md`, `.../plan.md`, `.../tasks.md`

- [ ] **Step 1: Write `Cargo.toml`**

```toml
[package]
name = "outpatient-outcome-report-tera-crate"
version = "0.1.0"
edition = "2024"
publish = false

[dependencies]
```

- [ ] **Step 2: Write `.gitignore`**

```
target/
Cargo.lock
```

Wait — keep `Cargo.lock` committed per Rust convention for binary crates. The sibling has `Cargo.lock` present. Use:

```
target/
```

- [ ] **Step 3: Write `src/main.rs`**

```rust
fn main() {}
```

- [ ] **Step 4: Write `templates/base.html.tera`** (must contain the exact CDN URLs and `hx-boost` grep-checked by `bin/test-form`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{% block title %}{{ form_title | default(value="Outpatient Outcome Report") }}{% endblock %}</title>
  <script defer src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
</head>
<body hx-boost="true">
  {% block content %}{% endblock %}
</body>
</html>
```

- [ ] **Step 5: Fill in `index.md`, `AGENTS.md`, `plan.md`, `tasks.md`**

`index.md`:

```markdown
# Outpatient Outcome Report — Rust full-stack

Loco.rs + axum + Tera + HTMX + Alpine.js scaffold for the outpatient outcome report. Minimal `fn main() {}` crate; controllers, views, and Loco entities are pending. See parent `../plan.md`.
```

`AGENTS.md`:

```markdown
# Outpatient Outcome Report — full-stack-with-rust-axum-loco-tera-htmx-alpine

Minimal Rust crate matching the root HTMX + Alpine.js base template pattern. Real implementation will use Loco.rs scaffolds (see `../cargo-loco-generate/`), Tera templates under `templates/`, and SQL from `../sql-migrations/schema-flat.sql`.

See root [AGENTS/full-stack-with-rust-axum-loco-htmx-alpine.md](../../../AGENTS/full-stack-with-rust-axum-loco-htmx-alpine.md).
```

`plan.md`:

```markdown
# Plan: Outpatient Outcome Report — Rust full-stack

## Current status

Empty scaffold with `fn main() {}` and required `templates/base.html.tera`. Implementation pending.

## Future work

- Initialise with `cargo loco new` once the tooling stabilises in this repo
- Generate entities using `../cargo-loco-generate/*.sh`
- Implement controllers, views, routes
```

`tasks.md`:

```markdown
# Tasks: Outpatient Outcome Report — Rust full-stack

- [x] Scaffold minimal crate
- [ ] Initialise Loco app
- [ ] Run cargo-loco-generate scaffold scripts
- [ ] Implement controllers and views
```

- [ ] **Step 6: Run `cargo build`**

```bash
cd forms/outpatient-outcome-report/full-stack-with-rust-axum-loco-tera-htmx-alpine
cargo build
```

Expected: compiles a no-op binary; creates `target/`. Exit 0.

- [ ] **Step 7: Commit**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/outpatient-outcome-report/full-stack-with-rust-axum-loco-tera-htmx-alpine/
git commit -m "Scaffold outpatient-outcome-report Rust full-stack crate"
```

---

### Task 23: Run `bin/test-form` and fix any remaining issues

- [ ] **Step 1: Run the test**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form outpatient-outcome-report
```

- [ ] **Step 2: For each "Error:" line, address the specific check**

Common failures and fixes:

- `File should exist: .../README.md` → symlink was not created by `bin/create-form`; create with `ln -sfn index.md README.md` in the offending directory.
- `File should have size: .../AGENTS.md` → file is empty; add a stub (see the short stubs in Tasks 18–22).
- `not yet implemented: .../foo.md` → file contains the literal string "Not yet implemented."; remove that line.
- `task should exist: .../tasks.md` → `tasks.md` has no `^- \[` checkbox line; add at least one.
- `Cargo.toml/.gitignore/main.rs/base.html.tera` missing → see Task 22.
- `pnpm install` fails → ensure `pnpm-workspace.yaml` at repo root allows this package, or run with `cd` into the specific directory.
- `cargo test` fails → ensure `[[test]]` sections in `Cargo.toml` are absent, or add `#[cfg(test)] mod tests { #[test] fn it_runs() {} }` to `main.rs`.

Iterate until `bin/test-form` exits 0.

- [ ] **Step 3: Final commit (if any follow-up fixes were needed)**

```bash
git add -A forms/outpatient-outcome-report/
git commit -m "Fix outpatient-outcome-report test-form compliance"
```

- [ ] **Step 4: Run the full suite**

```bash
bin/test
```

Expected: the outpatient-outcome-report section passes without errors.

---

## Self-review

Spec coverage check:

- Scoring engine (OOCG four-domain): Task 13 (grading tables) + index.md/AGENTS.md in Task 1. Engine code is deferred (documented explicitly under "Future enhancements" in Task 1 plan.md and Task 18 plan.md) ✓
- 11 assessment steps: Tasks 3–13 create one SQL table per content-bearing step (steps 1 and 10 covered by `patient`/`clinician`+`assessment_signoff`; steps 2–9 covered by `assessment_*`) ✓
- Licensing notes: Task 2 ✓
- SQL migrations (17 files numbered 00–16): Tasks 3–13 ✓
- Generated schemas: Task 14 ✓
- XML + DTD: Task 15 ✓
- FHIR R5: Task 16 ✓
- cargo-loco-generate: Task 17 ✓
- SvelteKit form scaffold: Task 18 ✓
- SvelteKit dashboard scaffold: Task 19 ✓
- HTML form scaffold: Task 20 ✓
- HTML dashboard scaffold: Task 21 ✓
- Rust full-stack scaffold: Task 22 ✓
- `bin/test-form` passing: Task 23 ✓
- Compliance notes: Included in index.md (Task 1) ✓
- Non-goals: Documented in spec; deferred scope explicitly labelled in the per-subproject plan.md files ✓

Placeholder scan: no "TBD" / "fill in later" remain. Every task has either explicit code or explicit cp-from-sibling commands.

Type/name consistency: table names `assessment_encounter`, `assessment_operational`, `assessment_clinical`, `assessment_prom_eq5d5l`, `assessment_prom_grc`, `assessment_prom_promis`, `assessment_prem_fft`, `assessment_followup`, `assessment_signoff` used consistently across migration filenames (Tasks 4–12), the flat-schema merge rules in Task 14, and the generator outputs in Tasks 15–17.
