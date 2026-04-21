# Plan

## Current status

- **116 form directories** in `forms/`.
- ~50 forms are fully implemented (design spec + SQL + XML + FHIR + front-ends; the Rust backend is a scaffold for most).
- ~66 forms exist as scaffolds or design specs and still need domain-specific
  implementation.
- `bin/test` passes cleanly across every form.

## Architecture

- Monorepo with a consistent per-form layout: `index.md`, AI docs,
  `sql-migrations/`, `xml-representations/`, `fhir-r5/`, four front-ends
  (form + dashboard, each HTML and SvelteKit), and one Rust full-stack crate.
- Pure scoring engines with no side effects for testability.
- Svelte 5 runes with class-based reactive stores (no legacy `writable` stores).
- Tailwind CSS 4 via `@import 'tailwindcss'` and `@theme`.
- SvelteKit server endpoints for PDF generation via `pdfmake`.
- SVAR DataGrid (Willow theme) for dashboards with sort and filter.
- Rust backend mirrors TypeScript types via `serde(rename_all = "camelCase")`.
- PostgreSQL 18 with UUIDv4 primary keys and Liquibase SQL migrations.
- FHIR HL7 R5 JSON and XML + DTD generated from the SQL schema per form.

## Known gaps

- The Rust full-stack crates are minimal `main.rs = fn main() {}` shells for
  most forms; each needs its own controllers, models, migrations, templates,
  and tests before `cargo build` will compile a runnable service.
- Many design-spec-only forms still need front-end wizards, scoring engines,
  and SQL schemas fleshed out beyond the baseline 5-table stub.

## Next steps

### High priority

- Promote design-spec-only forms to fully implemented: author domain-specific
  SQL migrations (so XML + FHIR R5 can be regenerated with real content),
  build the front-ends, and flesh out the Rust crates.
- Extend CI: `npm install && npm run check && npm run build` per front-end;
  `cargo build && cargo test && cargo clippy` per backend.
- Playwright end-to-end tests for form flows.

### Medium priority

- Zod input-validation schemas on form submission.
- axe-core accessibility audit on every form.
- localStorage autosave to prevent data loss.
- Print-friendly CSS for report pages.
- Backend seed data per form.
- Internationalisation (i18n), including bilingual (English + Welsh) for the
  Cymraeg speaking assessment.

### Low priority

- Dark-mode support.
- Completion-rate analytics.
- Clinician annotation and override fields.
- Cross-form data sharing (for example, demographics reuse).
- Shared FHIR R5 export endpoint for interoperability.

## Compliance roadmap

- Clinical safety case per form.
- DCB0129 (UK clinical risk management) review.
- GDPR data-processing impact assessment per form.
- Penetration testing and security audit of the full-stack deployment.
- User acceptance testing with clinical staff per specialty.
