# Casualty Card Form: Full Stack With Rust Axum Loco Tera HTMX Alpine

Rust backend for the casualty card form using Axum, Loco, Tera templates, SeaORM, and PostgreSQL.
Client-side interactivity via HTMX for smooth navigation and Alpine.js for instant conditional field toggles and dynamic lists.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

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
├── engine/
│   ├── mod.rs
│   ├── types.rs              # AssessmentData, GradingResult, etc.
│   ├── news2_calculator.rs   # calculate_news2() function (7 parameters)
│   ├── flagged_issues.rs     # detect_additional_flags() (11+ flags)
│   └── utils.rs              # clinical_response_label, calculate_gcs
├── models/
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
├── base.html.tera            # Base layout (header, nav, footer, HTMX + Alpine CDN)
├── landing.html.tera         # Landing page with "Begin Assessment" button
├── _dashboard_results.html.tera  # Dashboard results partial (HTMX target)
├── assessment/
│   ├── _progress.html.tera   # Shared progress bar partial
│   ├── _nav.html.tera        # Shared step navigation partial
│   ├── step01.html.tera      # Patient Demographics
│   ├── step02.html.tera      # Next of Kin & GP
│   ├── step03.html.tera      # Arrival & Triage
│   ├── step04.html.tera      # Presenting Complaint
│   ├── step05.html.tera      # Pain Assessment (Alpine conditional)
│   ├── step06.html.tera      # Medical History (Alpine dynamic lists)
│   ├── step07.html.tera      # Vital Signs (Alpine conditional)
│   ├── step08.html.tera      # Primary Survey ABCDE (Alpine conditionals)
│   ├── step09.html.tera      # Clinical Examination
│   ├── step10.html.tera      # Investigations (Alpine dynamic list + conditional)
│   ├── step11.html.tera      # Treatment & Interventions (Alpine dynamic lists)
│   ├── step12.html.tera      # Assessment & Plan
│   ├── step13.html.tera      # Disposition (Alpine conditional)
│   └── step14.html.tera      # Safeguarding & Consent (Alpine conditional)
├── report.html.tera          # NEWS2 score, safety flags, fired rules
└── dashboard.html.tera       # Patient table with filter form

assets/static/css/style.css   # Styling (served via Loco static middleware)
config/
├── development.yaml          # Port 5170, localhost PostgreSQL
├── production.yaml           # Env vars for production
└── test.yaml                 # Test config
migration/                    # SeaORM migration (assessments table)
tests/                        # 12 engine tests (5 NEWS2 + 7 flagged issues)
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
3. Each step POST merges form data into JSONB (snake_case → camelCase conversion)
4. After step 14, redirects to report page
5. Report page runs NEWS2 grading engine server-side, stores result
6. Dashboard queries completed assessments with server-side filtering

### Key Design Decisions

1. **POST/redirect/GET pattern**: Multi-page form avoids SPA complexity. Each step is a separate page load.
2. **Tera templates**: Server-rendered HTML with shared base layout and partials for progress bar and navigation.
3. **NEWS2 scoring engine**: Calculates National Early Warning Score 2 from 7 vital sign parameters (RR, SpO2, SBP, HR, consciousness, temperature, supplemental O2) with clinical response thresholds (Low, Low-Medium, Medium, High).
4. **Form field name conversion**: Forms use snake_case names; controller converts to camelCase for JSONB storage via `field_to_json()` with explicit handling for medical abbreviations (MTS, BP, GCS, GMC, IV).
5. **Conditional fields**: Alpine.js `x-show` provides instant client-side toggle; Tera `checked`/`selected` attrs ensure correct initial state on server render. `x-cloak` CSS rule hides Alpine-managed elements until initialization.
6. **Dynamic lists** (steps 6, 10, 11): Alpine.js `x-for` renders medication/allergy/imaging/fluid/procedure arrays with client-side add/remove. Data initialized from Tera template variables.
7. **HTMX boost**: `hx-boost="true"` on `<body>` converts all page navigations to smooth AJAX body swaps.
8. **HTMX live filtering**: Dashboard uses `hx-get`/`hx-target`/`hx-trigger` for instant filter results. Controller detects `HX-Request` header to return partial (`_dashboard_results.html.tera`) vs full page.
9. **Static files**: Served via Loco static middleware from `assets/static/` at `/static/`.
10. **Port 5170**: Avoids conflict with other forms.

### Testing

- 12 tests (5 NEWS2 calculator + 7 flagged issues)
- Run with `cargo test`
- Tests validate grading engine parity
