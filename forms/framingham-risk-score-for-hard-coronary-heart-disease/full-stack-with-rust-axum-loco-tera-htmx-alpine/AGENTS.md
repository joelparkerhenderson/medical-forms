# Framingham Risk Score for Hard Coronary Heart Disease — Full Stack with Rust Axum Loco Tera

Server-rendered web application for calculating the Framingham 10-year risk of hard coronary heart disease using the Wilson/D'Agostino 1998 Cox regression model with sex-specific coefficients.

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
    types.rs               # AssessmentData and all FRS-specific types
    risk_rules.rs          # 20 risk rules (high/medium/low)
    risk_grader.rs         # calculate_risk() → (RiskLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # risk_level_label, Framingham Cox regression, BMI, unit conversion
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with FRS-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01–step10.html.tera # 10 step forms
  report.html.tera         # Risk report with score, rules, flags, clinical notes
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    risk_grader_test.rs    # 10 grading tests
    flagged_issues_test.rs # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes calculator purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1–10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title               | Section Key        |
| ---- | ------------------- | ------------------ |
| 1    | Patient Information | patientInformation |
| 2    | Demographics        | demographics       |
| 3    | Smoking History     | smokingHistory     |
| 4    | Blood Pressure      | bloodPressure      |
| 5    | Cholesterol         | cholesterol        |
| 6    | Medical History     | medicalHistory     |
| 7    | Family History      | familyHistory      |
| 8    | Lifestyle Factors   | lifestyleFactors   |
| 9    | Current Medications | currentMedications |
| 10   | Review & Calculate  | reviewCalculate    |

## Scoring Engine

### Scoring Instrument

Wilson/D'Agostino 1998 Cox proportional hazards regression model for estimating 10-year risk of hard coronary heart disease (myocardial infarction or coronary death). Uses sex-specific coefficients with log-transformed predictors: age, total cholesterol, HDL cholesterol, systolic blood pressure (with separate treated/untreated coefficients), and smoking status. Baseline survival: 0.9402 (male), 0.98767 (female). Valid for ages 30-79 with no prior CHD or diabetes.

### Risk Category

| Category     | 10-Year Risk | Meaning                       |
| ------------ | ------------ | ----------------------------- |
| draft        | N/A          | Age and sex missing           |
| low          | < 10%        | Low 10-year risk of hard CHD  |
| intermediate | 10–19.9%     | Intermediate 10-year risk     |
| high         | >= 20%       | High 10-year risk of hard CHD |

### 20 FRS Risk Rules

- **High risk (FRS-001–005):** 10-year risk >= 20%, systolic BP >= 180, total cholesterol >= 310 mg/dL, HDL < 30 mg/dL, combined risk (age >= 60 + smoker + BP >= 140 + TC >= 240)
- **Medium risk (FRS-006–015):** 10-year risk 10-19.9%, current smoker, systolic BP 140-179, TC 240-309 mg/dL, HDL 30-39 mg/dL, on BP treatment, premature family CHD history, BMI >= 30, sedentary lifestyle, age >= 65
- **Low risk / protective (FRS-016–020):** HDL >= 60 mg/dL, non-smoker, normal BP (< 120/80 untreated), TC < 200 mg/dL, physically active (moderate/vigorous)

### 14 Additional Flags

FLAG-ELIG-001/002/003, FLAG-BP-001/002, FLAG-CHOL-001/002, FLAG-SMOKE-001, FLAG-BMI-001, FLAG-FAM-001, FLAG-MED-001/002, FLAG-LIFE-001, FLAG-AGE-001

Sorted by priority: high > medium > low.

### Unit Conversion

Cholesterol values can be entered in mg/dL or mmol/L. The engine converts mmol/L to mg/dL using the factor 38.67. BMI is calculated from height (cm) and weight (kg) if not provided directly.

## Dashboard

Columns: Patient Name, Age, Sex, Risk Level, 10-Year Risk %, Smoking Status, On Treatment.

Filters: search (name/sex), risk_level, smoking_status.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5200, DB `framingham_risk_score_tera_development`
- Test: port 5200, DB `framingham_risk_score_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Risk grader: empty→draft, young healthy female→low, older male smoker→high, elderly with risk factors→high, correct risk for male, correct risk for female, fires smoking rule, fires hypertension rule, fires high cholesterol rule, rule uniqueness
- Flagged issues: no flags for eligible healthy patient, age outside range, prior CHD, diabetes exclusion, severe hypertension, critically low HDL, high risk not on statin, priority sorting
