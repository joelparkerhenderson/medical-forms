# Gerontology Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive geriatric assessment (CGA) evaluating functional status, cognitive function, falls risk, polypharmacy, nutrition, mood, social support, continence, and frailty for older adults.

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
    types.rs               # AssessmentData and all gerontology-specific types
    frailty_rules.rs       # 20 frailty rules (GER-001-020, high/medium/low concern)
    frailty_grader.rs      # calculate_frailty() -> (FrailtyLevel, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # Barthel, Katz, IADL, 4AT, Tinetti, MNA-SF, GDS-15 scoring
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with gerontology-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with scores, rules, flags
  dashboard.html.tera      # Clinician dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    frailty_grader_test.rs # 14 grading tests
    flagged_issues_test.rs # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes CGA purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                  | Section Key           |
| ---- | ---------------------- | --------------------- |
| 1    | Patient Information    | patientInformation    |
| 2    | Functional Assessment  | functionalAssessment  |
| 3    | Cognitive Screening    | cognitiveScreening    |
| 4    | Falls Risk             | fallsRisk             |
| 5    | Medication Review      | medicationReview      |
| 6    | Nutritional Assessment | nutritionalAssessment |
| 7    | Mood Assessment        | moodAssessment        |
| 8    | Social Circumstances   | socialCircumstances   |
| 9    | Continence Assessment  | continenceAssessment  |
| 10   | Clinical Review        | clinicalReview        |

## Scoring Engine

### Clinical Frailty Scale (CFS)

Primary grading instrument, scored 1-9:

| CFS | Description         |
| --- | ------------------- |
| 1   | Very Fit            |
| 2   | Well                |
| 3   | Managing Well       |
| 4   | Vulnerable          |
| 5   | Mildly Frail        |
| 6   | Moderately Frail    |
| 7   | Severely Frail      |
| 8   | Very Severely Frail |
| 9   | Terminally Ill      |

### Frailty Level

| Level           | CFS Range | Meaning                     |
| --------------- | --------- | --------------------------- |
| draft           | N/A       | Fewer than 5 items answered |
| fit             | 1-3       | Fit to managing well        |
| mildFrailty     | 4         | Vulnerable                  |
| moderateFrailty | 5-6       | Mildly to moderately frail  |
| severeFrailty   | 7-9       | Severely frail or worse     |

### Composite Assessment Instruments

- **Barthel Index** (0-20): 10 ADL items scored 0-2
- **Katz ADL** (0-6 dependencies): Independence in 6 basic ADL areas
- **IADL** (0-8 dependencies): 8 instrumental ADL items
- **MMSE** (0-30): Cognitive screening
- **4AT** (0-12): Delirium screening
- **Tinetti Balance** (0-12): 6 balance items scored 0-2
- **MNA-SF** (0-14): 6 nutrition screening items
- **GDS-15** (0-15): Geriatric Depression Scale

### 20 Frailty Rules (GER-001-020)

- **High concern (GER-001-005):** CFS >= 7, recurrent falls with injury, cognitive impairment with safety risk, malnutrition (MNA <= 7), ADL dependence >= 5 areas
- **Medium concern (GER-006-015):** CFS 5-6, single fall, polypharmacy (>= 5 meds), mild cognitive impairment (MMSE 21-24), depression (GDS >= 5), at-risk nutrition (MNA 8-11), moderate Barthel (10-14), Tinetti moderate risk, continence with quality impact, social isolation without care
- **Low concern (GER-016-020):** CFS 1-3, fully independent Barthel (20), normal nutrition (MNA >= 12), no depression (GDS <= 4), normal cognition (MMSE >= 25)

### 14 Additional Flags

FLAG-FALL-001/002, FLAG-MED-001/002/003, FLAG-DEL-001, FLAG-SAFE-001, FLAG-CARE-001, FLAG-HOME-001, FLAG-ACP-001, FLAG-DRIVE-001, FLAG-SKIN-001, FLAG-MOOD-001, FLAG-PALL-001

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Frailty Level, Barthel Score, Cognitive Score, Falls Count, Polypharmacy.

Filters: search (patient name), frailty_level.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5390, DB `gerontology_assessment_tera_development`
- Test: port 5390, DB `gerontology_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

23 tests covering:

- Frailty grader: empty -> draft, fit elderly, CFS 7 -> severeFrailty, CFS 5 -> moderateFrailty, CFS 4 -> mildFrailty, recurrent falls, cognitive safety risk, malnutrition, ADL dependence, polypharmacy, depression, normal nutrition rule, normal cognition rule, rule uniqueness
- Flagged issues: no flags for fit patient, falls prevention, extreme polypharmacy, delirium screening, safeguarding, carer stress, care home assessment, driving assessment, priority sorting
