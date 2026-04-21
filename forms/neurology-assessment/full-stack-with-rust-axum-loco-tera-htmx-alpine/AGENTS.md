# Neurology Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for comprehensive neurology assessment evaluating neurological symptoms, cranial nerves, motor/sensory function, reflexes, coordination, and cognitive screening.

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
    types.rs               # AssessmentData and all neurology-specific types
    neurology_rules.rs     # 20 neurology rules (high/medium/low concern)
    neurology_grader.rs    # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # severity_level_label, motor power, cognitive scoring
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with neurology-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms
  report.html.tera         # Neurology report with severity, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    neurology_grader_test.rs # 16 grading tests
    flagged_issues_test.rs   # 12 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) -- Form wizard
4. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
5. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                     | Section Key             |
| ---- | ------------------------- | ----------------------- |
| 1    | Patient Information       | patientInformation      |
| 2    | Neurological History      | neurologicalHistory     |
| 3    | Headache Assessment       | headacheAssessment      |
| 4    | Cranial Nerve Examination | cranialNerveExamination |
| 5    | Motor Assessment          | motorAssessment         |
| 6    | Sensory Assessment        | sensoryAssessment       |
| 7    | Reflexes & Coordination   | reflexesCoordination    |
| 8    | Cognitive Screening       | cognitiveScreening      |
| 9    | Investigations            | investigations          |
| 10   | Clinical Review           | clinicalReview          |

## Scoring Engine

### Severity Level

| Level    | Meaning                                                         |
| -------- | --------------------------------------------------------------- |
| draft    | Insufficient data (fewer than 2 examination sections completed) |
| normal   | No significant neurological abnormalities                       |
| mild     | Minor findings, low severity score                              |
| moderate | Single high-concern finding or moderate severity score          |
| severe   | Multiple high-concern findings or high severity score           |

### Composite Severity Score

The severity score (0-100) is calculated from:

- Motor power (inverted: lower power = higher severity)
- Cognitive scores (inverted: lower cognitive = higher severity)
- Headache severity (0-10 scale)
- Cranial nerve abnormality count
- Consciousness level
- Reflex abnormalities (extensor plantar, clonus)

### 20 Neurology Rules (NEURO-001 to NEURO-020)

**High concern (001-005):** Thunderclap headache (SAH risk), new focal neurological deficit, reduced consciousness, extensor plantar response, rapidly progressive symptoms

**Medium concern (006-015):** Migraine with aura, motor power <=3/5, abnormal gait, sensory level present, seizure without diagnosis, cognitive impairment (MMSE<24), abnormal cranial nerve exam, peripheral neuropathy, brisk reflexes with clonus, headache red flags

**Low concern (016-020):** Normal neurological examination, tension headache only, mild sensory changes, well-controlled epilepsy, normal cognitive screening

### 14 Additional Flags

| Flag             | Trigger                          | Priority |
| ---------------- | -------------------------------- | -------- |
| FLAG-STROKE-001  | Acute focal deficit              | high     |
| FLAG-SAH-001     | Thunderclap headache             | high     |
| FLAG-CONS-001    | Reduced consciousness            | high     |
| FLAG-SEIZURE-001 | New seizure                      | high     |
| FLAG-TUMOUR-001  | Red flag headache                | high     |
| FLAG-CORD-001    | Cord compression suspected       | high     |
| FLAG-MOTOR-001   | Motor weakness <=2/5             | high     |
| FLAG-PROG-001    | Rapidly progressive symptoms     | high     |
| FLAG-CN-001      | Multiple cranial nerve palsies   | high     |
| FLAG-INV-001     | Urgent investigation needed      | high     |
| FLAG-COGN-001    | Significant cognitive decline    | medium   |
| FLAG-GAIT-001    | Unsafe gait                      | medium   |
| FLAG-SENS-001    | Sensory level detected           | medium   |
| FLAG-FUNC-001    | Functional neurological disorder | low      |

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Primary Diagnosis, Severity, Motor Status, Cognitive Score, Urgency.

Filters: search (name/diagnosis/urgency), severity_level, primary_diagnosis.

## Database

Single `assessments` table with JSONB `data` and `result` columns.

## Configuration

- Development: port 5490, DB `neurology_assessment_tera_development`
- Test: port 5490, DB `neurology_assessment_tera_test`
- Production: environment variables

## CSS Severity Classes

- `.severity-normal` (green)
- `.severity-mild` (light green)
- `.severity-moderate` (yellow)
- `.severity-severe` (red)
- `.severity-draft` (gray)

## Tests

```bash
cargo test
```

28 tests covering:

- Neurology grader: empty->draft, normal examination, severe findings, moderate findings, thunderclap rule, focal deficit rule, reduced consciousness rule, migraine with aura rule, motor weakness rule, cognitive impairment rule, peripheral neuropathy rule, clonus rule, normal examination rule, tension headache rule, normal cognitive rule, rule uniqueness, rapidly progressive rule
- Flagged issues: no flags for normal, thunderclap, reduced consciousness, new seizure, red flag headache, motor weakness, abnormal gait, cognitive decline, stroke pathway, urgent investigation, functional disorder, priority sorting
