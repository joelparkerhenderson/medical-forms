# Pre-Operative Assessment: Full Stack With Rust Axum Loco Tera

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
├── engine/                   # Copied verbatim from back-end-with-rust-axum-loco-json
│   ├── mod.rs
│   ├── types.rs              # AssessmentData, GradingResult, etc.
│   ├── asa_grader.rs         # calculate_asa() function (42 rules)
│   ├── asa_rules.rs          # ASA rule definitions
│   ├── flagged_issues.rs     # detect_additional_flags() (20+ flags)
│   └── utils.rs              # BMI, METs, age, ASA helpers
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
├── base.html.tera            # Base layout (header, nav, footer, HTMX + Alpine CDN)
├── landing.html.tera         # Landing page with "Begin Assessment" button
├── _dashboard_results.html.tera  # Dashboard results partial (HTMX target)
├── assessment/
│   ├── _progress.html.tera   # Shared progress bar partial
│   ├── _nav.html.tera        # Shared step navigation partial
│   ├── step01.html.tera      # Demographics
│   ├── step02.html.tera      # Cardiovascular
│   ├── step03.html.tera      # Respiratory
│   ├── step04.html.tera      # Renal
│   ├── step05.html.tera      # Hepatic
│   ├── step06.html.tera      # Endocrine
│   ├── step07.html.tera      # Neurological
│   ├── step08.html.tera      # Haematological
│   ├── step09.html.tera      # Musculoskeletal & Airway
│   ├── step10.html.tera      # Gastrointestinal
│   ├── step11.html.tera      # Medications (dynamic list)
│   ├── step12.html.tera      # Allergies (dynamic list)
│   ├── step13.html.tera      # Previous Anaesthesia
│   ├── step14.html.tera      # Social History
│   ├── step15.html.tera      # Functional Capacity
│   └── step16.html.tera      # Pregnancy (conditional)
├── report.html.tera          # ASA grade, safety flags, fired rules
└── dashboard.html.tera       # Patient table with filter form

assets/static/css/style.css   # Styling (served via Loco static middleware)
config/
├── development.yaml          # Port 5160, localhost PostgreSQL
├── production.yaml           # Env vars for production
└── test.yaml                 # Test config
migration/                    # SeaORM migration (assessments table)
tests/                        # 12 engine tests (5 grader + 7 flagged issues)
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
4. After step 16, redirects to report page
5. Report page runs ASA grading engine server-side, stores result
6. Dashboard queries completed assessments with server-side filtering

### Key Design Decisions

1. **POST/redirect/GET pattern**: Multi-page form avoids SPA complexity. Each step is a separate page load.
2. **Tera templates**: Server-rendered HTML with shared base layout and partials for progress bar and navigation.
3. **Engine reuse**: ASA grading engine and models copied verbatim from JSON backend. Both must stay in sync.
4. **Form field name conversion**: Forms use snake_case names; controller converts to camelCase for JSONB storage via `field_to_json()` with explicit handling for medical abbreviations (NYHA, MI, CPAP, URTI, TIA, ICP, MH, METs).
5. **Conditional fields**: Alpine.js `x-show` provides instant client-side toggle; Tera `checked`/`selected` attrs ensure correct initial state on server render. `x-cloak` CSS rule hides Alpine-managed elements until initialization.
6. **Dynamic lists** (steps 11, 12): Alpine.js `x-for` renders medication/allergy arrays with client-side add/remove. Data initialized from Tera template variables.
7. **HTMX boost**: `hx-boost="true"` on `<body>` converts all page navigations to smooth AJAX body swaps.
8. **HTMX live filtering**: Dashboard uses `hx-get`/`hx-target`/`hx-trigger` for instant filter results. Controller detects `HX-Request` header to return partial (`_dashboard_results.html.tera`) vs full page.
9. **Static files**: Served via Loco static middleware from `assets/static/` at `/static/`.
10. **Port 5160**: Avoids conflict with JSON backend on 5150.

### Testing

- 12 tests (5 ASA grader + 7 flagged issues)
- Run with `cargo test`
- Tests validate grading engine parity with frontend
