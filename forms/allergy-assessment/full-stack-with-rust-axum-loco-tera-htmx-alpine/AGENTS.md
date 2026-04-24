# Allergy Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for collecting and analysing clinical allergy assessments using severity-based composite scoring.

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
    types.rs               # AssessmentData and all allergy-specific types
    severity_rules.rs      # 20 allergy rules (ALG-001 to ALG-020)
    severity_grader.rs     # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, composite scoring, dimension scores
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with allergy-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with score, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    severity_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                  | Section Key           |
| ---- | ---------------------- | --------------------- |
| 1    | Patient Information    | patientInformation    |
| 2    | Allergy History        | allergyHistory        |
| 3    | Current Allergies      | currentAllergies      |
| 4    | Symptoms & Reactions   | symptomsReactions     |
| 5    | Environmental Triggers | environmentalTriggers |
| 6    | Food & Drug Allergies  | foodDrugAllergies     |
| 7    | Testing Results        | testingResults        |
| 8    | Current Treatment      | currentTreatment      |
| 9    | Emergency Plan         | emergencyPlan         |
| 10   | Review & Assessment    | reviewAssessment      |

## Scoring Engine

### Severity Level

| Level           | Score Range | Meaning                                             |
| --------------- | ----------- | --------------------------------------------------- |
| draft           | N/A         | Fewer than 3 severity items answered                |
| mild            | 0-24        | Minimal allergic symptoms, well controlled          |
| moderate        | 25-49       | Moderate symptoms requiring regular treatment       |
| severe          | 50-74       | Significant allergic disease with multiple concerns |
| lifeThreatening | 75-100      | Anaphylaxis risk or severe multi-system involvement |

Life-threatening is also assigned when previous anaphylaxis is combined with cardiovascular symptoms >= 4.

### 20 Allergy Rules (ALG-001 to ALG-020)

**High concern (ALG-001 to ALG-005):**

- ALG-001: Previous anaphylaxis reported
- ALG-002: Cardiovascular symptoms severity >= 4
- ALG-003: Multiple severe allergies (severity >= 4 with >= 3 categories)
- ALG-004: EpiPen not prescribed despite anaphylaxis history
- ALG-005: Drug allergy with high severity rating (>= 4)

**Medium concern (ALG-006 to ALG-015):**

- ALG-006: Respiratory symptoms >= 3
- ALG-007: Multiple allergen categories (>= 3)
- ALG-008: Unverified drug allergy
- ALG-009: No emergency plan
- ALG-010: Skin symptoms >= 3
- ALG-011: High total IgE (>= 200 kU/L)
- ALG-012: No immunotherapy despite severe allergy
- ALG-013: Both seasonal and perennial triggers
- ALG-014: Food allergy without action plan
- ALG-015: GI symptoms >= 3

**Low concern (ALG-016 to ALG-020):**

- ALG-016: Mild skin symptoms only
- ALG-017: Single known allergen
- ALG-018: Well controlled on antihistamine
- ALG-019: Regular follow-up planned
- ALG-020: Negative skin prick test

### 14 Additional Flags

- FLAG-ANA-001: Anaphylaxis history without EpiPen
- FLAG-ANA-002: Cardiovascular symptoms (systemic reaction risk)
- FLAG-DRUG-001: Unverified drug allergy
- FLAG-DRUG-002: Multiple drug allergies
- FLAG-FOOD-001: Severe food allergy without action plan
- FLAG-FOOD-002: Multiple food allergies with cross-reactivity
- FLAG-RESP-001: Severe respiratory symptoms
- FLAG-TEST-001: No allergy testing performed
- FLAG-TEST-002: High specific IgE without management plan
- FLAG-PLAN-001: No emergency plan
- FLAG-PLAN-002: Emergency plan not reviewed
- FLAG-TREAT-001: No treatment for moderate/severe allergy
- FLAG-IMM-001: Immunotherapy candidate not referred
- FLAG-PEDI-001: Paediatric patient with severe allergy

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Primary Allergen, Severity, Anaphylaxis Risk, EpiPen, Last Review.

Filters: search (patient name, allergen, date), severity_level, allergen_category.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5240, DB `allergy_assessment_tera_development`
- Test: port 5240, DB `allergy_assessment_tera_test`
- Production: environment variables

## CSS Severity Badges

- `.severity-mild` -- green (#16a34a)
- `.severity-moderate` -- yellow (#f59e0b)
- `.severity-severe` -- orange (#f97316)
- `.severity-lifeThreatening` -- red (#dc2626)
- `.severity-draft` -- gray (#6b7280)

## Tests

```bash
cargo test
```

18 tests covering:

- Severity grader: empty->draft, moderate symptoms->moderate, all-1s->mild, all-5s->lifeThreatening, high symptoms->severe, anaphylaxis rule, epiPen rule, respiratory rule, mild skin rule, rule uniqueness
- Flagged issues: no flags for mild patient, anaphylaxis without epiPen, cardiovascular symptoms, unverified drug allergy, severe respiratory, no testing, no emergency plan, priority sorting
