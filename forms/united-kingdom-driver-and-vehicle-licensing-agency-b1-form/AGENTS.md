# United Kingdom Driver and Vehicle Licensing Agency B1 Form

Confidential medical information — neurological conditions for driving fitness assessment by the UK DVLA.

## Source

- **Form**: B1 — Confidential medical information (neurological)
- **Agency**: Driver & Vehicle Licensing Agency (DVLA), United Kingdom
- **Revision**: May 2024 (Part A); Medical questionnaire May 2023; Authorisation March 2025
- **Pages**: 6
- **URL**: <https://assets.publishing.service.gov.uk/media/67ffcccc694d57c6b1cf8e2e/b1-confidential-medical-information.pdf>

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
- **Medical Questionnaire — Neurological**: 12 questions covering condition history, treatment, blackouts, seizures/epilepsy, medication, VP shunt, daily living, double vision, eyesight, vehicle adaptations
- **Epilepsy Declaration**: Required if diagnosis of epilepsy or more than 1 seizure
- **Applicant's Authorisation**: Medical disclosure declaration, correspondence consent

## Conditions covered

- Brain haemorrhage (including subarachnoid, aneurysm & AVM)
- Severe head injury involving in-patient treatment
- Acute/chronic subdural haematoma
- Arachnoid cyst and Arnold-Chiari malformation
- Blood clots, brain abscess, brain cyst, encephalitis
- Burr hole surgery, cerebral palsy
- Hydrocephalus, hypoxic brain damage
- Lewy body dementia
- Transient global amnesia
- VP shunt

## Assessment steps (13 total)

1. Personal Details - Part A — driving licence details and change of details
2. Healthcare Professionals - Part B — GP details and consultant details
3. Condition History - Q1 — brain haemorrhage, head injury, other conditions, brain surgery
4. Treatment Provider - Q2 — last seen GP/consultant, consultation dates
5. Blackouts - Q3 — blackouts/altered consciousness
6. Seizures - Q4–Q6 — seizure history, epilepsy details, epilepsy declaration
7. Medication - Q7 — current/past medication and driving effects
8. VP Shunt - Q8 — VP shunt or ventricular drain history
9. Daily Living - Q9 — assistance needs
10. Double Vision - Q10 — diplopia and correction methods
11. Eyesight - Q11 — eyesight problems from condition
12. Vehicle Adaptations - Q12 — special controls or automatic transmission
13. Authorisation - Applicant's authorisation and declaration

## Conditional logic

- Q4: No → skip to Q7
- Q4 Yes: First ever seizure → Q5; More than one seizure → Q6
- Q6g: Yes → Q6h; No → Q6i
- Q6i: No → Q6i sub-questions; Yes → Q6j
- Q10: No → skip to Q11
- Q12: No → skip Q12a and Q12b

## Key domain terms

- **VP shunt**: Ventriculoperitoneal shunt, drains excess cerebrospinal fluid from the brain
- **AVM**: Arteriovenous malformation
- **Subarachnoid haemorrhage**: Bleeding in the space surrounding the brain
- **Diplopia**: Double vision
- **Nyctalopia**: Night blindness
- **Orthoptist**: Healthcare professional specialising in eye movement disorders

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
