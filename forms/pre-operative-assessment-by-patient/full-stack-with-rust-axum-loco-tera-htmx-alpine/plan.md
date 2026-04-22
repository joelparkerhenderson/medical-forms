# Plan: Rust full-stack

## Status

Implemented. Loco/axum backend with SeaORM models, HTMX-driven Tera
templates, and a Rust port of the ASA grading engine in place.

## Build order

1. [x] `Cargo.toml`, `Cargo.lock`, workspace `migration/` crate.
2. [x] Loco application bootstrap: `src/bin/main.rs`, `src/lib.rs`,
       `src/app.rs`.
3. [x] SeaORM migration wiring under `migration/src/`.
4. [x] Models: `src/models/mod.rs`, `src/models/assessments.rs`
       (SeaORM entity, snake_case fields, `serde(rename_all = "camelCase")`).
5. [x] Controllers: `src/controllers/assessment.rs`,
       `src/controllers/dashboard.rs` (assessment CRUD, dashboard listing).
6. [x] Views: `src/views/assessment.rs`, `src/views/dashboard.rs`.
7. [x] Tera templates: `base.html.tera` (HTMX 2.0.8 + Alpine 3.14.8 + hx-boost),
       `landing.html.tera`, `dashboard.html.tera`,
       `_dashboard_results.html.tera`, `report.html.tera`, `assessment/`.
8. [x] Engine port: `src/engine/{types,utils,asa_rules,flagged_issues,asa_grader}.rs`.
9. [x] Integration tests: `tests/engine_tests.rs`, `tests/engine/`.

## Future enhancements

- Authentication and per-clinician audit trail.
- Pagination tuning and full-text search on the dashboard.
- Server-side PDF export (currently delegated to the SvelteKit front-end).
- Clinical safety-case evidence collection endpoint.
