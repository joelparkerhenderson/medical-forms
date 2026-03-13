# Mental Health Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive mental health assessment combining PHQ-9 depression screening, GAD-7 anxiety screening, risk assessment, and functional status evaluation.

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
    types.rs               # AssessmentData and all mental-health-specific types
    mental_health_rules.rs # 20 mental health rules (high/medium/low concern)
    mental_health_grader.rs # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, PHQ-9/GAD-7 scoring, composite score
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with mental-health-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with scores, rules, flags
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    mental_health_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) -- Form wizard
4. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
5. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                        | Section Key            |
| ---- | ---------------------------- | ---------------------- |
| 1    | Patient Information          | patientInformation     |
| 2    | Presenting Concerns          | presentingConcerns     |
| 3    | Depression Screening (PHQ-9) | depressionScreening    |
| 4    | Anxiety Screening (GAD-7)    | anxietyScreening       |
| 5    | Risk Assessment              | riskAssessment         |
| 6    | Substance Use                | substanceUse           |
| 7    | Social & Functional Status   | socialFunctionalStatus |
| 8    | Mental Health History        | mentalHealthHistory    |
| 9    | Current Treatment            | currentTreatment       |
| 10   | Clinical Review              | clinicalReview         |

## Scoring Engine

### Scoring Instruments

- **PHQ-9** (Patient Health Questionnaire-9): 9 items, each 0-3, total 0-27
- **GAD-7** (Generalised Anxiety Disorder-7): 7 items, each 0-3, total 0-21
- **Composite Score**: PHQ-9 + GAD-7 mapped to 0-100% scale

### Severity Level

| Level            | Combined Score | Meaning                     |
| ---------------- | -------------- | --------------------------- |
| draft            | N/A            | Fewer than 5 items answered |
| minimal          | 0-4            | Minimal symptoms            |
| mild             | 5-12           | Mild symptoms               |
| moderate         | 13-21          | Moderate symptoms           |
| moderatelySevere | 22-29          | Moderately severe symptoms  |
| severe           | 30-48          | Severe symptoms             |

### 20 Mental Health Rules (MH-001 to MH-020)

**High concern (MH-001 to MH-005):**

- MH-001: Active suicidal ideation (PHQ-9 Q9 >= 2)
- MH-002: PHQ-9 total >= 20 (severe depression)
- MH-003: Suicide plan or means present
- MH-004: Recent self-harm reported
- MH-005: Safeguarding concerns identified

**Medium concern (MH-006 to MH-015):**

- MH-006: PHQ-9 15-19 (moderately severe depression)
- MH-007: GAD-7 >= 15 (severe anxiety)
- MH-008: Passive suicidal ideation
- MH-009: Substance misuse with mental health condition
- MH-010: Poor social support (< 2/5)
- MH-011: Poor daily functioning (< 2/5)
- MH-012: Poor treatment response (< 2/5)
- MH-013: Medication non-adherence (< 2/5)
- MH-014: Combined moderate depression and anxiety (PHQ-9 >= 10 and GAD-7 >= 10)
- MH-015: Trauma history with current symptoms

**Low concern / positive (MH-016 to MH-020):**

- MH-016: PHQ-9 < 5 (minimal depression)
- MH-017: GAD-7 < 5 (minimal anxiety)
- MH-018: Good treatment response (>= 4/5)
- MH-019: Strong social support (>= 4/5)
- MH-020: Engaged in therapy

### 14 Additional Flags

- FLAG-RISK-001: Active suicidal ideation (urgent)
- FLAG-RISK-002: Suicide plan/means (emergency)
- FLAG-RISK-003: Recent self-harm
- FLAG-SAFE-001: Safeguarding concerns
- FLAG-PHQ-001: Severe depression (PHQ-9 >= 20)
- FLAG-PHQ-002: PHQ-9 Q9 positive (self-harm ideation)
- FLAG-GAD-001: Severe anxiety (GAD-7 >= 15)
- FLAG-SUB-001: Harmful substance use
- FLAG-FUNC-001: Severe functional impairment
- FLAG-MED-001: Medication non-adherence
- FLAG-MED-002: Significant side effects
- FLAG-HIST-001: Previous hospitalisation
- FLAG-SOCIAL-001: Social isolation (support < 2)
- FLAG-TREAT-001: Not responding to treatment

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, PHQ-9 Score, GAD-7 Score, Severity Level, Risk Level, Has Treatment.

Filters: search (patient name), severity_level, risk_level.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5470, DB `mental_health_assessment_tera_development`
- Test: port 5470, DB `mental_health_assessment_tera_test`
- Production: environment variables

## CSS Severity Classes

- `.severity-minimal` (green)
- `.severity-mild` (lightgreen)
- `.severity-moderate` (yellow)
- `.severity-moderatelySevere` (orange)
- `.severity-severe` (red)
- `.severity-draft` (gray)

## Tests

```bash
cargo test
```

19 tests covering:

- Mental health grader: empty -> draft, moderate scores -> moderate, all zeros -> minimal, all threes -> severe, low scores -> mild, severe depression rule, suicide plan rule, safeguarding rule, positive rules for minimal, rule uniqueness
- Flagged issues: no flags for low-risk patient, active suicidal ideation, suicide plan/means, recent self-harm, safeguarding concerns, severe depression, PHQ-9 Q9 positive, social isolation, priority sorting
