# Advance Decision to Refuse Treatment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for creating, reviewing, and grading Advance Decisions to Refuse Treatment (ADRT) under the UK Mental Capacity Act 2005.

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
    types.rs               # AssessmentData and all ADRT-specific types
    validity_rules.rs      # 22 validity rules (critical/required/recommended)
    validity_grader.rs     # calculate_validity() → (ValidityStatus, Vec<FiredRule>)
    flagged_issues.rs      # 14 legal/safety flags
    utils.rs               # validity_status_label, has_life_sustaining_refusal
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with ADRT-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01–step10.html.tera # 10 step forms
  report.html.tera         # Validity report with rules and flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    validity_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes ADRT purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1–10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                                | Section Key                     |
| ---- | ------------------------------------ | ------------------------------- |
| 1    | Personal Information                 | personalInformation             |
| 2    | Capacity Declaration                 | capacityDeclaration             |
| 3    | Circumstances                        | circumstances                   |
| 4    | Treatments Refused - General         | treatmentsRefusedGeneral        |
| 5    | Treatments Refused - Life-Sustaining | treatmentsRefusedLifeSustaining |
| 6    | Exceptions & Conditions              | exceptionsConditions            |
| 7    | Other Wishes                         | otherWishes                     |
| 8    | Lasting Power of Attorney            | lastingPowerOfAttorney          |
| 9    | Healthcare Professional Review       | healthcareProfessionalReview    |
| 10   | Legal Signatures                     | legalSignatures                 |

## Validity Engine

### Validity Status

| Status   | Meaning                                                      |
| -------- | ------------------------------------------------------------ |
| draft    | Core fields empty, work in progress                          |
| complete | All required sections filled, only recommended items missing |
| valid    | Fully legally compliant                                      |
| invalid  | Missing critical or required legal requirements              |

### 22 Validity Rules

- **Critical (VR-001–006):** Life-sustaining treatment legal requirements (even-if-life-at-risk statements, signatures, witness)
- **Required (VR-007–017):** General legal requirements (patient/witness signatures, capacity, name, DOB, treatment refusal, circumstances)
- **Recommended (VR-018–022):** Best practice (HCP review, NHS number, GP details, LPA status)

### 14 Additional Flags

FLAG-LS-001/002, FLAG-SIG-001, FLAG-CAP-001/002/003, FLAG-LPA-001/002, FLAG-REV-001/002, FLAG-WIT-001, FLAG-EXC-001, FLAG-GP-001, FLAG-NHS-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: NHS Number, Patient Name, Validity Status, Life-Sustaining Refusal, Witnessed, Review Date, LPA Status.

Filters: search (name/NHS), validity_status, life_sustaining, witnessed.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as patient-intake.

## Configuration

- Development: port 5170, DB `advance_decision_tera_development`
- Test: port 5170, DB `advance_decision_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

18 tests covering:

- Validity grader: empty→draft, valid→valid, missing life-sustaining→invalid, missing signatures→invalid, recommended-only→complete, rule uniqueness, no life-sustaining rules when none refused
- Flagged issues: empty flags, life-sustaining without witness, missing written statement, unsigned, LPA conflict, capacity concerns, clinician concerns, priority sorting
