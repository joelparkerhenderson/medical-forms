# Medical Forms

Medical forms monorepo for structured clinical assessments, patient intake,
cardiovascular risk calculators, and administrative healthcare documents.
Each project collects patient data via a step-by-step questionnaire, applies a
validated scoring or grading engine, and generates a clinical report with
flagged issues.

## Projects

| Project | Scoring System | Steps |
| --- | --- | --- |
| [Advance decision to refuse treatment](forms/advance-decision-to-refuse-treatment) | Validity Check (Valid/Invalid/Incomplete) | 10 |
| [Advance statement about care](forms/advance-statement-about-care) | Completeness Score (Complete/Partial/Incomplete) | 9 |
| [Allergy assessment](forms/allergy-assessment) | Allergy Severity (Low/Moderate/High/Critical) | 10 |
| [Asthma assessment](forms/asthma-assessment) | ACT Score (5-25) | 9 |
| [Attention deficit assessment](forms/attention-deficit-assessment) | ASRS Screener | 10 |
| [Audiology assessment](forms/audiology-assessment) | Hearing Level Grade | 9 |
| [Autism assessment](forms/autism-assessment) | AQ-10 Score (0-10) | 9 |
| [Cardiology assessment](forms/cardiology-assessment) | CCS Angina / NYHA Classification | 10 |
| [Casualty card form](forms/casualty-card-form) | NEWS2 Score + Clinical Safety Alerts | 14 |
| [Cognitive assessment](forms/cognitive-assessment) | MMSE Score (0-30) | 10 |
| [Consent to treatment](forms/consent-to-treatment) | Form Completeness Validation | 8 |
| [Contraception assessment](forms/contraception-assessment) | UKMEC Categories (1-4) | 10 |
| [Dental assessment](forms/dental-assessment) | DMFT Index | 9 |
| [Dermatology assessment](forms/dermatology-assessment) | DLQI Score (0-30) | 9 |
| [Diabetes assessment](forms/diabetes-assessment) | Diabetes Risk Score | |
| [Encounter satisfaction](forms/encounter-satisfaction) | ESS Score (1.0-5.0) | 8 |
| [Ergonomic assessment](forms/ergonomic-assessment) | REBA Score (1-15) | 10 |
| [Framingham risk score](forms/framingham-risk-score-for-hard-coronary-heart-disease) | 10-Year CHD Risk (0-100%) | 10 |
| [Gastroenterology assessment](forms/gastroenterology-assessment) | GI Symptom Severity Score | 10 |
| [Genetic assessment](forms/genetic-assessment) | Risk Stratification (Low/Moderate/High) | 10 |
| [Gerontology assessment](forms/gerontology-assessment) | Clinical Frailty Scale (1-9) | 9 |
| [Gynecology assessment](forms/gynecology-assessment) | Symptom Severity Score | 10 |
| [Hearing aid assessment](forms/hearing-aid-assessment) | HHIE-S Score (0-40) | 9 |
| [Heart health check](forms/heart-health-check) | QRISK3-Based CVD Risk (0.1-95.0%) | 10 |
| [Hematology assessment](forms/hematology-assessment) | CBC Interpretation | |
| [Hormone replacement therapy assessment](forms/hormone-replacement-therapy-assessment) | MRS Score | 10 |
| [Kinesiology assessment](forms/kinesiology-assessment) | FMS Score (0-21) | 10 |
| [Mast cell activation syndrome assessment](forms/mast-cell-activation-syndrome-assessment) | Symptom Score | 10 |
| [Medical records release permission](forms/medical-records-release-permission) | Form Completeness Validation | 8 |
| [Mental health assessment](forms/mental-health-assessment) | PHQ-9 (0-27) + GAD-7 (0-21) | 9 |
| [Mobility assessment](forms/mobility-assessment) | Tinetti Score (0-28) | 10 |
| [Neurology assessment](forms/neurology-assessment) | NIHSS Score (0-42) | 10 |
| [Occupational therapy assessment](forms/occupational-therapy-assessment) | COPM Performance/Satisfaction (1-10) | 10 |
| [Oncology assessment](forms/oncology-assessment) | ECOG Performance Status (0-5) | 10 |
| [Ophthalmology assessment](forms/ophthalmology-assessment) | Visual Acuity Grade | 10 |
| [Orthopaedic assessment](forms/orthopedic-assessment) | DASH Score (0-100) | 10 |
| [Patient intake](forms/patient-intake) | Risk Level (Low/Medium/High) | 10 |
| [Pediatric assessment](forms/pediatric-assessment) | Developmental Screen | 9 |
| [Pre-operative assessment](forms/pre-operative-assessment) | ASA Grade (I-VI) | 16 |
| [PREVENT cardiovascular risk](forms/predicting-risk-of-cardiovascular-disease-events) | 10-Year CVD Risk | |
| [Prenatal assessment](forms/prenatal-assessment) | Risk Stratification (Low/Moderate/High) | 10 |
| [Psychiatry assessment](forms/psychiatry-assessment) | GAF Scale (1-100) | 11 |
| [Pulmonology assessment](forms/pulmonology-assessment) | GOLD Stage (I-IV) | 10 |
| [Respirology assessment](forms/respirology-assessment) | MRC Dyspnoea Scale (1-5) | 10 |
| [Rheumatology assessment](forms/rheumatology-assessment) | DAS28 Score | 10 |
| [SCORE2-Diabetes](forms/systematic-coronary-risk-evaluation-2-diabetes) | 10-Year CVD Risk in Type 2 Diabetes | |
| [Semaglutide assessment](forms/semaglutide-assessment) | Eligibility (Eligible/Conditional/Ineligible) | 10 |
| [Sleep quality assessment](forms/sleep-quality-assessment) | PSQI Score (0-21) | 9 |
| [Stroke assessment](forms/stroke-assessment) | NIHSS Score (0-42) | 10 |
| [UK DVLA B1 form](forms/united-kingdom-driver-and-vehicle-licensing-agency-b1-form) | Neurological Fitness to Drive | 13 |
| [UK DVLA M1 form](forms/united-kingdom-driver-and-vehicle-licensing-agency-m1-form) | Mental Health Fitness to Drive | |
| [UK DVLA V1 form](forms/united-kingdom-driver-and-vehicle-licensing-agency-v1-form) | Vision Self-Declaration | |
| [UK Maternity Certificate MAT B1](forms/united-kingdom-maternity-certificate-mat-b1) | Maternity Benefit Eligibility | |
| [Urology assessment](forms/urology-assessment) | IPSS Score (0-35) | 10 |
| [Vaccinations assessment](forms/vaccinations-assessment) | Immunisation Schedule Compliance | |
| [WHO Acute Referral Form](forms/who-acute-referral-form) | Referral Documentation | |
| [WHO Counter-Referral Form](forms/who-counter-referral-form) | Counter-Referral Documentation | |
| [WHO Emergency First Aid Form](forms/who-emergency-first-aid-form) | First Aid Documentation | |
| [WHO Emergency Unit General Form](forms/who-emergency-unit-general-form) | Emergency Documentation | 16 |
| [WHO Emergency Unit Trauma Form](forms/who-emergency-unit-trauma-form) | Trauma Documentation | |
| [WHO Prehospital Form](forms/who-prehospital-form) | Prehospital Documentation | |

## Architecture

Each project follows a consistent structure:

```
  doc/                                               # Documentation
  sql-migrations/                                    # SQL migrations for PostgreSQL database
  xml-representations/                               # XML and DTD per SQL table entity
  fhir-r5/                                           # FHIR HL7 R5 JSON per SQL table entity
  front-end-patient-form-with-html/                  # Patient questionnaire (HTML)
  front-end-patient-form-with-svelte/                # Patient questionnaire (SvelteKit)
  front-end-clinician-dashboard-with-html/           # Clinician dashboard (HTML + table)
  front-end-clinician-dashboard-with-svelte/         # Clinician dashboard (SvelteKit + SVAR Grid)
  full-stack-with-rust-axum-loco-tera-htmx-alpine/   # Full-stack option (Rust + Tera templates + HTMX + Alpine.js)
```

### Patient form pattern

1. Multi-step wizard with `StepNavigation` and `ProgressBar`
2. Pure scoring engine: `types.ts` -> `*-rules.ts` -> `*-grader.ts` -> `flagged-issues.ts`
3. Class-based Svelte 5 reactive store (`assessment.svelte.ts`)
4. PDF report generation via server endpoint (`/report/pdf`)
5. Vitest unit tests for grading logic

### Clinician dashboard pattern

- SVAR DataGrid with sortable columns and dropdown filters
- Backend API client with sample data fallback
- Patient list with assessment scores and status indicators

### Backend pattern

- Loco framework with axum routing
- Rust engine mirroring TypeScript types with `serde(rename_all = "camelCase")`
- SeaORM entities with PostgreSQL

## Technology stacks

See [AGENTS.md](AGENTS.md) for full technology stack details.

## Compliance

- [MDCG 2019-11 Rev.1 - EU MDR Software Classification](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en)
- [UK Medical Devices Regulations 2002](https://www.legislation.gov.uk/uksi/2002/618/contents)
- [ISO/IEC/IEEE 26514:2022 - Design and development of information for users](https://www.iso.org/standard/77451.html)
- [UK MHRA - Software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device)

## Install

### Claude (optional)

Claude Code:

```claudecode
/plugin marketplace add sveltejs/ai-tools
/plugin install svelte
```

Claude terminal:

```sh
claude mcp add -t stdio -s project svelte -- npx -y @sveltejs/mcp
```

## Verify

Run `bin/test`
