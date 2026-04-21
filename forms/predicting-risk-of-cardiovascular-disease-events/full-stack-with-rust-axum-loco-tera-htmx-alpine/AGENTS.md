# Predicting Risk of Cardiovascular Disease EVENTs (PREVENT) — Full Stack with Rust Axum Loco Tera

Server-rendered web application for calculating AHA PREVENT 10-year and 30-year cardiovascular disease risk estimates using a point-based scoring system with sex-specific age coefficients.

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
    types.rs               # AssessmentData and all PREVENT-specific types
    risk_rules.rs          # 20 PVT rules (high/medium/low risk)
    risk_grader.rs         # calculate_risk() → (RiskLevel, f64, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable clinical flags
    utils.rs               # risk_category_label, estimate_ten_year_risk, estimate_thirty_year_risk, BMI, HbA1c conversion
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with PREVENT-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01–step10.html.tera # 10 step forms
  report.html.tera         # Risk report with 10yr/30yr scores, rules, flags, clinical notes
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    risk_grader_test.rs    # 10 grading tests
    flagged_issues_test.rs # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes PREVENT calculator purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1–10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                | Section Key        |
| ---- | -------------------- | ------------------ |
| 1    | Patient Information  | patientInformation |
| 2    | Demographics         | demographics       |
| 3    | Blood Pressure       | bloodPressure      |
| 4    | Cholesterol & Lipids | cholesterolLipids  |
| 5    | Metabolic Health     | metabolicHealth    |
| 6    | Renal Function       | renalFunction      |
| 7    | Smoking History      | smokingHistory     |
| 8    | Medical History      | medicalHistory     |
| 9    | Current Medications  | currentMedications |
| 10   | Review & Calculate   | reviewCalculate    |

## Scoring Engine

### Scoring Instrument

AHA PREVENT (Predicting Risk of Cardiovascular Disease EVENTs) Base model, using a point-based scoring system with sex-specific age coefficients and contributions from systolic BP, total cholesterol, HDL cholesterol, diabetes, smoking, eGFR, BMI, antihypertensive use, and statin use. Points are converted to approximate 10-year risk percentage via a scaled exponential mapping. The 30-year risk is estimated as 10-year risk multiplied by 2.5, capped at 95%.

### Risk Category

| Category     | 10-Year Risk Range | Meaning                                 |
| ------------ | ------------------ | --------------------------------------- |
| draft        | N/A                | Missing age and sex (insufficient data) |
| low          | < 5%               | Low cardiovascular risk                 |
| borderline   | 5–7.4%             | Borderline cardiovascular risk          |
| intermediate | 7.5–19.9%          | Intermediate cardiovascular risk        |
| high         | >= 20%             | High cardiovascular risk                |

### 20 PVT Risk Rules

- **High risk (PVT-001–005):** 10-year risk >= 20%, diabetes with eGFR < 30, systolic BP >= 180, >= 3 major risk factors (diabetes, smoking, BP >= 160, TC >= 280, eGFR < 45), HbA1c >= 10% with current smoking
- **Medium risk (PVT-006–015):** 10-year risk 7.5-19.9%, current smoker, diabetes present, eGFR 15-44 (CKD 3b-4), systolic BP 140-179, TC >= 240, HDL < 40, BMI >= 30, on antihypertensive, albuminuria (uACR > 30)
- **Low risk / protective (PVT-016–020):** HDL >= 60 (protective), non-smoker, normal BP (< 120/80 untreated), eGFR >= 90 (normal), BMI 18.5-24.9 (normal weight)

### 14 Additional Flags

- **High priority:** FLAG-CVD-001 (known CVD — PREVENT is primary prevention only), FLAG-AGE-001 (age outside 30-79), FLAG-BP-001 (systolic >= 180), FLAG-BP-002 (diastolic >= 120), FLAG-CHOL-001 (TC >= 300), FLAG-CHOL-002 (HDL < 30), FLAG-DM-001 (HbA1c >= 9%), FLAG-RENAL-001 (eGFR < 15), FLAG-RENAL-002 (uACR > 300), FLAG-COMBO-001 (smoking + diabetes + hypertension)
- **Medium priority:** FLAG-SMOKE-001 (>= 20 cigarettes/day), FLAG-BMI-001 (BMI >= 40), FLAG-MED-001 (intermediate/high risk without statin), FLAG-MED-002 (diabetes without diabetes medication)

Sorted by priority: high > medium > low.

### Risk Estimation Details

10-year risk uses a point-based system:

- **Age points** (sex-specific): Males 0-16 points, females 0-13 points across ages 30-79
- **Cholesterol points:** TC contribution (0-3), HDL inverse contribution (-1 to +3)
- **Blood pressure points:** Systolic BP contribution (0-5), antihypertensive use (+1)
- **Comorbidity points:** Diabetes (+3), current smoking (+3), statin use (+0.5)
- **Renal points:** eGFR contribution (0-4 based on CKD stage)
- **BMI points:** 0-3 based on obesity category

Points converted via: risk = 0.5 _ exp(0.18 _ points), clamped to 0.1-95%.

30-year risk = 10-year risk \* 2.5, capped at 95%.

## Dashboard

Columns: Patient Name, Age, Sex, Risk Category, 10-Year Risk, Diabetes, eGFR.

Filters: search (name/sex/risk category), risk_category, diabetes_status.

Sorted by risk category descending (high first).

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other full-stack forms.

## Configuration

- Development: port 5210, DB `prevent_cvd_tera_development`
- Test: port 5210, DB `prevent_cvd_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Risk grader: empty assessment returns draft, young healthy returns low risk, moderate risk returns intermediate/borderline, multiple risk factors returns high, fires smoking rule (PVT-007), fires diabetes rule (PVT-008), fires renal rule (PVT-009), fires hypertension rule (PVT-010), 30-year risk exceeds 10-year risk, all rule IDs are unique
- Flagged issues: no flags for healthy eligible patient, flags known CVD exclusion (FLAG-CVD-001), flags age outside range (FLAG-AGE-001), flags severe hypertension (FLAG-BP-001/002), flags uncontrolled diabetes (FLAG-DM-001), flags kidney failure (FLAG-RENAL-001), flags high risk without statin (FLAG-MED-001), sorts flags by priority
