# Consent to Treatment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for documenting informed consent for medical procedures and treatments, with capacity assessment, risk/benefit documentation, and consent validation.

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
    types.rs               # AssessmentData and all consent-specific types
    consent_rules.rs       # 20 consent rules (CON-001 to CON-020)
    consent_grader.rs      # calculate_consent() -> (ConsentStatus, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # consent_status_label, completeness scoring, capacity/understanding scores
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with consent-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Consent report with status, rules, flags
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    consent_grader_test.rs # 12 grading tests
    flagged_issues_test.rs # 11 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes consent form purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed consent forms with filters

## 10 Assessment Steps

| Step | Title                     | Section Key              |
| ---- | ------------------------- | ------------------------ |
| 1    | Patient Information       | patientInformation       |
| 2    | Procedure Details         | procedureDetails         |
| 3    | Risks & Benefits          | risksAndBenefits         |
| 4    | Alternatives              | alternatives             |
| 5    | Capacity Assessment       | capacityAssessment       |
| 6    | Patient Understanding     | patientUnderstanding     |
| 7    | Additional Considerations | additionalConsiderations |
| 8    | Interpreter Requirements  | interpreterRequirements  |
| 9    | Signatures                | signatures               |
| 10   | Clinical Verification     | clinicalVerification     |

## Scoring Engine

### Consent Status

| Status     | Meaning                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| draft      | Fewer than 5 fields completed                                                |
| incomplete | Missing required elements (medium concern rules fired)                       |
| complete   | All fields present but minor issues                                          |
| valid      | All required consent elements present, capacity confirmed, signed, voluntary |
| invalid    | Critical validity issues (high concern rules fired)                          |

### 20 Consent Rules (CON-001 to CON-020)

- **High concern (CON-001-005):** Capacity not confirmed, risks not explained, procedure not identified, no signature, patient unable to explain procedure
- **Medium concern (CON-006-015):** Alternatives not discussed, benefits not documented, patient cannot explain risks back, capacity score below 50%, understanding score below 50%, consent not voluntary, clinician signature missing, patient cannot explain alternatives, right to withdraw not understood, anaesthesia type not specified
- **Low concern (CON-016-020):** Information leaflet not provided, witness signature missing, GMC number not recorded, all capacity items high (positive), all understanding items high (positive)

### 14 Additional Flags

FLAG-CAP-001/002 (capacity concerns), FLAG-INT-001 (interpreter needed), FLAG-OPN-001 (second opinion requested), FLAG-BLD-001 (blood product refusal), FLAG-EMG-001 (emergency consent), FLAG-MIN-001 (minor consent), FLAG-ADV-001 (advance directive conflict), FLAG-COM-001 (communication aids), FLAG-QST-001 (questions not answered), FLAG-REL-001 (religious/cultural considerations), FLAG-PHO-001 (photography declined), FLAG-TCH-001 (teaching declined), FLAG-CHG-001 (condition changed)

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Procedure, Consent Status, Capacity Confirmed, Consent Date.

Filters: search (patient/procedure/date), consent_status, capacity_confirmed.

## CSS

- `.consent-draft` (gray) — Draft/incomplete form
- `.consent-incomplete` (yellow) — Missing required elements
- `.consent-complete` (blue) — All fields present, minor issues
- `.consent-valid` (green) — Fully valid consent
- `.consent-invalid` (red) — Critical issues preventing valid consent

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5310, DB `consent_to_treatment_tera_development`
- Test: port 5310, DB `consent_to_treatment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

23 tests covering:

- Consent grader: empty->draft, valid consent, capacity not confirmed, risks not explained, procedure not identified, no signature, patient cannot explain, alternatives not discussed, positive capacity rule, positive understanding rule, rule uniqueness, consent not voluntary
- Flagged issues: no flags for valid, capacity concerns, low capacity items, interpreter needed, second opinion requested, blood product refusal, emergency consent, minor consent, advance directive, condition changed, priority sorting
