# Sleep Quality Assessment — Full Stack with Rust Axum Loco Tera HTMX Alpine

Server-rendered web application for evaluating sleep quality using the Pittsburgh Sleep Quality Index (PSQI), Epworth Sleepiness Scale (ESS), and STOP-BANG screening for obstructive sleep apnoea.
Client-side interactivity via HTMX for smooth navigation and Alpine.js for instant conditional field toggles.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Technology Stack

| Tool       | Version | Purpose                                   |
| ---------- | ------- | ----------------------------------------- |
| Rust       | 1.9     | Programming language edition 2024         |
| axum       | 0.8     | Web application framework                 |
| Loco       | 0.16    | Web application framework                 |
| Tera       | 1.20    | Template engine                           |
| SeaORM     | 1.1     | Object relational mapper                  |
| PostgreSQL | 18.3    | Database server                           |
| HTMX       | 2.0.8   | Smooth AJAX navigation and live filtering |
| Alpine.js  | 3.14.8  | Client-side conditional field toggles     |

## Quick Start

```bash
cargo build
cargo test
```

To run the development server (requires PostgreSQL):

```bash
cargo loco start
```

Server runs on port **5610** by default.

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
    types.rs               # AssessmentData and all sleep-specific types
    sleep_quality_rules.rs  # 20 sleep quality rules (SLP-001 to SLP-020)
    sleep_quality_grader.rs # calculate_sleep_quality() -> (SleepQuality, u8, u8, u8, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable flags
    utils.rs               # sleep_quality_label, PSQI/ESS/STOP-BANG scoring, categories
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_step_context() for 10 steps
    dashboard.rs           # PatientRow with sleep-specific fields
templates/
  base.html.tera           # Base layout (header, nav, footer, HTMX + Alpine CDN)
  landing.html.tera        # Landing page
  assessment/
    _progress.html.tera    # Progress bar partial
    _nav.html.tera         # Step navigation partial
    step01-step10.html.tera # 10 step forms (Alpine conditionals on steps 8, 10)
  report.html.tera         # Sleep quality report with PSQI, ESS, STOP-BANG, rules, flags
  _dashboard_results.html.tera # Dashboard results partial (HTMX target)
  dashboard.html.tera      # Clinician dashboard with HTMX live filtering
tests/
  engine_tests.rs          # Test harness
  engine/
    sleep_quality_grader_test.rs # 10 grading tests
    flagged_issues_test.rs  # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) — Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) — Creates draft, redirects to step 1
3. **Steps 1-10** (`GET/POST /assessment/{id}/step/{step}`) — Form wizard
4. **Report** (`GET /assessment/{id}/report`) — Grades and displays results
5. **Dashboard** (`GET /dashboard`) — Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                    | Section Key          |
| ---- | ------------------------ | -------------------- |
| 1    | Patient Information      | patientInformation   |
| 2    | Sleep Habits             | sleepHabits          |
| 3    | Sleep Quality (PSQI)     | sleepQualityPsqi     |
| 4    | Daytime Sleepiness (ESS) | daytimeSleepiness    |
| 5    | Sleep Disturbances       | sleepDisturbances    |
| 6    | Sleep Apnoea Screening   | sleepApnoeaScreening |
| 7    | Sleep Hygiene            | sleepHygiene         |
| 8    | Medical & Medications    | medicalMedications   |
| 9    | Impact Assessment        | impactAssessment     |
| 10   | Clinical Review          | clinicalReview       |

## Scoring Engine

### Instruments

- **PSQI** (Pittsburgh Sleep Quality Index): 7 components scored 0-3, global score 0-21
- **ESS** (Epworth Sleepiness Scale): 8 situations scored 0-3, total 0-24
- **STOP-BANG**: 8 yes/no questions, score 0-8

### Sleep Quality Level

| Level    | PSQI Score | Meaning                               |
| -------- | ---------- | ------------------------------------- |
| draft    | N/A        | Fewer than 3 PSQI components answered |
| good     | 0-5        | Good sleep quality                    |
| fair     | 6-10       | Fair sleep quality                    |
| poor     | 11-15      | Poor sleep quality                    |
| veryPoor | >15        | Very poor sleep quality               |

### ESS Categories

| Category | Score | Meaning                               |
| -------- | ----- | ------------------------------------- |
| normal   | 0-6   | Normal daytime sleepiness             |
| mild     | 7-10  | Mild excessive daytime sleepiness     |
| moderate | 11-15 | Moderate excessive daytime sleepiness |
| severe   | 16-24 | Severe excessive daytime sleepiness   |

### STOP-BANG Categories

| Risk         | Score | Meaning                   |
| ------------ | ----- | ------------------------- |
| low          | 0-2   | Low risk for OSA          |
| intermediate | 3-4   | Intermediate risk for OSA |
| high         | 5-8   | High risk for OSA         |

### 20 Sleep Quality Rules (SLP-001 to SLP-020)

- **High concern (SLP-001-005):** PSQI >15, ESS >=16, STOP-BANG >=5, witnessed apnoeas + snoring, driving safety <=2/5
- **Medium concern (SLP-006-015):** PSQI 11-15, ESS 11-15, STOP-BANG 3-4, sleep efficiency <75%, sleep latency >60min, long-term sleep medication, shift work, chronic pain, restless legs, frequent nightmares
- **Low concern / positive (SLP-016-020):** PSQI <=5, ESS <=6, good sleep hygiene, no sleep medication, regular schedule

### 14 Additional Flags

FLAG-APNOEA-001/002, FLAG-DRIVE-001, FLAG-PSQI-001, FLAG-ESS-001, FLAG-MED-001/002, FLAG-MOOD-001, FLAG-PAIN-001, FLAG-RLS-001, FLAG-WORK-001, FLAG-SAFETY-001, FLAG-CHILD-001, FLAG-INSOMNIA-001

Sorted by priority: high > medium > low.

## Key Design Decisions

1. **HTMX boost**: `hx-boost="true"` on `<body>` converts all page navigations to smooth AJAX body swaps.
2. **HTMX live filtering**: Dashboard uses `hx-get`/`hx-target`/`hx-trigger` for instant filter results. Controller detects `HX-Request` header to return partial (`_dashboard_results.html.tera`) vs full page.
3. **Alpine.js conditionals**: Step 8 shows medication duration only when sleep medications are entered. Step 10 shows referral destination when referral is needed. `x-cloak` CSS rule hides Alpine-managed elements until initialization.
4. **Static files**: Served via Loco static middleware from `assets/static/` at `/static/`.

## Dashboard

Columns: Patient Name, Sleep Quality, PSQI Score, ESS Score, STOP-BANG, Apnoea Risk.

Filters: search (patient name), sleep_quality, apnoea_risk.

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as encounter-satisfaction.

## Configuration

- Development: port 5610, DB `sleep_quality_assessment_tera_development`
- Test: port 5610, DB `sleep_quality_assessment_tera_test`
- Production: environment variables

## CSS Classes

- `.quality-good` (green) - Good sleep quality
- `.quality-fair` (yellow) - Fair sleep quality
- `.quality-poor` (orange) - Poor sleep quality
- `.quality-veryPoor` (red) - Very poor sleep quality
- `.quality-draft` (gray) - Draft/incomplete

## Tests

```bash
cargo test
```

19 tests covering:

- Sleep quality grader: empty->draft, best scores->good, worst PSQI->veryPoor, moderate PSQI->fair, high PSQI->poor, severe ESS rule, high STOP-BANG rule, driving safety rule, good hygiene rule, rule uniqueness
- Flagged issues: no flags for good sleeper, witnessed apnoeas, high STOP-BANG, driving safety, mental health, chronic pain, shift work, accident risk, priority sorting
