# Audiology Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive audiology assessment evaluating hearing loss type and severity, tinnitus, balance disorders, audiometric results, and hearing aid candidacy.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Project Structure

```
src/
  bin/main.rs              # Entry point
  lib.rs                   # Module declarations
  app.rs                   # Tera init, routes registration
  controllers/
    assessment.rs          # Landing, single-page form, submit, report
    dashboard.rs           # Dashboard with filters
  engine/
    types.rs               # AssessmentData and all audiology-specific types
    hearing_rules.rs       # 20 hearing rules (AUD-001 to AUD-020)
    hearing_grader.rs      # calculate_hearing_level() -> (HearingLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags (FLAG-AUD-001 to FLAG-AUD-014)
    utils.rs               # PTA calculation, hearing_level_label, air-bone gap detection
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with audiology-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Audiology report with PTA, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    hearing_grader_test.rs # 10 grading tests
    flagged_issues_test.rs # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                  | Section Key          |
| ---- | ---------------------- | -------------------- |
| 1    | Patient Information    | patientInformation   |
| 2    | Hearing History        | hearingHistory       |
| 3    | Symptoms Assessment    | symptomsAssessment   |
| 4    | Otoscopic Examination  | otoscopicExamination |
| 5    | Audiometric Results    | audiometricResults   |
| 6    | Tinnitus               | tinnitus             |
| 7    | Balance Assessment     | balanceAssessment    |
| 8    | Communication Impact   | communicationImpact  |
| 9    | Hearing Aid Assessment | hearingAidAssessment |
| 10   | Clinical Review        | clinicalReview       |

## Scoring Engine

### Scoring Instrument

Pure-Tone Average (PTA) calculated from air conduction thresholds at 500, 1000, 2000, and 4000 Hz (4-frequency average). The better-ear PTA determines the hearing level classification.

### Hearing Level (WHO Classification)

| Level            | PTA Range (dB HL) | Meaning                        |
| ---------------- | ----------------- | ------------------------------ |
| draft            | N/A               | Insufficient audiometric data  |
| normal           | <=25              | Normal hearing                 |
| mild             | 26-40             | Mild hearing loss              |
| moderate         | 41-55             | Moderate hearing loss          |
| moderatelySevere | 56-70             | Moderately severe hearing loss |
| severe           | 71-90             | Severe hearing loss            |
| profound         | >90               | Profound hearing loss          |

### 20 Hearing Rules (AUD-001 to AUD-020)

- **High concern (AUD-001-005):** Sudden sensorineural hearing loss, asymmetric loss >15 dB, unilateral tinnitus with hearing loss, vestibular emergency, conductive loss with active infection
- **Medium concern (AUD-006-015):** Moderate hearing loss, tinnitus sleep disruption, high tinnitus impact, recurrent dizziness with falls, communication impact, noise exposure, ototoxic medication, abnormal TM, low hearing aid satisfaction, abnormal tympanogram
- **Low concern (AUD-016-020):** Normal hearing, good hearing aid satisfaction, minimal communication impact, low tinnitus impact, no balance concerns

### 14 Additional Flags (FLAG-AUD-001 to FLAG-AUD-014)

FLAG-AUD-001 sudden hearing loss (urgent ENT), FLAG-AUD-002 acoustic neuroma screening, FLAG-AUD-003 occupational noise exposure, FLAG-AUD-004 ototoxic medication, FLAG-AUD-005 falls risk, FLAG-AUD-006 unilateral tinnitus, FLAG-AUD-007 active infection, FLAG-AUD-008 poor word recognition, FLAG-AUD-009 severe tinnitus, FLAG-AUD-010 cerumen impaction, FLAG-AUD-011 family history, FLAG-AUD-012 hearing aid candidate declined, FLAG-AUD-013 ear discharge, FLAG-AUD-014 conductive component

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Hearing Level, PTA (dB), Loss Type, Tinnitus, Hearing Aid Status.

Filters: search (patient name, loss type, hearing aid status), hearing_level, tinnitus.

## CSS Classes

- `.hearing-normal` (green) - Normal hearing
- `.hearing-mild` (lightgreen) - Mild hearing loss
- `.hearing-moderate` (yellow) - Moderate hearing loss
- `.hearing-severe` (orange) - Severe / moderately severe hearing loss
- `.hearing-profound` (red) - Profound hearing loss
- `.hearing-draft` (gray) - Draft / incomplete assessment

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5270, DB `audiology_assessment_tera_development`
- Test: port 5270, DB `audiology_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Hearing grader: empty->draft, normal thresholds, mild, moderate, severe, profound, asymmetric loss rule, noise exposure rule, normal hearing rule, rule uniqueness
- Flagged issues: no flags for normal patient, sudden hearing loss, asymmetric loss, noise exposure, ototoxic medication, falls risk, active infection, priority sorting
