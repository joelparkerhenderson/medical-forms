# SCORE2-Diabetes — Full Stack with Rust Axum Loco Tera

Server-rendered web application for SCORE2-Diabetes cardiovascular risk assessment in patients with type 2 diabetes, based on ESC 2023 guidelines. Evaluates 10-year CVD risk using clinical, metabolic, and lifestyle factors.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Technology Stack

| Tool       | Version | Purpose                           |
| ---------- | ------- | --------------------------------- |
| Rust       | 1.9     | Programming language edition 2024 |
| axum       | 0.8     | Web application framework         |
| Loco       | 0.16    | Web application framework         |
| Tera       | 1.20    | Template engine                   |
| SeaORM     | 1.1     | Object relational mapper          |
| PostgreSQL | 18.3    | Database server                   |

## Quick Start

```bash
cargo build
cargo test
```

To run the development server (requires PostgreSQL):

```bash
cargo loco start
```

Server runs on port **5190** by default.

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
    types.rs               # AssessmentData and all SCORE2-Diabetes types
    risk_rules.rs          # 20 CVR rules (high/medium/low risk)
    risk_grader.rs         # calculate_risk() → (RiskCategory, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable clinical flags
    utils.rs               # risk_category_label, BMI, HbA1c conversion, CKD staging
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with CVD-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01–step10.html.tera # 10 step forms
  report.html.tera         # Risk report with category, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    risk_grader_test.rs    # 10 grading tests
    flagged_issues_test.rs # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                   | Section Key            |
| ---- | ----------------------- | ---------------------- |
| 1    | Patient Demographics    | patientDemographics    |
| 2    | Diabetes History        | diabetesHistory        |
| 3    | Cardiovascular History  | cardiovascularHistory  |
| 4    | Blood Pressure          | bloodPressure          |
| 5    | Lipid Profile           | lipidProfile           |
| 6    | Renal Function          | renalFunction          |
| 7    | Lifestyle Factors       | lifestyleFactors       |
| 8    | Current Medications     | currentMedications     |
| 9    | Complications Screening | complicationsScreening |
| 10   | Risk Assessment Summary | riskAssessmentSummary  |

## Risk Engine

### Risk Category

| Category | Meaning                    | Mapping                              |
| -------- | -------------------------- | ------------------------------------ |
| draft    | Insufficient data          | Empty name, DOB, HbA1c, and BP       |
| low      | Low 10-year CVD risk       | No rules fired                       |
| moderate | Moderate 10-year CVD risk  | Only low-level rules fired           |
| high     | High 10-year CVD risk      | At least one medium-level rule fired |
| veryHigh | Very high 10-year CVD risk | At least one high-level rule fired   |

### 20 CVR Rules

- **High risk (CVR-001–007):** Established CVD (MI/stroke/TIA/PAD/HF), systolic BP ≥180, HbA1c ≥75 mmol/mol, eGFR <30, total cholesterol ≥8.0, proliferative/maculopathy retinopathy, diabetes duration ≥20 years
- **Medium risk (CVR-008–017):** Systolic BP 140–179, HbA1c 53–74 mmol/mol, LDL ≥2.6, current smoker, eGFR 30–59, albuminuria (ACR ≥3), BMI ≥30, atrial fibrillation, family CVD history, low HDL (<1.0 male / <1.2 female)
- **Low risk (CVR-018–020):** Sedentary lifestyle, background retinopathy, triglycerides ≥2.3

### 14 Additional Flags

FLAG-BP-001 (hypertensive crisis), FLAG-BP-002 (BP not at target on treatment), FLAG-HBA1C-001 (HbA1c ≥86), FLAG-MED-001 (CVD without SGLT2i/GLP1-RA), FLAG-MED-002 (CVD without statin), FLAG-MED-003 (albuminuria without ACEi/ARB), FLAG-MED-004 (type 2 without metformin), FLAG-SCREEN-001 (retinopathy not screened), FLAG-SCREEN-002 (abnormal foot exam), FLAG-SCREEN-003 (foot ulcer history), FLAG-BMI-001 (BMI ≥40), FLAG-SMOKE-001 (current smoker), FLAG-RENAL-001 (eGFR <30), FLAG-CVD-001 (active CV symptoms)

Sorted by priority: high > medium > low.

### Utility Functions

- `risk_category_label()` — Human-readable risk category name
- `calculate_bmi()` — BMI from height (cm) and weight (kg)
- `calculate_age()` — Age from date of birth (YYYY-MM-DD)
- `diabetes_duration()` — Duration from explicit value or age minus diagnosis age
- `has_established_cvd()` — Prior MI, stroke, TIA, PAD, or HF
- `hba1c_mmol_mol()` — Convert HbA1c percent to mmol/mol using IFCC formula
- `ckd_stage_from_egfr()` — CKD stage (G1–G5) from eGFR value
- `is_likely_draft()` — Draft detection (empty name, DOB, HbA1c, and BP)

## Dashboard

Columns: NHS Number, Patient Name, Risk Category, Diabetes Type, HbA1c, Established CVD.

Filters: search (NHS number/patient name), risk_category, diabetes_type.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other full-stack forms.

## Configuration

- Development: port 5190, DB `score2_diabetes_tera_development`
- Test: port 5190, DB `score2_diabetes_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Risk grader: empty→draft, healthy→low, established CVD→veryHigh, elevated BP→high, severe renal→veryHigh, very poor glycaemic→veryHigh, smoking rule, obesity rule, high-risk patient with many rules, rule uniqueness (20 unique IDs)
- Flagged issues: no flags for healthy patient, hypertensive crisis, CVD without SGLT2i/GLP1-RA, CVD without statin, retinopathy not screened, abnormal foot exam, current smoker, priority sorting
