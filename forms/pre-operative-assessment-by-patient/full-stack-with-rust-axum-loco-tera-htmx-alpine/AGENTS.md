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
│   ├── assessment.rs         # Landing, single-page form, submit, report
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
    ├── assessment.rs         # build_assessment_context() for Tera context
    └── dashboard.rs          # PatientRow from_model for dashboard

templates/
├── base.html.tera            # Base layout (header, nav, footer, HTMX + Alpine CDN)
├── landing.html.tera         # Landing page with "Begin Assessment" button
├── assessment.html.tera      # Single-page form including all 16 section partials
├── _dashboard_results.html.tera  # Dashboard results partial (HTMX target)
├── assessment/
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
tests/                        # 12 engine tests (5 grader + 7 flagged issues) + 2 template tests
```

### Routes

| Method | Endpoint                     | Description                                        |
| ------ | ---------------------------- | -------------------------------------------------- |
| GET    | `/`                          | Landing page                                       |
| POST   | `/assessment/new`            | Create new assessment, redirect to the form        |
| GET    | `/assessment/{id}`           | Render the single-page form (all 16 sections)      |
| POST   | `/assessment/{id}/submit`    | Save all form data, redirect to report            |
| GET    | `/assessment/{id}/report`    | Grade and render report                            |
| GET    | `/dashboard`                 | Dashboard with filtered patient list               |

### Data Flow

1. `POST /assessment/new` creates a JSONB record with default `AssessmentData`, redirects to `/assessment/{id}`.
2. `GET /assessment/{id}` renders `assessment.html.tera`, which includes all 16 section partials inside a single `<form>`, pre-filled from the JSONB data.
3. `POST /assessment/{id}/submit` receives every field for every section in one request; the controller merges them into JSONB (snake_case → camelCase conversion) and redirects to the report.
4. `GET /assessment/{id}/report` runs the ASA grading engine server-side and stores the result.
5. Dashboard queries completed assessments with server-side filtering.

### Key Design Decisions

1. **Single-page wizard**: One continuous page with all 16 sections rendered together, matching the project-wide `AGENTS.md` rule "the form must be one continuous single-page wizard". Navigation between sections uses in-page anchors.
2. **Tera templates**: Server-rendered HTML with a shared base layout. Each `stepNN.html.tera` is a partial (plain markup with no `{% extends %}`/`{% block %}`); `assessment.html.tera` is the top-level page that includes them.
3. **Engine reuse**: ASA grading engine and models copied verbatim from the JSON backend. Both must stay in sync.
4. **Form field name conversion**: Forms use snake_case names; the controller converts to camelCase for JSONB storage via `field_to_json()` with explicit handling for medical abbreviations (NYHA, MI, CPAP, URTI, TIA, ICP, MH, METs).
5. **Conditional fields**: Alpine.js `x-show` provides instant client-side toggle; Tera `checked`/`selected` attrs ensure correct initial state on server render. `x-cloak` CSS hides Alpine-managed elements until initialization.
6. **Dynamic lists** (steps 11, 12): Alpine.js `x-for` renders medication/allergy arrays with client-side add/remove. Data initialized from Tera template variables.
7. **Conditional pregnancy section**: The pregnancy partial is only shown when sex=female and age is 12–55; `build_assessment_context` exposes `show_pregnancy` for the template to gate on.
8. **HTMX boost**: `hx-boost="true"` on `<body>` converts all page navigations to smooth AJAX body swaps. The submit form itself opts out via `hx-boost="false"` so the POST/redirect/GET cycle completes a full page load to the report.
9. **HTMX live filtering**: Dashboard uses `hx-get`/`hx-target`/`hx-trigger` for instant filter results. Controller detects the `HX-Request` header to return a partial (`_dashboard_results.html.tera`) vs a full page.
10. **Static files**: Served via Loco static middleware from `assets/static/` at `/static/`.
11. **Port 5160**: Avoids conflict with the JSON backend on 5150.

### Testing

- 12 engine tests (5 ASA grader + 7 flagged issues).
- 2 template rendering tests (`tests/templates_parse.rs`) verify `assessment.html.tera` renders for default and female patient contexts.
- Run with `cargo test`.
- Tests validate grading engine parity with the frontend.
