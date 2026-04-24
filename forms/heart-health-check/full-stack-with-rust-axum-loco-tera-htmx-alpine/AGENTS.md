# Heart Health Check — Full Stack with Rust Axum Loco Tera

Server-rendered web application for conducting NHS Heart Health Checks using QRISK3-based cardiovascular risk assessment with 10-year CVD risk estimation and heart age calculation.

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
    types.rs               # AssessmentData and all cardiovascular-specific types
    risk_rules.rs          # 20 HHC rules (high/medium/low risk)
    risk_grader.rs         # calculate_risk() → (RiskLevel, f64, Option<u8>, Vec<FiredRule>)
    flagged_issues.rs      # 13 actionable clinical flags
    utils.rs               # risk_category_label, estimate_ten_year_risk, calculate_heart_age, BMI, TC/HDL ratio
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with cardiovascular-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01–step10.html.tera # 10 step forms
  report.html.tera         # Risk report with score, heart age, rules, flags, clinical notes
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    risk_grader_test.rs    # 10 grading tests
    flagged_issues_test.rs # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes NHS Heart Health Check purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                    | Section Key           |
| ---- | ------------------------ | --------------------- |
| 1    | Patient Information      | patientInformation    |
| 2    | Demographics & Ethnicity | demographicsEthnicity |
| 3    | Blood Pressure           | bloodPressure         |
| 4    | Cholesterol              | cholesterol           |
| 5    | Medical Conditions       | medicalConditions     |
| 6    | Family History           | familyHistory         |
| 7    | Smoking & Alcohol        | smokingAlcohol        |
| 8    | Physical Activity & Diet | physicalActivityDiet  |
| 9    | Body Measurements        | bodyMeasurements      |
| 10   | Review & Calculate       | reviewCalculate       |

## Scoring Engine

### Scoring Instrument

Simplified QRISK3-based point scoring system. Multiple clinical and lifestyle factors contribute points, which are mapped to a 10-year CVD risk percentage via an exponential function calibrated so ~8 points maps to ~3%, ~15 points to ~6%, ~25 points to ~12%, and ~35+ points to ~25%+. The result is clamped to 0.1–95.0%.

### Risk Categories

| Category | 10-Year Risk | Meaning                      |
| -------- | ------------ | ---------------------------- |
| draft    | N/A          | Age and sex both missing     |
| low      | <10%         | Low cardiovascular risk      |
| moderate | 10–19.9%     | Moderate cardiovascular risk |
| high     | >=20%        | High cardiovascular risk     |

### Heart Age Calculation

Heart age finds the age at which an otherwise-average person (non-smoker, normal BP 120 mmHg, TC/HDL ratio 4.0, same sex) would have the same 10-year risk as the patient. Searches ages 25–100; if risk exceeds all baseline ages, returns 100.

### 20 HHC Risk Rules

- **High risk (HHC-001–005):** 10-year risk >=20%, type 1 diabetes age 40+, systolic BP >=180 (hypertensive crisis), CKD with diabetes, three or more major risk factors
- **Medium risk (HHC-006–015):** 10-year risk 10–19.9%, current smoker, type 2 diabetes, atrial fibrillation, systolic BP 140–179, TC/HDL ratio >=6, CKD stage 3+, BMI >=30, family CVD under 60, heart age 10+ years above chronological
- **Low risk / positive (HHC-016–020):** Non-smoker, normal BP (<120/80) without treatment, optimal TC/HDL ratio (<4), physically active (150+ min/week), normal BMI (18.5–24.9)

### 13 Additional Flags

FLAG-AGE-001, FLAG-BP-001/002, FLAG-CHOL-001, FLAG-DM-001, FLAG-CKD-001, FLAG-SMOKE-001, FLAG-AF-001, FLAG-BMI-001, FLAG-AUDIT-001, FLAG-HEART-001, FLAG-MED-001, FLAG-INACT-001

Sorted by priority: high > medium > low.

### Risk Factor Points

Key contributors to the point-based risk estimate:

- **Age:** (age - 25) _ 0.8 (male) or _ 0.6 (female)
- **Smoking:** heavy 15, moderate 10, light 5, ex-smoker 2
- **Systolic BP:** (SBP - 100) \* 0.15; +5 if BP variability SD > 10
- **TC/HDL ratio:** (ratio - 3) \* 3
- **Diabetes:** type 1 = 20, type 2 = 15
- **AF:** 10, **CKD:** 10, **RA:** 5, **Family CVD <60:** 10
- **BMI >25:** (BMI - 25) \* 0.5
- **Townsend deprivation >0:** townsend \* 1.5
- **Medications:** BP treatment +3, atypical antipsychotic +3, corticosteroids +5
- **Other:** migraine +3, severe mental illness +3, erectile dysfunction (male) +5

## Dashboard

Columns: Patient Name, Age, Sex, Risk Category, 10-Year Risk, Heart Age, Smoking.

Filters: search (patient name/sex), risk_category, smoking_status.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5220, DB `heart_health_check_tera_development`
- Test: port 5220, DB `heart_health_check_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Risk grader: empty assessment returns draft, young healthy returns low risk, older with risk factors returns moderate, multiple major factors returns high, heart age older than chronological for high-risk, heart age younger/equal for healthy, fires smoking rule (HHC-007), fires diabetes rule (HHC-008), fires AF rule (HHC-009), all rule IDs unique
- Flagged issues: no flags for eligible healthy patient, age outside 25-84 range, severe hypertension (BP 180+), morbid obesity (BMI 40+), heavy smoker (20+ cigarettes/day), AF anticoagulation review, high AUDIT score (16+), priority sorting (high first)
