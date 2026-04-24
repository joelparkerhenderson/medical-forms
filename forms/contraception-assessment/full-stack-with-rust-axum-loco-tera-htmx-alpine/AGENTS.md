# Contraception Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for contraception eligibility assessment using the UKMEC (UK Medical Eligibility Criteria) framework, evaluating patient suitability for different contraceptive methods.

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
    types.rs               # AssessmentData and all contraception-specific types
    eligibility_rules.rs   # 20 eligibility rules (CONT-001 to CONT-020)
    eligibility_grader.rs  # calculate_eligibility() -> (EligibilityLevel, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # eligibility_level_label, UKMEC utilities, BMI/BP helpers
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with contraception-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Eligibility report with UKMEC categories, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    eligibility_grader_test.rs # 18 grading tests
    flagged_issues_test.rs  # 14 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                     | Section Key              |
| ---- | ------------------------- | ------------------------ |
| 1    | Patient Information       | patientInformation       |
| 2    | Reproductive History      | reproductiveHistory      |
| 3    | Medical History           | medicalHistory           |
| 4    | Cardiovascular Risk       | cardiovascularRisk       |
| 5    | Current Medications       | currentMedications       |
| 6    | Smoking & BMI             | smokingBmi               |
| 7    | Contraceptive Preferences | contraceptivePreferences |
| 8    | UKMEC Eligibility         | ukmecEligibility         |
| 9    | Counselling               | counselling              |
| 10   | Clinical Review           | clinicalReview           |

## Scoring Engine

### Scoring Instrument

UKMEC (UK Medical Eligibility Criteria) categories 1-4 assigned per contraceptive method:

- **UKMEC 1**: No restriction for use of the contraceptive method
- **UKMEC 2**: Advantages of using the method generally outweigh the risks
- **UKMEC 3**: Theoretical or proven risks usually outweigh the advantages
- **UKMEC 4**: Unacceptable health risk if the contraceptive method is used

### Eligibility Level

| Level                    | Criteria                        | Meaning                                        |
| ------------------------ | ------------------------------- | ---------------------------------------------- |
| draft                    | Insufficient data               | Not enough information to assess               |
| noContraindication       | No high/medium rules, UKMEC <=2 | Safe to use all assessed methods               |
| relativeContraindication | Medium concern rules or UKMEC 3 | Risks may outweigh advantages for some methods |
| absoluteContraindication | High concern rules or UKMEC 4   | Unacceptable risk for some methods             |

### 20 Eligibility Rules (CONT-001 to CONT-020)

- **High concern (CONT-001-005):** Migraine with aura + COC, VTE history + CHC, BP >=160/100 + CHC, current breast cancer, pregnancy possible
- **Medium concern (CONT-006-015):** Elevated BP, BMI >35, smoker >35, breastfeeding <6 weeks, enzyme-inducing drugs, VTE family history, multiple CV risk factors, breast cancer history, migraine without aura >35, SLE with antiphospholipid
- **Low concern / positive (CONT-016-020):** All UKMEC 1, full counselling complete, LARC method chosen, cervical screening up to date, follow-up scheduled

### 14 Additional Flags

FLAG-VTE-001, FLAG-MIGRAINE-001, FLAG-BP-001, FLAG-BMI-001, FLAG-BF-001, FLAG-DRUG-001, FLAG-STI-001, FLAG-CERV-001, FLAG-CANCER-001, FLAG-LIVER-001, FLAG-DM-001, FLAG-SMOKE-001, FLAG-ECTOPIC-001, FLAG-CONSENT-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Method Chosen, UKMEC Category, Eligibility, Risk Level, Last Review.

Filters: search (name/method/date), eligibility_level, risk_level.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5320, DB `contraception_assessment_tera_development`
- Test: port 5320, DB `contraception_assessment_tera_test`
- Production: environment variables

## CSS Classes

- `.eligibility-noContraindication` (green) -- safe to use
- `.eligibility-relativeContraindication` (yellow) -- caution needed
- `.eligibility-absoluteContraindication` (red) -- contraindicated
- `.eligibility-draft` (gray) -- incomplete assessment

## Tests

```bash
cargo test
```

32 tests covering:

- Eligibility grader: empty->draft, healthy->noContraindication, migraine with aura, VTE history, severe hypertension, current breast cancer, pregnancy possible, elevated BP, BMI >35, smoker >35, breastfeeding <6 weeks, enzyme-inducing drugs, all UKMEC 1, LARC chosen, counselling complete, UKMEC 4, UKMEC 3, rule ID uniqueness
- Flagged issues: no flags for safe patient, VTE risk, migraine with aura, severe hypertension, BMI >35, breastfeeding, drug interactions, STI screening, cervical screening overdue, current breast cancer, active liver disease, diabetes complications, smoker >35, priority sorting
