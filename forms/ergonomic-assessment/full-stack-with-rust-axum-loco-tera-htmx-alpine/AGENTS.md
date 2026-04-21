# Ergonomic Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for conducting workplace ergonomic assessments evaluating workstation setup, posture, musculoskeletal symptoms, manual handling risks, and DSE compliance.

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
    types.rs               # AssessmentData and all ergonomic-specific types
    risk_rules.rs          # 20 ergonomic rules (ERGO-001 to ERGO-020)
    risk_grader.rs         # calculate_risk() -> (RiskLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # risk_level_label, composite scoring, DSE compliance
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with ergonomic-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Risk report with score, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    risk_grader_test.rs    # 12 grading tests
    flagged_issues_test.rs # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                    | Section Key             |
| ---- | ------------------------ | ----------------------- |
| 1    | Patient Information      | patientInformation      |
| 2    | Occupation Details       | occupationDetails       |
| 3    | Workstation Assessment   | workstationAssessment   |
| 4    | Posture Assessment       | postureAssessment       |
| 5    | Musculoskeletal Symptoms | musculoskeletalSymptoms |
| 6    | Manual Handling          | manualHandling          |
| 7    | DSE Assessment           | dseAssessment           |
| 8    | Break Patterns           | breakPatterns           |
| 9    | Environmental Factors    | environmentalFactors    |
| 10   | Clinical Review          | clinicalReview          |

## Scoring Engine

### Scoring Instrument

Composite Risk Score derived from Likert-scale responses (1-5) across 28 items spanning workstation setup, posture, musculoskeletal symptoms, break patterns, and environmental factors. The score is converted to a 0-100 percentage scale where higher values indicate greater risk.

### Risk Level

| Level    | Score Range | Meaning                                       |
| -------- | ----------- | --------------------------------------------- |
| draft    | N/A         | Fewer than 5 items answered                   |
| low      | 0-25        | Low ergonomic risk                            |
| moderate | 26-50       | Moderate risk, changes may be needed          |
| high     | 51-75       | High risk, investigation and change needed    |
| veryHigh | 76-100      | Very high risk, implement changes immediately |

### 20 Ergonomic Rules (ERGO-001 to ERGO-020)

- **High concern (ERGO-001-005):** Severe MSD symptoms (pain level 5), RULA score >=7, heavy manual handling (>25kg), >8hrs continuous DSE, multiple pain sites (4+)
- **Medium concern (ERGO-006-015):** Posture risk >60%, symptom severity >60%, poor monitor position, poor chair, frequent lifting (>10/day), DSE compliance <50%, no breaks, poor lighting, high REBA (8-10), chronic symptoms (>12 weeks)
- **Low concern / positive (ERGO-016-020):** All workstation items 4-5, full DSE compliance, no pain reported, regular micro-breaks and stretching, all environmental factors 4-5

### 14 Additional Flags

FLAG-ADJUST-001, FLAG-OHREF-001, FLAG-MH-001/002, FLAG-DSE-001/002, FLAG-RSI-001, FLAG-ULD-001, FLAG-BACK-001, FLAG-NECK-001, FLAG-BREAK-001, FLAG-MSD-001, FLAG-HIST-001

Sorted by priority: high > medium > low.

### DSE Compliance

9-item checklist (screen, keyboard, mouse, software, eye test, training) scored as percentage of "yes" responses.

## Dashboard

Columns: Patient Name, Occupation, Risk Level, Score, Symptom Sites, DSE Compliance, Adjustment Needed.

Filters: search (name/occupation), risk_level, adjustment_needed.

## CSS Classes

- `.risk-low` — green (#16a34a)
- `.risk-moderate` — yellow (#f59e0b)
- `.risk-high` — orange (#f97316)
- `.risk-veryHigh` — red (#dc2626)
- `.risk-draft` — gray (#6b7280)

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5360, DB `ergonomic_assessment_tera_development`
- Test: port 5360, DB `ergonomic_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

21 tests covering:

- Risk grader: empty->draft, low risk workstation, all worst->veryHigh, all best->low, all threes->moderate, severe MSD rule, high RULA rule, heavy manual handling rule, continuous DSE rule, multiple pain sites rule, positive workstation rule, rule uniqueness
- Flagged issues: no flags for low risk, occupational health referral, manual handling training needed, DSE non-compliance, repetitive strain, lower back pain, neck pain, previous MSD history, priority sorting
