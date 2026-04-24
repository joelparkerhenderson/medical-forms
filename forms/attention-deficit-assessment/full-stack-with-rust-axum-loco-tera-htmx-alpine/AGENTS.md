# Attention Deficit Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for conducting adult ADHD assessments using the ASRS (Adult ADHD Self-Report Scale) v1.1 screener with comprehensive clinical evaluation.

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
    types.rs               # AssessmentData and all ADHD-specific types
    likelihood_rules.rs    # 20 ADHD rules (high/medium/low concern)
    likelihood_grader.rs   # calculate_likelihood() → (LikelihoodLevel, u8, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # likelihood_level_label, ASRS scoring, dimension scores
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with ADHD-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01–step10.html.tera # 10 step forms
  report.html.tera         # ADHD report with ASRS score, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    likelihood_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                     | Section Key              |
| ---- | ------------------------- | ------------------------ |
| 1    | Patient Information       | patientInformation       |
| 2    | Developmental History     | developmentalHistory     |
| 3    | Inattention Symptoms      | inattentionSymptoms      |
| 4    | Hyperactivity-Impulsivity | hyperactivityImpulsivity |
| 5    | ASRS Screener             | asrsScreener             |
| 6    | Functional Impact         | functionalImpact         |
| 7    | Comorbidities             | comorbidities            |
| 8    | Previous Assessment       | previousAssessment       |
| 9    | Current Management        | currentManagement        |
| 10   | Clinical Review           | clinicalReview           |

## Scoring Engine

### Scoring Instrument

ASRS Part A Screener (6 items, rated 0-4: never to very often). Items scored against WHO-validated clinical thresholds:

- Questions 1-3: threshold >= 2 (sometimes or more)
- Questions 4-6: threshold >= 3 (often or more)

### Likelihood Level

| Level        | Criteria                                      | Meaning                                        |
| ------------ | --------------------------------------------- | ---------------------------------------------- |
| draft        | N/A                                           | Fewer than 4 ASRS items answered               |
| unlikely     | 0-1 positive items                            | ADHD unlikely based on screening               |
| possible     | 2-3 positive items                            | Further evaluation recommended                 |
| likely       | 4+ positive items                             | Highly consistent with ADHD                    |
| highlyLikely | 4+ positive + severe functional impact (>75%) | ADHD highly likely with significant impairment |

### 20 ADHD Rules (ADHD-001 to ADHD-020)

- **High concern (ADHD-001–005):** ASRS >= 4 positive, severe functional impairment, comorbid substance use, driving safety concern, childhood onset confirmed
- **Medium concern (ADHD-006–015):** Inattention >50%, hyperactivity >50%, relationship impact, work/academic impact, anxiety, depression, sleep disorder, childhood symptoms without reports, cardiac screening needed, self-esteem impact
- **Low concern / positive (ADHD-016–020):** ASRS <2 positive, minimal functional impact, no childhood symptoms, effective medication, no comorbidities

### 14 Additional Flags

FLAG-DRIVE-001, FLAG-SUBST-001, FLAG-MOOD-001, FLAG-ANX-001, FLAG-CARD-001, FLAG-SLEEP-001, FLAG-WORK-001, FLAG-REL-001, FLAG-DEP-001, FLAG-SUBHX-001, FLAG-ASD-001, FLAG-BP-001, FLAG-CHILD-001, FLAG-COLLAT-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Assessment Date, ASRS Score, Likelihood, Functional Impact, Treatment Status.

Filters: search (name/date), likelihood_level, treatment_status.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5260, DB `attention_deficit_assessment_tera_development`
- Test: port 5260, DB `attention_deficit_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Likelihood grader: empty->draft, 5 positive->likely, severe impact->highlyLikely, low ASRS->unlikely, 2 positive->possible, ASRS rule fires, childhood onset rule, no comorbidity rule, substance use rule, rule uniqueness
- Flagged issues: no flags for clean assessment, driving safety, substance misuse, mood disorder, cardiac history, anxiety, sleep disorder, priority sorting
