# Asthma Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for clinical asthma assessment based on GINA (Global Initiative for Asthma) guidelines, evaluating symptom control, lung function, exacerbation risk, and treatment step.

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
    types.rs               # AssessmentData and all asthma-specific types
    asthma_rules.rs        # 20 asthma rules (AST-001 to AST-020, high/medium/low concern)
    asthma_grader.rs       # calculate_control() -> (ControlLevel, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # control_level_label, GINA criteria counting, FEV1 calculations
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with asthma-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with control level, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    asthma_grader_test.rs  # 16 grading tests
    flagged_issues_test.rs # 12 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                    | Section Key           |
| ---- | ------------------------ | --------------------- |
| 1    | Patient Information      | patientInformation    |
| 2    | Asthma History           | asthmaHistory         |
| 3    | Symptom Assessment       | symptomAssessment     |
| 4    | Lung Function            | lungFunction          |
| 5    | Triggers & Exacerbations | triggersExacerbations |
| 6    | Current Medications      | currentMedications    |
| 7    | Inhaler Technique        | inhalerTechnique      |
| 8    | Comorbidities            | comorbidities         |
| 9    | Lifestyle & Environment  | lifestyleEnvironment  |
| 10   | Review & Management Plan | reviewManagementPlan  |

## Scoring Engine

### GINA Control Level

Based on 4 GINA criteria assessed over the past 4 weeks:

1. Daytime symptoms >2/week
2. Any night waking due to asthma
3. Reliever use >2/week
4. Any activity limitation

| Level            | Criteria Met | Meaning                                          |
| ---------------- | ------------ | ------------------------------------------------ |
| draft            | N/A          | Insufficient data (no symptom criteria answered) |
| wellControlled   | 0            | No GINA criteria met                             |
| partlyControlled | 1-2          | Some criteria met                                |
| uncontrolled     | 3-4          | Most/all criteria met                            |

### 20 Asthma Rules (AST-001 to AST-020)

- **High concern (AST-001-005):** Uncontrolled symptoms (>=3 GINA criteria), previous ICU admission, FEV1 <60% predicted, >=3 exacerbations/year, oral steroid >=2 courses/year
- **Medium concern (AST-006-015):** Partly controlled, night waking >=2/week, reliever use >2/week, peak flow <80% best, poor inhaler technique (<3/5), low preventer adherence, exercise limitation, smoking, rhinitis comorbidity, emergency visit in past year
- **Low concern / positive (AST-016-020):** Well controlled, good inhaler technique (>=4/5), action plan provided, FEV1 >80%, non-smoker

### 14 Additional Flags

FLAG-CTRL-001/002, FLAG-EXAC-001/002, FLAG-LUNG-001, FLAG-MED-001/002, FLAG-TECH-001, FLAG-SMOKE-001, FLAG-ICU-001, FLAG-STEP-001, FLAG-PLAN-001, FLAG-COMOR-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Control Level, GINA Step, FEV1 %, Exacerbations, Action Plan.

Filters: search (patient name), control_level, gina_step.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5250, DB `asthma_assessment_tera_development`
- Test: port 5250, DB `asthma_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

28 tests covering:

- Asthma grader: empty->draft, well controlled (0 criteria), partly controlled (1 criterion), partly controlled (2 criteria), uncontrolled (3 criteria), uncontrolled (4 criteria), ICU admission rule, low FEV1 rule, frequent exacerbations rule, oral steroid rule, good inhaler technique rule, action plan rule, non-smoker rule, smoker rule, rule uniqueness, FEV1 >80% rule
- Flagged issues: no flags for well controlled, frequent exacerbations, emergency visit, severe FEV1, no preventer despite symptoms, poor inhaler technique, current smoker, ICU history, no action plan, multiple comorbidities, GINA step 4 specialist referral, priority sorting
