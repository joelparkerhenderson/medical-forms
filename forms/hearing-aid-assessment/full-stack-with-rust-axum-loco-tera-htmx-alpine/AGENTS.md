# Hearing Aid Assessment — Full Stack with Rust Axum Loco Tera

Server-rendered web application for collecting and analysing hearing aid assessment data using Likert-scale composite scoring across communication needs, lifestyle factors, fitting requirements, trial outcomes, and clinical review.

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
    types.rs               # AssessmentData and all hearing-aid-specific types
    hearing_aid_rules.rs   # 20 hearing aid rules (high/medium/low concern)
    hearing_aid_grader.rs  # calculate_hearing_aid_level() -> (HearingAidLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # hearing_aid_level_label, composite scoring, hearing loss category
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with hearing-aid-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Assessment report with score, rules, flags, notes
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    hearing_aid_grader_test.rs # 11 grading tests
    flagged_issues_test.rs  # 8 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                | Section Key         |
| ---- | -------------------- | ------------------- |
| 1    | Patient Information  | patientInformation  |
| 2    | Hearing History      | hearingHistory      |
| 3    | Audiometric Results  | audiometricResults  |
| 4    | Communication Needs  | communicationNeeds  |
| 5    | Lifestyle Assessment | lifestyleAssessment |
| 6    | Current Hearing Aids | currentHearingAids  |
| 7    | Fitting Requirements | fittingRequirements |
| 8    | Expectations & Goals | expectationsGoals   |
| 9    | Trial Period         | trialPeriod         |
| 10   | Clinical Review      | clinicalReview      |

## Scoring Engine

### Scoring Instrument

Composite Assessment Score derived from Likert-scale responses (1-5) across 27 items spanning 7 dimensions. The score is converted to a 0-100 percentage scale.

### Hearing Aid Need Level

| Level       | Score Range | Meaning                                     |
| ----------- | ----------- | ------------------------------------------- |
| draft       | N/A         | Fewer than 5 items answered                 |
| profound    | 0-24        | Profound hearing aid need across dimensions |
| significant | 25-50       | Significant hearing aid need                |
| moderate    | 51-75       | Moderate hearing aid need                   |
| minimal     | 76-100      | Minimal hearing aid need                    |

### 20 Hearing Aid Rules (HA-001 to HA-020)

- **High concern (HA-001-005):** Severe hearing loss (PTA >70 dB), communication needs <40%, poor speech recognition (<50%), very poor trial benefit (1), very poor aided improvement (1)
- **Medium concern (HA-006-015):** Unrealistic expectations, low motivation, poor wear compliance, poor ear canal suitability, current aid dissatisfaction, poor sound quality, poor feedback management, low willingness to adapt, trial period <40%, low recommendation confidence
- **Low concern / positive (HA-016-020):** Patient satisfaction excellent (5), reported benefit excellent (5), high overall readiness (5), aided improvement excellent (5), all communication needs good or excellent (4-5)

### 14 Additional Flags

FLAG-HIST-001 (tinnitus), FLAG-AUDIO-001 (profound loss/CI referral), FLAG-AUDIO-002 (asymmetric loss), FLAG-AUDIO-003 (poor speech recognition), FLAG-LIFE-001 (low dexterity), FLAG-LIFE-002 (cosmetic concern), FLAG-HIST-002 (previous rejection), FLAG-EXPECT-001 (no support system), FLAG-FIT-001 (unilateral with bilateral loss), FLAG-HIST-003 (ongoing noise), FLAG-TRIAL-001 (poor initial comfort), FLAG-HIST-004 (medical conditions), FLAG-CLIN-001 (additional services needed)

Sorted by priority: high > medium > low.

### Hearing Loss Category

Based on Pure Tone Average (PTA):

- **Normal** (0-25 dB), **Mild** (26-40 dB), **Moderate** (41-55 dB), **Moderately Severe** (56-70 dB), **Severe** (71-90 dB), **Profound** (91+ dB)

## Dashboard

Columns: Patient Name, Assessment Date, Hearing Loss Severity, Need Level, Score, Affected Ear, Currently Wearing.

Filters: search (name/date/severity), hearing_aid_level, hearing_loss_severity, affected_ear.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5410, DB `hearing_aid_assessment_tera_development`
- Test: port 5410, DB `hearing_aid_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

19 tests covering:

- Hearing aid grader: empty->draft, all-4s->moderate, all-5s->minimal, all-1s->profound, all-2s->significant, all-3s->significant, severe hearing loss rule, poor speech recognition rule, communication concern, positive outcome rules, rule uniqueness
- Flagged issues: no flags for moderate patient, tinnitus, profound loss, asymmetric loss, poor speech recognition, low dexterity, previous rejection, priority sorting
