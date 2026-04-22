# Plan: UK Maternity Certificate MAT B1

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

Regulatory maternity certificate issued by doctors or registered midwives to enable statutory maternity benefits claims (SMP, Maternity Allowance, Sure Start Maternity Grant). Captures patient identification, pre-confinement expected date (EWC), post-confinement actual birth date, and issuer validation credentials (NMC ID for midwives, name/address stamp for doctors). No clinical scoring — the form validates completeness and compliance with DWP issuance rules.

## Implementation plan

1. Author SQL migrations for patient details, pre-confinement certificate, post-confinement certificate, and issuer validation
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (4 steps)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for certificate tracking
6. Build SvelteKit dashboard with SVAR DataGrid
7. Build Rust backend with Loco/Tera
8. Add completeness validation engine and flagged issues
9. Add unit tests for validation logic

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing
- GDPR data processing impact assessment
