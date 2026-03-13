# Cognitive Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for cognitive function screening using MMSE (Mini-Mental State Examination) and MoCA (Montreal Cognitive Assessment) for dementia screening.

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
    types.rs               # AssessmentData and all cognitive-specific types
    cognitive_rules.rs     # 20 cognitive rules (high/medium/low concern)
    cognitive_grader.rs    # calculate_cognitive_status() -> (ImpairmentLevel, u8, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # impairment_level_label, MMSE/MoCA scoring, domain scores
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with cognitive-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Cognitive report with MMSE, MoCA, rules, flags
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    cognitive_grader_test.rs # 10 grading tests
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
| 2    | Cognitive History        | cognitiveHistory      |
| 3    | Orientation              | orientation           |
| 4    | Registration & Attention | registrationAttention |
| 5    | Recall                   | recall                |
| 6    | Language                 | language              |
| 7    | Visuospatial             | visuospatial          |
| 8    | Executive Function       | executiveFunction     |
| 9    | Functional Assessment    | functionalAssessment  |
| 10   | Clinical Review          | clinicalReview        |

## Scoring Engine

### Scoring Instruments

- **MMSE** (Mini-Mental State Examination): 30-point scale covering orientation (10), registration (3), attention (5), recall (3), language (6), visuospatial (1), and command following (2).
- **MoCA** (Montreal Cognitive Assessment): 30-point supplementary scale covering visuospatial/executive (5), executive function (6), orientation (6), recall (3), language (3), attention (5), registration (2).

### Impairment Level (based on MMSE)

| Level              | MMSE Score | Meaning                       |
| ------------------ | ---------- | ----------------------------- |
| draft              | N/A        | Fewer than 5 items answered   |
| normal             | 24-30      | Normal cognitive function     |
| mildImpairment     | 19-23      | Mild cognitive impairment     |
| moderateImpairment | 10-18      | Moderate cognitive impairment |
| severeImpairment   | 0-9        | Severe cognitive impairment   |

### 20 Cognitive Rules (COG-001 to COG-020)

- **High concern (COG-001-005):** MMSE <10, rapid decline, safety awareness impaired, wandering risk (place disorientation), unable to self-care
- **Medium concern (COG-006-015):** MMSE 10-18, significant disorientation, complete recall failure, severely impaired attention, unable to name objects, medication management failure, financial management failure, transport inability, verbal fluency zero, clock drawing failure
- **Low concern / positive (COG-016-020):** MMSE >=24, full orientation, full recall, fully independent functionally, stable/improving cognition

### 14 Additional Flags

FLAG-SAFE-001, FLAG-DRIVE-001, FLAG-MED-001, FLAG-FALL-001, FLAG-CARER-001, FLAG-CAPACITY-001, FLAG-DECLINE-001, FLAG-WANDER-001, FLAG-FINANCE-001, FLAG-NUTRITION-001, FLAG-HYGIENE-001, FLAG-LANG-001, FLAG-EXEC-001, FLAG-HOUSE-001

Sorted by priority: high > medium > low.

### Flag Categories

- **Safety:** Impaired safety awareness, falls risk
- **Driving:** Cognitive impairment with transport inability
- **Medication:** Cannot manage medications independently
- **Carer:** Multiple functional dependencies
- **Capacity:** Moderate-severe impairment requiring capacity assessment
- **Wandering:** Disoriented to building/floor
- **Finance:** Financial vulnerability
- **Nutrition:** Cannot prepare meals
- **Hygiene:** Personal care support needed
- **Language:** Severe language impairment
- **Executive:** Severe executive dysfunction

## Dashboard

Columns: Patient Name, MMSE Score, MoCA Score, Severity Level, Decline Rate.

Filters: search (patient name), severity_level, decline_rate.

## CSS Classes

- `.impairment-normal` (green) - Normal cognition
- `.impairment-mildImpairment` (yellow) - Mild impairment
- `.impairment-moderateImpairment` (orange) - Moderate impairment
- `.impairment-severeImpairment` (red) - Severe impairment
- `.impairment-draft` (gray) - Draft/incomplete

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5300, DB `cognitive_assessment_tera_development`
- Test: port 5300, DB `cognitive_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Cognitive grader: empty->draft, perfect->normal, all-zeros->severeImpairment, score-21->mildImpairment, score-15->moderateImpairment, rapid decline rule, normal cognition rule, full orientation rule, full recall rule, rule uniqueness
- Flagged issues: no flags for normal patient, safety concern, medication management, rapid decline, wandering risk, carer strain, financial vulnerability, priority sorting
