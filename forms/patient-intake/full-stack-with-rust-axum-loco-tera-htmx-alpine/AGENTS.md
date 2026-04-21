# Patient Intake: Full Stack With Rust Axum Loco Tera

Server-rendered Rust web application using Loco framework with Tera templates for patient intake assessment.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Architecture

### Directory Structure

```
src/
├── bin/main.rs               # Binary entry point
├── lib.rs                    # Library root
├── app.rs                    # Loco hooks, Tera init, routes
├── controllers/
│   ├── mod.rs                # Controller modules
│   ├── assessment.rs         # Landing, step forms, report (POST/redirect/GET)
│   └── dashboard.rs          # Dashboard with server-side filters
├── engine/                   # Copied verbatim from back-end-with-rust-axum-loco-json
│   ├── mod.rs
│   ├── types.rs              # AssessmentData, GradingResult, etc.
│   ├── intake_grader.rs      # calculate_risk_level() function (25 rules)
│   ├── intake_rules.rs       # Intake risk classification rule definitions
│   ├── flagged_issues.rs     # detect_additional_flags() (16+ flags)
│   └── utils.rs              # Age calculation, risk level labels
├── models/                   # Copied verbatim from back-end-with-rust-axum-loco-json
│   ├── mod.rs
│   ├── assessments.rs        # ActiveModel, queries
│   └── _entities/
│       ├── mod.rs
│       ├── prelude.rs
│       └── assessments.rs    # ORM entity definition
└── views/
    ├── mod.rs
    ├── assessment.rs         # build_step_context() for Tera context
    └── dashboard.rs          # PatientRow from_model for dashboard

templates/
├── base.html.tera            # Base layout (header, nav, footer, CSS)
├── landing.html.tera         # Landing page with "Begin Assessment" button
├── assessment/
│   ├── _progress.html.tera   # Shared progress bar partial
│   ├── _nav.html.tera        # Shared step navigation partial
│   ├── step01.html.tera      # Personal Information
│   ├── step02.html.tera      # Insurance & ID
│   ├── step03.html.tera      # Reason for Visit
│   ├── step04.html.tera      # Medical History
│   ├── step05.html.tera      # Current Medications (dynamic list)
│   ├── step06.html.tera      # Allergies (dynamic list)
│   ├── step07.html.tera      # Family History
│   ├── step08.html.tera      # Social History
│   ├── step09.html.tera      # Review of Systems
│   └── step10.html.tera      # Consent & Preferences
├── report.html.tera          # Risk level, safety flags, fired rules
└── dashboard.html.tera       # Patient table with filter form

assets/static/css/style.css   # Styling (served via Loco static middleware)
config/
├── development.yaml          # Port 5160, localhost PostgreSQL
├── production.yaml           # Env vars for production
└── test.yaml                 # Test config
migration/                    # SeaORM migration (assessments table)
tests/                        # 13 engine tests (6 grader + 7 flagged issues)
```

### Routes

| Method | Endpoint                       | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/`                            | Landing page                         |
| POST   | `/assessment/new`              | Create new assessment, redirect      |
| GET    | `/assessment/{id}/step/{step}` | Render step form                     |
| POST   | `/assessment/{id}/step/{step}` | Save step data, redirect to next     |
| GET    | `/assessment/{id}/report`      | Grade and render report              |
| GET    | `/dashboard`                   | Dashboard with filtered patient list |

### Data Flow

1. POST `/assessment/new` creates JSONB record with default AssessmentData
2. Each step GET renders a Tera template pre-filled from JSONB data
3. Each step POST merges form data into JSONB (snake_case to camelCase conversion)
4. After step 10, redirects to report page
5. Report page runs risk grading engine server-side, stores result
6. Dashboard queries completed assessments with server-side filtering

### Key Design Decisions

1. **POST/redirect/GET pattern**: Multi-page form avoids SPA complexity. Each step is a separate page load.
2. **Tera templates**: Server-rendered HTML with shared base layout and partials for progress bar and navigation.
3. **Engine reuse**: Risk grading engine and models copied verbatim from JSON backend. Both must stay in sync.
4. **Form field name conversion**: Forms use snake_case names; controller converts to camelCase for JSONB storage. No special medical abbreviation handling needed (unlike pre-op which had NYHA, MI, CPAP, etc.).
5. **Conditional fields**: Rendered server-side via Tera `{% if %}` blocks. Changing a condition requires form submission.
6. **Static files**: Served via Loco static middleware from `assets/static/` at `/static/`.
7. **Port 5160**: Avoids conflict with JSON backend on 5150.

### Configuration

Environment variables for production:

- `PORT` - Server port
- `HOST` - Server host URL
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Allowed CORS origin

### Testing

- 13 tests (6 risk grader + 7 flagged issues)
- Run with `cargo test`
- Tests validate grading engine parity with frontend
