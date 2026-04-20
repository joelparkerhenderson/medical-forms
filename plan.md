# Plan

## Current status

- 115+ form directories in `forms/`
- ~50 forms fully implemented (patient form, clinician dashboard, SQL, XML, FHIR, and in many cases the Rust backend)
- ~60 forms with complete design specs (index.md / AGENTS.md / plan.md / tasks.md) awaiting implementation
- A handful of older directories contain only `seed.md` or partial scaffolding and are being migrated to the standard layout
- Newest additions: anesthesiology assessment design spec, care privacy notice, prescription request, screening program privacy notice, and 43 design specs from `tasks2.md` (workplace, training, donation, specialty, and administrative forms)

## Architecture decisions

- Monorepo with a consistent per-form directory structure (doc, sql-migrations, xml-representations, fhir-r5, four front-ends, Rust full-stack)
- Pure scoring engines with no side effects, for testability and clarity
- Svelte 5 runes for reactive state; class-based stores (`AssessmentStore`) rather than Svelte stores
- Tailwind CSS 4 with `@import 'tailwindcss'` and `@theme` for custom colours
- pdfmake for server-side PDF generation via SvelteKit server endpoints
- SVAR DataGrid (Willow theme) for clinician dashboards with sort/filter
- Rust backend mirrors TypeScript types via `serde(rename_all = "camelCase")`
- PostgreSQL 18 with UUIDv4 primary keys and Liquibase SQL migrations
- FHIR HL7 R5 JSON resources generated from the SQL schema per form
- XML + DTD representations generated from the SQL schema per form

## Known issues to resolve

- The 60+ forms that received minimal Rust-crate scaffolding are syntactically valid but not yet functional; each needs its domain-specific controllers, models, templates, migrations, and tests before `cargo build` will succeed
- Many design-spec-only forms still need implementation of the SvelteKit patient form, SvelteKit clinician dashboard, and Rust full-stack backend

## Recently resolved

- Fixed `bin/test-form` missing closing quote after `00_extensions.sql`; `bin/test` no longer halts at the first error
- Removed `ergonomoic-assessment`, `cardiopulmonary-resuscitation-training-checklis`, and `workplace-safety-asssment` misspelled duplicate directories
- `bin/test` now passes cleanly (1,449 → 0 errors) after re-scaffolding every form with `bin/create-form`, adding the standard `sql-migrations/00_extensions.sql` to each form, and adding minimal Rust crate shells (`Cargo.toml`, `.gitignore`, `src/main.rs`, `templates/base.html.tera` with HTMX + Alpine.js + `hx-boost`, and empty `target/`)
- Reconciled `forms/AGENTS.md` index with every directory on disk
- Converged `fhir-api/` → `fhir-r5/`: added `fhir-r5/` to every form missing it, removed 112 empty `fhir-api/` scaffold shells, updated `bin/create-form` and `bin/test-form` to treat `fhir-r5/` as canonical
- Populated design-spec docs for 8 previously-underpopulated forms: `advance-statement-about-care`, `urology-assessment`, `diabetes-assessment`, `predicting-risk-of-cardiovascular-disease-events`, `anesthesiology-assessment`, `international-patient-summary`, `lifeguard-certification-checklist`, `research-and-planning-privacy-notice`, plus thin docs for `hematology-assessment`, `vaccinations-assessment`, `systematic-coronary-risk-evaluation-2-diabetes`, and `framingham-risk-score-for-hard-coronary-heart-disease`
- Consolidated the extensions-file naming convention: removed 70 duplicate `00_extensions.sql` (underscore) files, renamed 42 remaining to `00-extensions.sql`, updated `bin/test-form` and `AGENTS/sql-migrations.md` to match
- Added a baseline 5-table SQL schema (`patient`, `assessment`, `grading_result`, `grading_fired_rule`, `grading_additional_flag`) to the 42 forms that previously had only `00-extensions.sql`, using sequence numbers `01`, `02`, `90`, `91`, `92` so form-specific `assessment_<section>` tables can slot in between without renumbering
- Regenerated XML + DTD representations for every form (112 forms, 2,460 files)
- Regenerated FHIR R5 JSON resources for every form (112 forms, 1,230 files)
- Added a GitHub Actions CI workflow at `.github/workflows/ci.yml` that runs `bin/test`, the XML and FHIR generators, `xmllint --valid` against DTDs, and a `resourceType` check against every FHIR JSON, and fails if generator output differs from committed files
- Scaffolded SvelteKit skeletons (`package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `app.css`, `app.d.ts`, `+layout.svelte`, `+page.svelte`, `static/favicon.png`) in 102 previously-empty front-end Svelte directories (patient form and clinician dashboard), so every form now has a buildable SvelteKit starting point
- Scaffolded plain-HTML skeletons (`index.html` + `css/style.css` + `js/app.js`) in 192 previously-empty HTML front-end directories
- Fixed a typo in `bin/test` where the call site invoked `test_form` but the function is `test_forms`

## Next steps

### High priority

- Promote design-spec-only forms to fully implemented: author domain-specific SQL migrations (so XML + FHIR R5 can be regenerated with real content), build the front-ends, and flesh out the Rust backend crates
- Add per-front-end CI step: `npm install && npm run check && npm run build`
- Add per-backend CI step: `cargo build && cargo test && cargo clippy`
- Add Playwright end-to-end tests for patient form flows

### Medium priority

- Add Zod input validation schemas on form submission
- Add axe-core accessibility audit on every patient form
- Add form autosave to localStorage to prevent data loss
- Add print-friendly CSS for report pages
- Add backend database migrations and seed data
- Add internationalisation (i18n), including bilingual (English + Welsh) support for the Cymraeg speaking assessment

### Low priority

- Add dark-mode support across all projects
- Add analytics for form completion rates and drop-off points
- Add clinician annotation and override capabilities
- Add inter-form data sharing (for example, demographics reuse)
- Add a shared FHIR R5 export endpoint for interoperability

## Compliance roadmap

- Clinical safety case documentation per form
- DCB0129 (UK clinical risk management) compliance review
- GDPR data processing impact assessment per form
- Penetration testing and security audit of the full-stack deployment
- User acceptance testing with clinical staff per specialty
