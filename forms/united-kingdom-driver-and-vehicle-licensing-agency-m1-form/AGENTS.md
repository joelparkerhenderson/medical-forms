# United Kingdom Driver and Vehicle Licensing Agency M1 Form

Confidential medical information — mental health conditions for driving fitness assessment by the UK DVLA.

## Source

- **Form**: M1 — Confidential medical information (mental health)
- **Agency**: Driver & Vehicle Licensing Agency (DVLA), United Kingdom
- **URL**: <https://assets.publishing.service.gov.uk/media/67ed101ae9c76fa33048c63c/m1-online-confidential-medical-information-accessible.odt>

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./doc/ - Reference documentation
- ./front-end-form-with-html/ - Patient questionnaire; HTML
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-html/ - Dashboard; HTML
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Form parts

- **Part A**: About You — personal/driving licence details, change of details
- **Part B**: Healthcare Professional — GP details, consultant details
- **Medical Questionnaire — Mental Health**: 3 questions covering diagnosis confirmation, specific conditions, recent healthcare contact
- **Applicant's Authorisation**: Medical disclosure declaration, electronic correspondence consent, contact preferences

## Assessment steps (6 total)

1. Personal Details - Part A — current driving licence details and change of details
2. Healthcare Professionals - Part B — GP details and consultant details
3. Diagnosis Confirmation - Q1 — has a mental health condition been diagnosed
4. Mental Health Conditions - Q2 — specific conditions diagnosed
5. Recent Contact - Q3 — recent healthcare professional contact
6. Authorisation - Applicant's authorisation and declaration

## Conditional logic

- Q1: No → stop, do not complete the rest of the form
- Q2: "Other" selected → free text field for details
- Q3: Yes → provide dates for Doctor, Consultant, Community psychiatric nurse

## Mental health condition categories (Q2)

- Anxiety or depression (without impairment of concentration, memory or agitation)
- Anxiety or depression (with suicidal thoughts or impairment in concentration, memory or agitation)
- Bipolar affective disorder
- Eating disorder (anorexia nervosa, bulimia)
- Obsessive compulsive disorder or post-traumatic stress disorder
- Personality disorder (any type)
- Schizophrenia or psychosis or delusional disorder or schizoaffective disorder
- Other (free text)

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
