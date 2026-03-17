# United Kingdom Maternity Certificate MAT B1

Maternity certificate issued by doctors or registered midwives for statutory maternity benefits claims.

## Source

- **Form**: MAT B1 — Maternity Certificate
- **Governing body**: Department for Work and Pensions (DWP)
- **Guidance URL**: <https://www.gov.uk/government/publications/maternity-certificate-mat-b1-guidance-for-health-professionals/maternity-certificate-form-mat-b1-guidance-on-completion>

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./doc/ - Reference documentation
- ./front-end-patient-form-with-html/ - Patient questionnaire; HTML
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-html/ - Clinician dashboard; HTML
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Form parts

- **Front page**: Patient name
- **Part A**: Pre-confinement — expected date of confinement (EWC)
- **Part B**: Post-confinement — actual date of birth and expected date
- **Issuer validation**: Healthcare professional credentials (NMC ID for midwives, name/address stamp for doctors)

## Benefits enabled

1. Statutory Maternity Pay (SMP) — from employer
2. Maternity Allowance (MA) — from Jobcentre Plus
3. Sure Start Maternity Grant (SSMG) — from Jobcentre Plus

## Assessment steps (4 total)

1. Patient Identification - Patient name on front page
2. Pre-Confinement Certificate - Part A — expected date of confinement
3. Post-Confinement Certificate - Part B — actual date of birth and expected date
4. Issuer Validation - Healthcare professional credentials

## Key rules

- Issue only when satisfied patient is pregnant
- Must not be issued more than 20 weeks before EWC
- Must be completed in ink
- Must use forms with unique certificate number
- Duplicates marked "DUPLICATE", only for lost/incomplete originals
- Not available for use outside UK

## Who completes it

- **Doctors**: Use name and address stamp
- **Registered midwives**: Include NMC personal identification number and NMC registration expiry date
- Must be issued free of charge

## Key domain terms

- **EWC**: Expected week of confinement — the estimated week of birth
- **SMP**: Statutory Maternity Pay
- **MA**: Maternity Allowance
- **SSMG**: Sure Start Maternity Grant
- **NMC**: Nursing and Midwifery Council

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
