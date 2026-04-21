# United Kingdom Driver and Vehicle Licensing Agency V1 Form

General confidential medical information — vision self-declaration for driving fitness assessment by the UK DVLA.

## Source

- **Form**: V1 — General confidential medical information
- **Agency**: Driver & Vehicle Licensing Agency (DVLA), United Kingdom
- **Revision**: September 2025; Authorisation Rev July 2022
- **Pages**: 7
- **URL**: <https://assets.publishing.service.gov.uk/media/695bc852e8f9a8d94d8d1981/v1-online-confidential-medical-information.pdf>

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

- **Part A**: About You — personal details, change of details
- **Part B**: Healthcare Professional — GP details, consultant details
- **Vision Self-Declaration**: 11 questions covering eyesight standards, monocular vision, visual field, glaucoma, retinitis pigmentosa, laser treatment, blepharospasm, night blindness, double vision, other conditions, recent contact
- **Applicant's Authorisation**: Medical disclosure declaration, electronic correspondence consent, contact preferences

## Assessment steps (14 total)

1. Personal Details - Part A — current personal details and change of details
2. Healthcare Professionals - Part B — GP details and consultant details
3. Eyesight Standards - Q1 — eyesight standard for driving
4. Vision in Both Eyes - Q2 — monocular vision assessment and declaration
5. Field of Vision - Q3 — visual field problems and causes
6. Glaucoma - Q4 — glaucoma assessment
7. Retinitis Pigmentosa - Q5 — retinitis pigmentosa assessment
8. Laser Treatment - Q6 — laser treatment history
9. Blepharospasm - Q7 — blepharospasm assessment and treatment
10. Night Blindness - Q8 — nyctalopia assessment
11. Double Vision - Q9 — diplopia assessment and declaration
12. Other Vision Conditions - Q10 — additional vision conditions
13. Recent Contact - Q11 — recent healthcare professional contact
14. Authorisation - Applicant's authorisation and declaration

## Conditional logic

- Q2: Yes → skip to Q3; No → ask which eye, duration, monocular declaration
- Q3a: No → skip to Q4; Yes → ask if caused by eye condition
- Q3b: Yes → skip to Q4; No → ask specific cause
- Q4: No → skip to Q5
- Q5: No → skip to Q6
- Q6: No → skip to Q7
- Q7: No → skip to Q8
- Q8: No → skip to Q9
- Q9: No → skip to Q10; Yes → ask if controlled, double vision declaration
- Q10: No → skip to Q11

## Key domain terms

- **Snellen scale**: Visual acuity measurement; 6/12 (decimal 0.5) is the UK driving standard
- **Monocular vision**: Vision in one eye only
- **Visual field**: Total area visible when looking straight ahead, including peripheral/side vision
- **Glaucoma**: Eye condition causing optic nerve damage, often from increased eye pressure
- **Retinitis pigmentosa**: Inherited eye condition causing progressive vision loss
- **Blepharospasm**: Involuntary eyelid muscle spasm
- **Nyctalopia**: Night blindness
- **Diplopia**: Double vision
- **Orthoptist**: Healthcare professional specialising in eye movement disorders

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
