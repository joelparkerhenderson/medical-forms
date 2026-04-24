# Autism Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for autism spectrum screening using the AQ-10 (Autism Spectrum Quotient) instrument alongside clinical observation of social communication, restricted/repetitive behaviours, sensory processing, developmental history, and support needs.

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
    types.rs               # AssessmentData and all autism-specific types
    likelihood_rules.rs    # 20 likelihood rules (ASD-001 to ASD-020)
    likelihood_grader.rs   # calculate_likelihood() -> (LikelihoodLevel, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # AQ-10 scoring, dimension scores, labels
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with autism-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with AQ-10, rules, flags, notes
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    likelihood_grader_test.rs # 10 grading tests
    flagged_issues_test.rs    # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                              | Section Key                    |
| ---- | ---------------------------------- | ------------------------------ |
| 1    | Patient Information                | patientInformation             |
| 2    | Developmental History              | developmentalHistory           |
| 3    | Social Communication               | socialCommunication            |
| 4    | Restricted & Repetitive Behaviours | restrictedRepetitiveBehaviours |
| 5    | Sensory Processing                 | sensoryProcessing              |
| 6    | AQ-10 Screening                    | aq10Screening                  |
| 7    | Daily Living Skills                | dailyLivingSkills              |
| 8    | Mental Health Comorbidities        | mentalHealthComorbidities      |
| 9    | Support Needs                      | supportNeeds                   |
| 10   | Clinical Review                    | clinicalReview                 |

## Scoring Engine

### Scoring Instrument

AQ-10 (Autism Spectrum Quotient - 10 item) with supplementary clinical observation scales.

### AQ-10 Scoring

Each of the 10 items uses a 0-3 response scale (definitely disagree to definitely agree):

- Items 1, 7, 8, 10: score 1 point if response >= 2 (slightly/definitely agree)
- Items 2, 3, 4, 5, 6, 9: score 1 point if response <= 1 (slightly/definitely disagree)
- Total range: 0-10

### Likelihood Level

| Level        | AQ-10 Score | Meaning                                        |
| ------------ | ----------- | ---------------------------------------------- |
| draft        | N/A         | Insufficient data to grade                     |
| unlikely     | 0-3         | Below screening threshold                      |
| possible     | 4-5         | Near threshold, clinical judgment needed       |
| likely       | 6-7         | Referral for diagnostic assessment recommended |
| highlyLikely | 8-10        | Strong indication for specialist referral      |

### Clinical Observation Scales

Social communication, restricted/repetitive behaviours, sensory processing, daily living skills, and mental health items use 0-3 scales where higher values indicate greater difficulty/intensity. These supplement the AQ-10 with dimension scores (0-100%).

### 20 Likelihood Rules (ASD-001 to ASD-020)

- **High concern (ASD-001 to ASD-005):** AQ-10 >= 8, severe sensory overload (daily), communication breakdown (social score > 80%), self-harm risk, safeguarding concern
- **Medium concern (ASD-006 to ASD-015):** AQ-10 6-7, social communication > 60%, repetitive behaviours > 60%, sensory > 60%, high anxiety, high depression, daily living difficulties, early developmental delays, weekly sensory overload, severe sleep difficulties
- **Low concern (ASD-016 to ASD-020):** AQ-10 < 6, social communication typical (< 30%), sensory typical (< 30%), repetitive behaviours typical (< 30%), no developmental concerns

### 14 Additional Flags

FLAG-SAFE-001 (safeguarding), FLAG-MH-001/002/003/004 (self-harm, anxiety, depression, sleep), FLAG-SENS-001/002 (daily/weekly sensory overload), FLAG-SUPP-001/002/003/004/005 (employment, education, relationship, housing, benefits), FLAG-DEV-001 (speech delay), FLAG-DLS-001 (executive function)

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, AQ-10 Score, Likelihood, Support Level, Referral Status.

Filters: search (patient name, referral source), likelihood_level.

## CSS Classes

- `.likelihood-unlikely` -- green (#16a34a)
- `.likelihood-possible` -- yellow (#f59e0b)
- `.likelihood-likely` -- orange (#f97316)
- `.likelihood-highlyLikely` -- red (#dc2626)
- `.likelihood-draft` -- gray (#6b7280)

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5280, DB `autism_assessment_tera_development`
- Test: port 5280, DB `autism_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Likelihood grader: empty -> draft, AQ-10 score 7 -> likely, AQ-10 score 8+ -> highlyLikely, low AQ-10 -> unlikely, AQ-10 4-5 -> possible, fires high AQ-10 rule, fires self-harm rule, fires safeguarding rule, fires low AQ-10 rule, rule ID uniqueness
- Flagged issues: no flags for clean patient, safeguarding flag, self-harm flag, daily sensory overload flag, employment support flag, severe anxiety flag, speech delay flag, priority sorting
