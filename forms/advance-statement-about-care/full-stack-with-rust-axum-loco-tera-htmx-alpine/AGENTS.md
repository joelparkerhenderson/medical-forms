# Advance Statement About Care — Full Stack with Rust Axum Loco Tera

Server-rendered web application for documenting patient wishes, preferences, and values for future care using completeness-based scoring.

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
    types.rs               # AssessmentData and all section-specific types
    completeness_rules.rs  # 20 completeness rules (high/medium/low concern)
    completeness_grader.rs # calculate_completeness() -> (CompletenessStatus, u32, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # completeness_status_label, is_filled, count_completed_sections
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with advance-statement-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Completeness report with status, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    completeness_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes form purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed statements with filters

## 10 Assessment Steps

| Step | Title                          | Section Key                  |
| ---- | ------------------------------ | ---------------------------- |
| 1    | Patient Information            | patientInformation           |
| 2    | Personal Values & Beliefs      | personalValues               |
| 3    | Care Preferences               | carePreferences              |
| 4    | Communication Preferences      | communicationPreferences     |
| 5    | Daily Living Preferences       | dailyLivingPreferences       |
| 6    | Spiritual & Cultural Wishes    | spiritualCultural            |
| 7    | Nominated Persons              | nominatedPersons             |
| 8    | End of Life Preferences        | endOfLifePreferences         |
| 9    | Healthcare Professional Review | healthcareProfessionalReview |
| 10   | Signatures & Verification      | signaturesVerification       |

## Scoring Engine

### Scoring Instrument

Completeness scoring based on whether key sections are filled and reviewed by a clinician.

### Completeness Status

| Status     | Meaning                                                    |
| ---------- | ---------------------------------------------------------- |
| draft      | Fewer than 2 sections completed                            |
| incomplete | 2-7 sections completed                                     |
| complete   | 8-10 sections completed but not clinician-reviewed         |
| reviewed   | Complete AND reviewed by clinician with capacity confirmed |

### 20 Completeness Rules (AS-001 to AS-020)

- **High concern (AS-001-005):** No nominated contact, end of life wishes absent, no capacity confirmation, ADRT contradiction, unsigned statement
- **Medium concern (AS-006-015):** Care preferences empty, communication needs unaddressed, no spiritual/cultural assessment, daily living incomplete, LPA not referenced, pain management not discussed, resuscitation unclear, no clinician review, no witness, statement age unknown
- **Low concern / positive (AS-016-020):** All sections completed, clinician reviewed, recently updated, patient satisfied, nominated persons confirmed

### 14 Additional Flags

FLAG-CAP-001, FLAG-CONT-001, FLAG-EOL-001, FLAG-ADRT-001, FLAG-LPA-001, FLAG-SIG-001, FLAG-REV-001, FLAG-REV-002, FLAG-COMM-001, FLAG-LANG-001, FLAG-SPIR-001, FLAG-PAIN-001, FLAG-RESUS-001, FLAG-WIT-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Completeness Status, Nominated Person, Last Review Date, Capacity Confirmed.

Filters: search (patient name/review date), completeness_status, review_due.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as encounter-satisfaction.

## Configuration

- Development: port 5230, DB `advance_statement_tera_development`
- Test: port 5230, DB `advance_statement_tera_test`
- Production: environment variables

## CSS Status Classes

- `.status-draft` (gray)
- `.status-incomplete` (yellow)
- `.status-complete` (green)
- `.status-reviewed` (blue)

## Tests

```bash
cargo test
```

18 tests covering:

- Completeness grader: empty->draft, complete->reviewed, not-reviewed->complete, partial->incomplete, no nominated contact, end of life absent, no capacity confirmation, unsigned statement, positive rules fire, rule uniqueness
- Flagged issues: no flags for complete, capacity not confirmed, no nominated contact, end of life absent, LPA not coordinated, unsigned statement, no witness, priority sorting
