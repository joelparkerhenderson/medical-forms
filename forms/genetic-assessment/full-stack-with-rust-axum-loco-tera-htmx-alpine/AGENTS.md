# Genetic Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for clinical genetics assessment, evaluating family pedigree, genetic testing candidacy, and risk assessment for inherited conditions (cancer genetics, cardiac genetics, reproductive genetics).

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
    types.rs               # AssessmentData and all genetic-specific types
    genetic_rules.rs       # 20 genetic rules (GEN-001-020, high/medium/low concern)
    genetic_grader.rs      # calculate_risk() -> (RiskLevel, u32, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags (FLAG-GEN-001-014)
    utils.rs               # risk_level_label, count helpers, family pattern, testing status
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with genetic-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Genetic assessment report with score, rules, flags
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    genetic_grader_test.rs # 10 grading tests
    flagged_issues_test.rs # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) -- Form wizard
4. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
5. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                    | Section Key            |
| ---- | ------------------------ | ---------------------- |
| 1    | Patient Information      | patientInformation     |
| 2    | Referral Reason          | referralReason         |
| 3    | Family Pedigree          | familyPedigree         |
| 4    | Personal Medical History | personalMedicalHistory |
| 5    | Cancer Risk Assessment   | cancerRiskAssessment   |
| 6    | Cardiac Genetic Risk     | cardiacGeneticRisk     |
| 7    | Reproductive Genetics    | reproductiveGenetics   |
| 8    | Genetic Testing Status   | geneticTestingStatus   |
| 9    | Psychological Impact     | psychologicalImpact    |
| 10   | Clinical Review          | clinicalReview         |

## Scoring Engine

### Risk Level

| Level        | Score Range | Meaning                                                    |
| ------------ | ----------- | ---------------------------------------------------------- |
| draft        | N/A         | Patient name is empty (incomplete form)                    |
| lowRisk      | 0-2         | Routine follow-up                                          |
| moderateRisk | 3-5         | Genetic counselling recommended                            |
| highRisk     | 6-9         | Urgent genetic counselling referral                        |
| confirmed    | 10+         | Confirmed pathogenic variant or multiple high-risk factors |

### 20 Genetic Rules (GEN-001 through GEN-020)

- **High concern (GEN-001-005):** Confirmed pathogenic variant (BRCA1/2, Lynch, cardiac gene positive), multiple affected relatives under 50, bilateral cancer, consanguinity with affected child, known familial variant untested
- **Medium concern (GEN-006-015):** Cancer under 50, multiple primary cancers, 3+ family cancer members, Manchester score >= 15, sudden cardiac death, familial hypercholesterolemia, cardiomyopathy/aortic aneurysm, consanguinity, carrier status, VUS identified
- **Low concern (GEN-016-020):** Recurrent miscarriages, early-onset CVD, psychological readiness concerns, single affected relative over 50, previous genetic counselling

### 14 Additional Flags (FLAG-GEN-001 through FLAG-GEN-014)

FLAG-GEN-001: Urgent cancer genetics referral
FLAG-GEN-002: Cascade testing needed
FLAG-GEN-003: Reproductive counselling
FLAG-GEN-004: Psychological support
FLAG-GEN-005: Insurance implications discussed
FLAG-GEN-006: Predictive testing without support
FLAG-GEN-007: BRCA positive
FLAG-GEN-008: Lynch positive
FLAG-GEN-009: Consanguinity
FLAG-GEN-010: Sudden cardiac death
FLAG-GEN-011: VUS review
FLAG-GEN-012: Family cancer cluster
FLAG-GEN-013: Bilateral cancer
FLAG-GEN-014: Family communication concerns

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Referral Reason, Risk Level, Testing Status, Family Pattern.

Filters: search (name/referral reason/family pattern), risk_level, testing_status.

## CSS Risk Classes

- `.risk-lowRisk` (green) -- Low risk
- `.risk-moderateRisk` (yellow) -- Moderate risk
- `.risk-highRisk` (orange) -- High risk
- `.risk-confirmed` (red) -- Confirmed pathogenic variant
- `.risk-draft` (gray) -- Incomplete assessment

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5380, DB `genetic_assessment_tera_development`
- Test: port 5380, DB `genetic_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Genetic grader: empty -> draft, low risk minimal history, moderate risk cancer under 50, high risk BRCA positive, confirmed multiple factors, consanguinity with affected child, familial variant untested, multiple affected under 50, Manchester score threshold, rule uniqueness
- Flagged issues: no flags for low risk, BRCA positive flag, cascade testing, reproductive counselling, psychological support, predictive testing without counselling, sudden cardiac death, priority sorting
