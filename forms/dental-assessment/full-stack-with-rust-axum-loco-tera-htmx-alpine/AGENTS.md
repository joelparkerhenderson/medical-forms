# Dental Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive dental assessment evaluating oral health status, periodontal condition, dental caries risk, treatment needs, and oral hygiene habits.

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
    types.rs               # AssessmentData and all dental-specific types
    dental_rules.rs        # 20 dental rules (DENT-001 to DENT-020)
    dental_grader.rs       # calculate_oral_health() -> (OralHealthStatus, Option<u8>, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # oral_health_status_label, DMFT calculation, severity scoring
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with dental-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Dental report with DMFT, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    dental_grader_test.rs  # 12 grading tests
    flagged_issues_test.rs # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                  | Section Key           |
| ---- | ---------------------- | --------------------- |
| 1    | Patient Information    | patientInformation    |
| 2    | Dental History         | dentalHistory         |
| 3    | Oral Examination       | oralExamination       |
| 4    | Periodontal Assessment | periodontalAssessment |
| 5    | Caries Assessment      | cariesAssessment      |
| 6    | Occlusion & TMJ        | occlusionTmj          |
| 7    | Oral Hygiene           | oralHygiene           |
| 8    | Radiographic Findings  | radiographicFindings  |
| 9    | Treatment Needs        | treatmentNeeds        |
| 10   | Clinical Review        | clinicalReview        |

## Scoring Engine

### Oral Health Status

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| draft  | Fewer than 5 clinical fields answered           |
| good   | Healthy oral status, low severity               |
| fair   | Minor issues, moderate severity                 |
| poor   | Significant issues requiring treatment          |
| urgent | Critical findings requiring immediate attention |

Status is determined by a composite severity score based on periodontal diagnosis, DMFT index, caries risk, treatment urgency, cancer screening results, mobility, bone loss, and lifestyle factors.

### DMFT Score

Decayed + Missing + Filled Teeth index. Calculated from caries assessment fields.

### 20 Dental Rules (DENT-001 to DENT-020)

- **High concern (DENT-001-005):** Suspicious oral lesion, severe periodontitis, multiple active caries with pain, periapical abscess, tooth mobility
- **Medium concern (DENT-006-015):** Moderate periodontitis, high caries risk, BPE score 4, bone loss >30%, TMJ dysfunction, bruxism with significant wear, poor oral hygiene, smoking, high dietary sugar, multiple treatment needs
- **Low concern / positive (DENT-016-020):** Healthy periodontium, low caries risk, good oral hygiene, regular attendance, DMFT <5

### 14 Additional Flags

FLAG-CANCER-001, FLAG-PERIO-001, FLAG-PERIO-002, FLAG-CARIES-001, FLAG-PAIN-001, FLAG-TMJ-001, FLAG-WEAR-001, FLAG-ABSCESS-001, FLAG-MOBILE-001, FLAG-HYG-001, FLAG-SMOKE-001, FLAG-ANXI-001, FLAG-RADIO-001, FLAG-CHILD-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Last Visit, Oral Status, DMFT, Periodontal Diagnosis, Caries Risk.

Filters: search (name/diagnosis), oral_status, caries_risk.

## CSS Status Classes

- `.status-good` (green) - Healthy oral status
- `.status-fair` (yellow) - Minor issues
- `.status-poor` (orange) - Significant issues
- `.status-urgent` (red) - Critical findings
- `.status-draft` (gray) - Incomplete assessment

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5330, DB `dental_assessment_tera_development`
- Test: port 5330, DB `dental_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

21 tests covering:

- Dental grader: empty->draft, good patient, urgent (severe perio + mobility), poor (high caries), cancer screening rule, periapical rule, low DMFT positive, healthy perio positive, good hygiene positive, regular attendance positive, unique rule IDs, fair for moderate issues
- Flagged issues: no flags for healthy, suspicious lesion, severe perio, urgent treatment, mobile teeth, smoker, severe anxiety, periapical lesion, priority sorting
