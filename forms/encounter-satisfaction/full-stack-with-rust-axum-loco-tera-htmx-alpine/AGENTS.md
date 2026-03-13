# Encounter Satisfaction — Full Stack with Rust Axum Loco Tera

Server-rendered web application for collecting and analysing patient encounter satisfaction surveys using Likert-scale composite scoring.

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
    types.rs               # AssessmentData and all satisfaction-specific types
    satisfaction_rules.rs   # 20 satisfaction rules (high/medium/low concern)
    satisfaction_grader.rs  # calculate_satisfaction() → (SatisfactionLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # satisfaction_level_label, composite scoring, NPS category
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with satisfaction-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01–step10.html.tera # 10 step forms
  report.html.tera         # Satisfaction report with score, rules, flags, comments
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    satisfaction_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes survey purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1–10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed surveys with filters

## 10 Assessment Steps

| Step | Title                   | Section Key          |
| ---- | ----------------------- | -------------------- |
| 1    | Visit Information       | visitInformation     |
| 2    | Wait Time & Access      | waitTimeAccess       |
| 3    | Communication           | communication        |
| 4    | Care Quality            | careQuality          |
| 5    | Staff Interaction       | staffInteraction     |
| 6    | Environment             | environment          |
| 7    | Medication & Treatment  | medicationTreatment  |
| 8    | Discharge & Follow-up   | dischargeFollowUp    |
| 9    | Overall Experience      | overallExperience    |
| 10   | Demographics & Comments | demographicsComments |

## Scoring Engine

### Scoring Instrument

Composite Satisfaction Score derived from Likert-scale responses (1-5) across 43 items spanning 8 dimensions. The score is converted to a 0-100 percentage scale.

### Satisfaction Level

| Level            | Score Range | Meaning                                      |
| ---------------- | ----------- | -------------------------------------------- |
| draft            | N/A         | Fewer than 5 items answered                  |
| veryDissatisfied | 0-20        | Critical dissatisfaction across dimensions   |
| dissatisfied     | 21-40       | Below-average satisfaction                   |
| neutral          | 41-60       | Average/mixed satisfaction                   |
| satisfied        | 61-80       | Above-average satisfaction                   |
| verySatisfied    | 81-100      | Excellent satisfaction across all dimensions |

### 20 Satisfaction Rules

- **High concern (SR-001–005):** Overall rated 1, NPS detractor (0-3), communication <40%, care quality <40%, pain management rated 1
- **Medium concern (SR-006–015):** Wait time, cleanliness, privacy, professionalism, discharge instructions, NPS passive (4-6), side effects, time adequacy, reception courtesy issues
- **Low concern / positive (SR-016–020):** NPS promoter (9-10), overall rated 5, would return (5), all communication 4-5, expectations exceeded

### 14 Additional Flags

FLAG-WAIT-001/002, FLAG-COMM-001/002, FLAG-CARE-001/002, FLAG-STAFF-001, FLAG-ENV-001/002, FLAG-MED-001, FLAG-DISC-001/002, FLAG-NPS-001, FLAG-DEMO-001

Sorted by priority: high > medium > low.

### Net Promoter Score (NPS)

Separate 0-10 scale (likelihood_to_recommend) categorised as:

- **Detractor** (0-6), **Passive** (7-8), **Promoter** (9-10)

## Dashboard

Columns: Visit Date, Department, Provider, Satisfaction Level, Score, NPS Category, Would Return.

Filters: search (date/department/provider), satisfaction_level, nps_category.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as patient-intake.

## Configuration

- Development: port 5180, DB `encounter_satisfaction_tera_development`
- Test: port 5180, DB `encounter_satisfaction_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Satisfaction grader: empty→draft, all-4s→satisfied, all-5s→verySatisfied, all-1s→veryDissatisfied, all-3s→neutral, NPS detractor/promoter rules, communication concern, positive communication rules, rule uniqueness
- Flagged issues: no flags for satisfied patient, excessive wait, provider not listening, no confidence, cleanliness concern, disability flag, priority sorting
