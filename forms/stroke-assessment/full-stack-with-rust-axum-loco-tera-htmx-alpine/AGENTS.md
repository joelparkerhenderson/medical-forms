# Stroke Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for stroke assessment based on the NIHSS (National Institutes of Health Stroke Scale), evaluating stroke type, severity, risk factors, functional status, and secondary prevention.

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

Server runs on port **5620** by default.

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
    types.rs               # AssessmentData and all stroke-specific types
    stroke_rules.rs        # 20 stroke rules (STR-001 to STR-020)
    stroke_grader.rs       # calculate_severity() -> (SeverityLevel, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, calculate_nihss_total, severity_from_nihss
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with stroke-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Stroke report with NIHSS score, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    stroke_grader_test.rs  # 10 grading tests
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

| Step | Title                        | Section Key          |
| ---- | ---------------------------- | -------------------- |
| 1    | Patient Information          | patientInformation   |
| 2    | Event Details                | eventDetails         |
| 3    | NIHSS Assessment             | nihssAssessment      |
| 4    | Stroke Type & Classification | strokeClassification |
| 5    | Risk Factors                 | riskFactors          |
| 6    | Investigations               | investigations       |
| 7    | Acute Treatment              | acuteTreatment       |
| 8    | Functional Assessment        | functionalAssessment |
| 9    | Secondary Prevention         | secondaryPrevention  |
| 10   | Clinical Review              | clinicalReview       |

## Scoring Engine

### NIHSS Scoring

Total of 15 NIHSS items scored 0-2, 0-3, or 0-4 depending on the item. Maximum possible score is 42.

### Severity Levels

| Level          | NIHSS Range | Meaning                            |
| -------------- | ----------- | ---------------------------------- |
| draft          | N/A         | Fewer than 3 NIHSS items answered  |
| minor          | 0-4         | No stroke symptoms or minor stroke |
| moderate       | 5-15        | Moderate stroke                    |
| moderateSevere | 16-20       | Moderate-severe stroke             |
| severe         | 21-42       | Severe stroke                      |

### 20 Stroke Rules (STR-001 to STR-020)

- **High (STR-001-005):** NIHSS >= 16, consciousness impaired, TACI, haemorrhagic stroke, thrombolysis contraindicated but eligible
- **Medium (STR-006-015):** NIHSS 5-15, new AF, significant carotid stenosis, mRS >= 3, failed swallow, recurrent stroke/TIA, poor glucose control, uncontrolled hypertension, bilateral deficits, language impairment
- **Low (STR-016-020):** NIHSS 0-4, TIA with low risk, good recovery (mRS 0-1), secondary prevention optimised, normal swallow

### 14 Additional Flags

FLAG-ACUTE-001/002, FLAG-HAEM-001, FLAG-CONS-001, FLAG-SWALL-001, FLAG-AF-001, FLAG-CAROT-001, FLAG-RECUR-001, FLAG-BP-001, FLAG-FUNC-001, FLAG-MOOD-001, FLAG-DRIVE-001, FLAG-PREV-001, FLAG-REHAB-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Stroke Type, NIHSS Score, Severity, mRS, AF Status.

Filters: search (patient name/type), severity_level, stroke_type.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5620, DB `stroke_assessment_tera_development`
- Test: port 5620, DB `stroke_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Stroke grader: empty->draft, minor NIHSS, moderate NIHSS, moderate-severe NIHSS, severe NIHSS, consciousness rule, TACI rule, haemorrhagic rule, good recovery rule, rule uniqueness
- Flagged issues: well-managed minor stroke, haemorrhagic flag, failed swallow, AF without anticoagulation, recurrent stroke, severe functional impairment, post-stroke depression, priority sorting
