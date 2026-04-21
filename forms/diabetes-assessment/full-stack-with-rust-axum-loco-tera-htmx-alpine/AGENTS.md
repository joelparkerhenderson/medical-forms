# Diabetes Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive diabetes management assessment evaluating glycaemic control, complications screening, medication management, and self-care behaviours for type 1 and type 2 diabetes.

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
    types.rs               # AssessmentData and all diabetes-specific types
    diabetes_rules.rs      # 20 diabetes rules (DM-001 to DM-020)
    diabetes_grader.rs     # calculate_control() -> (ControlLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # control_level_label, composite scoring, HbA1c conversion
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with diabetes-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with score, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    diabetes_grader_test.rs # 17 grading tests
    flagged_issues_test.rs  # 11 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) -- Form wizard
4. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
5. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                   | Section Key            |
| ---- | ----------------------- | ---------------------- |
| 1    | Patient Information     | patientInformation     |
| 2    | Diabetes History        | diabetesHistory        |
| 3    | Glycaemic Control       | glycaemicControl       |
| 4    | Medications             | medications            |
| 5    | Complications Screening | complicationsScreening |
| 6    | Cardiovascular Risk     | cardiovascularRisk     |
| 7    | Self-Care & Lifestyle   | selfCareLifestyle      |
| 8    | Psychological Wellbeing | psychologicalWellbeing |
| 9    | Foot Assessment         | footAssessment         |
| 10   | Review & Care Plan      | reviewCarePlan         |

## Scoring Engine

### Scoring Instrument

Composite Control Score based on HbA1c (primary driver, 40% weight), medication adherence, diet adherence, time in range, with complication burden penalties. Score is on a 0-100 scale.

### Control Level

| Level          | Score Range | Meaning                                       |
| -------------- | ----------- | --------------------------------------------- |
| draft          | N/A         | Insufficient data to grade                    |
| veryPoor       | 0-20        | Critical glycaemic failure with complications |
| poor           | 21-40       | Significant control issues                    |
| suboptimal     | 41-60       | Above-target HbA1c or multiple risk factors   |
| wellControlled | 61-100      | At-target HbA1c with good self-care           |

### 20 Diabetes Rules (DM-001 to DM-020)

- **High concern (DM-001-005):** HbA1c >= 86 mmol/mol (>= 10%), severe hypoglycaemia, active foot ulcer, proliferative retinopathy, eGFR < 30
- **Medium concern (DM-006-015):** HbA1c 64-85, recurrent hypoglycaemia, background retinopathy, eGFR 30-59, microalbuminuria, neuropathy symptoms, poor medication adherence, BMI >= 35, poor diet adherence, high diabetes distress
- **Low concern / positive (DM-016-020):** HbA1c at target, no complications, good self-care (>= 4/5), physically active, good psychological wellbeing

### 14 Additional Flags

FLAG-HBA1C-001/002, FLAG-HYPO-001/002, FLAG-FOOT-001/002, FLAG-EYE-001/002, FLAG-RENAL-001/002, FLAG-CVD-001, FLAG-PSYCH-001, FLAG-MED-001, FLAG-SELF-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Diabetes Type, HbA1c, Control Level, Complications, Last Review.

Filters: search (name/type/date), control_level, diabetes_type.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5350, DB `diabetes_assessment_tera_development`
- Test: port 5350, DB `diabetes_assessment_tera_test`
- Production: environment variables

## CSS

- `.control-wellControlled` (green)
- `.control-suboptimal` (yellow)
- `.control-poor` (orange)
- `.control-veryPoor` (red)
- `.control-draft` (gray)

## Tests

```bash
cargo test
```

28 tests covering:

- Diabetes grader: empty->draft, well-controlled HbA1c, critically high HbA1c->veryPoor, severe hypoglycaemia rule, foot ulcer rule, retinopathy rule, renal impairment rule, positive rules (at-target, no complications, good self-care, physically active, good wellbeing), poor adherence rule, high BMI rule, high distress rule, rule uniqueness, suboptimal HbA1c
- Flagged issues: no flags for well-controlled, critically elevated HbA1c, severe hypoglycaemia, active foot ulcer, proliferative retinopathy, low eGFR, macroalbuminuria, CVD without prevention, severe distress, overdue eye screening, priority sorting
