# Cardiology Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive cardiology assessment evaluating cardiac symptoms, risk factors, ECG findings, echocardiography results, functional status (NYHA class), and management plan.

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
    types.rs               # AssessmentData and all cardiology-specific types
    severity_rules.rs      # 20 severity rules (CARD-001 to CARD-020)
    severity_grader.rs     # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, scoring, risk factor counting
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with cardiology-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with severity, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    severity_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                | Section Key         |
| ---- | -------------------- | ------------------- |
| 1    | Patient Information  | patientInformation  |
| 2    | Cardiac History      | cardiacHistory      |
| 3    | Symptoms Assessment  | symptomsAssessment  |
| 4    | Risk Factors         | riskFactors         |
| 5    | Physical Examination | physicalExamination |
| 6    | ECG Findings         | ecgFindings         |
| 7    | Echocardiography     | echocardiography    |
| 8    | Investigations       | investigations      |
| 9    | Current Treatment    | currentTreatment    |
| 10   | Clinical Review      | clinicalReview      |

## Scoring Engine

### Severity Levels

| Level    | Score Range | Meaning                                         |
| -------- | ----------- | ----------------------------------------------- |
| draft    | N/A         | Insufficient clinical data for grading          |
| low      | 0-39        | Stable cardiac condition, routine follow-up     |
| moderate | 40-59       | Moderate cardiac concern, closer monitoring     |
| high     | 60-79       | Significant cardiac concern, active management  |
| critical | 80-100      | Critical cardiac condition, urgent intervention |

### Severity Score

Composite score (0-100) based on:

- NYHA functional class (30% weight)
- Left ventricular ejection fraction (30% weight)
- Symptom burden (20% weight)
- Cardiovascular risk factors (20% weight)

Score is adjusted upward when high-concern rules fire.

### 20 Severity Rules (CARD-001 to CARD-020)

- **High concern (CARD-001-005):** LVEF <35%, NYHA class IV, acute typical chest pain, new AF with rapid rate, syncope with structural heart disease
- **Medium concern (CARD-006-015):** LVEF 35-49%, NYHA class III, ST changes, significant valvular disease, uncontrolled hypertension (>=160), elevated troponin, elevated BNP, new murmur, multiple risk factors (>=4), CKD with heart failure
- **Low concern (CARD-016-020):** LVEF >=50%, NYHA class I, normal ECG, well-controlled risk factors (<=1), stable on treatment

### 14 Additional Flags

- FLAG-ACS-001: Acute chest pain (emergency pathway)
- FLAG-HF-001: Severe heart failure (LVEF <30%)
- FLAG-HF-002: Decompensated heart failure
- FLAG-AF-001: New/uncontrolled AF
- FLAG-SYNC-001: Syncope (risk of SCD)
- FLAG-ECG-001: Critical ECG abnormality
- FLAG-VALVE-001: Severe valvular disease
- FLAG-BP-001: Hypertensive crisis (>=180/120)
- FLAG-TROP-001: Elevated troponin
- FLAG-BNP-001: Significantly elevated BNP
- FLAG-PACE-001: Pacemaker/ICD candidate
- FLAG-ANGIO-001: Needs coronary angiography
- FLAG-ANTI-001: AF without anticoagulation
- FLAG-MED-001: Not on guideline-directed medical therapy

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Primary Diagnosis, Severity, NYHA Class, LVEF, Heart Rhythm.

Filters: search (name/diagnosis/NYHA), severity_level, primary_diagnosis.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5290, DB `cardiology_assessment_tera_development`
- Test: port 5290, DB `cardiology_assessment_tera_test`
- Production: environment variables

## CSS Severity Classes

- `.severity-low` -- green (#16a34a)
- `.severity-moderate` -- yellow (#f59e0b)
- `.severity-high` -- orange (#f97316)
- `.severity-critical` -- red (#dc2626)
- `.severity-draft` -- gray (#6b7280)

## Tests

```bash
cargo test
```

19 tests covering:

- Severity grader: empty->draft, preserved EF+NYHA I->low, severe HF->high/critical, ACS rule, ST changes rule, uncontrolled hypertension rule, elevated troponin rule, normal ECG rule, multiple risk factors rule, rule uniqueness
- Flagged issues: no flags for stable patient, acute chest pain, severe HF, decompensated HF, syncope, hypertensive crisis, elevated troponin, AF without anticoagulation, priority sorting
