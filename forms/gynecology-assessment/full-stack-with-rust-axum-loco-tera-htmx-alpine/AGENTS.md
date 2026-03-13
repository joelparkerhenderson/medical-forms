# Gynecology Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for collecting and analysing gynecological assessment data using symptom severity scoring and clinical rule evaluation.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Project Structure

```
src/
  bin/main.rs              # Entry point
  lib.rs                   # Module declarations
  app.rs                   # Tera init, routes registration
  controllers/
    assessment.rs          # Landing, step forms (10 steps), report
    dashboard.rs           # Clinician dashboard with filters
  engine/
    types.rs               # AssessmentData and all gynecology-specific types
    gynecology_rules.rs    # 20 gynecology rules (high/medium/low concern)
    gynecology_grader.rs   # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, composite scoring
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with gynecology-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with severity, rules, flags
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    gynecology_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) -- Form wizard
4. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
5. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                     | Section Key            |
| ---- | ------------------------- | ---------------------- |
| 1    | Patient Information       | patientInformation     |
| 2    | Menstrual History         | menstrualHistory       |
| 3    | Gynecological Symptoms    | gynecologicalSymptoms  |
| 4    | Obstetric History         | obstetricHistory       |
| 5    | Cervical Screening        | cervicalScreening      |
| 6    | Contraception & Fertility | contraceptionFertility |
| 7    | Menopause Assessment      | menopauseAssessment    |
| 8    | Breast Health             | breastHealth           |
| 9    | Sexual Health             | sexualHealth           |
| 10   | Clinical Review           | clinicalReview         |

## Scoring Engine

### Severity Levels

| Level    | Criteria                                    |
| -------- | ------------------------------------------- |
| draft    | Fewer than 2 Likert items answered          |
| mild     | Score < 50%, no medium/high concern rules   |
| moderate | Score 50-74%, no high concern rules         |
| severe   | Score >= 75%, or medium concern rules fired |
| urgent   | Any high concern rule fired                 |

### 20 Gynecology Rules (GYN-001 to GYN-020)

- **High concern (GYN-001-005):** Suspected malignancy, severe pelvic pain (5/5), postmenopausal bleeding, abnormal cervical screening, domestic violence disclosed
- **Medium concern (GYN-006-015):** Moderate pelvic pain, severe dysmenorrhoea, dyspareunia, intermenstrual bleeding, prolapse symptoms, fertility concerns, severe vasomotor symptoms, breast symptoms, sexual health concerns, high menopause score
- **Low concern / positive (GYN-016-020):** Normal cervical screening, no significant symptoms, contraception satisfaction, low symptom scores, management plan documented

### 14 Additional Flags

FLAG-PMB-001, FLAG-CERV-001, FLAG-MALIG-001, FLAG-PAIN-001, FLAG-ENDO-001, FLAG-FERT-001, FLAG-MENO-001, FLAG-BREAST-001, FLAG-STI-001, FLAG-DV-001, FLAG-FGM-001, FLAG-CONT-001, FLAG-PROL-001, FLAG-URG-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Review Date, Diagnosis, Clinician, Severity Level, Score, Referral, Follow-up.

Filters: search (name/diagnosis/clinician), severity_level, referral_needed.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5400, DB `gynecology_assessment_tera_development`

## Tests

```bash
cargo test
```

18 tests covering:

- Gynecology grader: empty->draft, mild scores, moderate scores, severe scores, urgent (high concern), abnormal cervical screening rule, domestic violence rule, postmenopausal bleeding rule, positive rules, rule uniqueness
- Flagged issues: no flags for mild patient, postmenopausal bleeding, abnormal cervical, suspected malignancy, severe pelvic pain, domestic violence, FGM, priority sorting
