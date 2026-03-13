# Plan

## Current status

- 51 form directories (excluding `ergonomoic-assessment` misspelled duplicate)
- 46 forms fully implemented with patient form, clinician dashboard, and Rust backend
- 5 forms not yet implemented: diabetes-assessment, hematology-assessment, nutrition-assessment, otolaryngology-assessment, psychology-assessment
- 6 newer forms added: casualty-card-form, diabetes-assessment, framingham-risk-score-for-hard-coronary-heart-disease, heart-health-check, predicting-risk-of-cardiovascular-disease-events, systematic-coronary-risk-evaluation-2-diabetes
- `ergonomoic-assessment` directory is a misspelled duplicate of `ergonomic-assessment`; the correctly-spelled version has full code

## Architecture decisions

- Monorepo with consistent directory structure per form (doc, sql-migrations, 4 front-end/back-end subdirectories)
- Pure scoring engines with no side effects for testability
- Svelte 5 runes for all reactive state management
- Class-based stores (`AssessmentStore`) over Svelte stores
- Tailwind CSS 4 with `@import 'tailwindcss'` and `@theme` for custom colours
- pdfmake for server-side PDF generation via SvelteKit server endpoints
- SVAR DataGrid for clinician dashboards with sort/filter
- Rust backend mirrors TypeScript types with `serde(rename_all = "camelCase")`
- PostgreSQL with UUID primary keys and Liquibase SQL migrations

## Next steps

### High priority

- Implement remaining 5 empty forms (diabetes, hematology, nutrition, otolaryngology, psychology)
- Remove `ergonomoic-assessment` misspelled duplicate directory
- Add `npm install && npm run check && npm run build` CI pipeline per project
- Add `cargo build && cargo test` CI pipeline per backend
- Add end-to-end tests using Playwright for patient form flows

### Medium priority

- Add input validation with Zod schemas on form submission
- Add accessibility audit (axe-core) for all patient forms
- Add internationalisation (i18n) support for multi-language forms
- Add form autosave to localStorage to prevent data loss
- Add print-friendly CSS for report pages
- Add backend database migrations and seed data
- Complete predicting-risk-of-cardiovascular-disease-events implementation

### Low priority

- Add dark mode support across all projects
- Add analytics for form completion rates and drop-off points
- Add clinician annotation and override capabilities
- Add inter-project data sharing (e.g., demographics reuse)
- Add FHIR resource export for interoperability

## Compliance roadmap

- Clinical safety case documentation per project
- DCB0129 (UK clinical risk management) compliance review
- GDPR data processing impact assessment
- Penetration testing and security audit
- User acceptance testing with clinical staff
