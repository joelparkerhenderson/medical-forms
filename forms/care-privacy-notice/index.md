# Care Privacy Notice

A read-and-acknowledge GDPR privacy notice for GP practices, based on the
BMA template. Patients read the practice's privacy notice, confirm they
understand and agree, and provide identifying information.

## Form structure

| Section | Description |
|---------|-------------|
| Privacy notice text | Full BMA GDPR template with practice-specific fields |
| Patient identification | Full name, NHS number, date of birth, email |
| Acknowledgment | Checkbox confirmation + date acknowledged |

## Admin configuration

Practice-specific fields (practice name, DPO contact, safeguarding links, etc.)
are stored in a configuration table and injected into the notice text.

## Scoring

Validation only: the form is either "Acknowledged" (all fields complete, checkbox
checked) or not submitted.

## Directory structure

| Directory | Description |
|-----------|-------------|
| sql-migrations/ | PostgreSQL schema |
| xml-representations/ | XML and DTD per entity |
| fhir-r5/ | FHIR HL7 R5 JSON per entity |
| front-end-patient-form-with-html/ | HTML patient form |
| front-end-patient-form-with-svelte/ | SvelteKit patient form |
| front-end-clinician-dashboard-with-html/ | HTML clinician dashboard |
| front-end-clinician-dashboard-with-svelte/ | SvelteKit clinician dashboard |
| full-stack-with-rust-axum-loco-tera-htmx-alpine/ | Rust full-stack backend |
