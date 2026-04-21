# Dermatology Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive dermatology assessment evaluating skin conditions, DLQI scoring, treatment response, and quality of life impact.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Project Structure

```
src/
  bin/main.rs              # Entry point
  lib.rs                   # Module declarations
  app.rs                   # Tera init, routes registration
  controllers/
    assessment.rs          # Landing, step forms (10 steps), report
    dashboard.rs           # Dashboard with filters
  engine/
    types.rs               # AssessmentData and all dermatology-specific types
    dermatology_rules.rs   # 20 dermatology rules (high/medium/low concern)
    dermatology_grader.rs  # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, DLQI scoring, BSA calculation
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with dermatology-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with DLQI score, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    dermatology_grader_test.rs # 11 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) -- Form wizard
4. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
5. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                    | Section Key           |
| ---- | ------------------------ | --------------------- |
| 1    | Patient Information      | patientInformation    |
| 2    | Skin History             | skinHistory           |
| 3    | Current Condition        | currentCondition      |
| 4    | Affected Areas           | affectedAreas         |
| 5    | Symptom Severity         | symptomSeverity       |
| 6    | Quality of Life (DLQI)   | qualityOfLife         |
| 7    | Previous Treatments      | previousTreatments    |
| 8    | Current Treatment        | currentTreatment      |
| 9    | Triggers & Comorbidities | triggersComorbidities |
| 10   | Clinical Review          | clinicalReview        |

## Scoring Engine

### Scoring Instrument

DLQI (Dermatology Life Quality Index) -- 10 items each scored 0-3, total range 0-30.

### Severity Level

| Level      | DLQI Range | Meaning                                  |
| ---------- | ---------- | ---------------------------------------- |
| draft      | N/A        | Fewer than 3 DLQI items answered         |
| clear      | 0-1        | No effect on patient's life              |
| mild       | 2-5        | Small effect on patient's life           |
| moderate   | 6-10       | Moderate effect on patient's life        |
| severe     | 11-20      | Very large effect on patient's life      |
| verySevere | 21-30      | Extremely large effect on patient's life |

### 20 Dermatology Rules (DERM-001 to DERM-020)

- **High concern (DERM-001-005):** DLQI >= 21, BSA > 30%, severe itching+pain (both >= 8/10), signs of infection, treatment failure on systemic therapy
- **Medium concern (DERM-006-015):** DLQI 11-20, BSA 10-30%, moderate symptoms, poor treatment adherence, psoriatic arthritis, sleep disturbance >= 4, multiple treatment failures, active flare, mental health impact >= 4, scarring present
- **Low concern / positive (DERM-016-020):** DLQI 0-5, condition in remission, good treatment response (>= 4/5), regular emollient use, identified triggers managed

### 14 Additional Flags

FLAG-SEV-001 (very severe DLQI), FLAG-SEV-002 (extensive BSA), FLAG-INF-001 (infection), FLAG-PAIN-001 (severe pain), FLAG-PSYCH-001 (mental health), FLAG-TREAT-001 (treatment failures), FLAG-TREAT-002 (poor adherence), FLAG-BIO-001 (biologic candidate), FLAG-ARTH-001 (psoriatic arthritis), FLAG-CANCER-001 (skin cancer history), FLAG-NAIL-001 (nail involvement), FLAG-GENI-001 (genital involvement), FLAG-CHILD-001 (paediatric), FLAG-ADH-001 (low emollient adherence).

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Diagnosis, Severity, DLQI Score, BSA, Treatment Response.

Filters: search (patient name/diagnosis), severity_level, diagnosis.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5340, DB `dermatology_assessment_tera_development`
- Test: port 5340, DB `dermatology_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

19 tests covering:

- Dermatology grader: empty -> draft, DLQI 0 -> clear, DLQI 3 -> mild, DLQI 8 -> moderate, DLQI 15 -> severe, DLQI 30 -> verySevere, high BSA rule, severe symptoms rule, infection rule, remission positive rules, rule uniqueness
- Flagged issues: no flags for moderate patient, infection signs, severe pain, mental health impact, psoriatic arthritis, genital involvement, low emollient adherence, priority sorting
