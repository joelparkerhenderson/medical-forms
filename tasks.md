# Tasks

## Fully implemented forms

- [x] advance-decision-to-refuse-treatment (validity check, 10 steps)
- [x] advance-statement-about-care (completeness check, 9 steps)
- [x] allergy-assessment (allergy severity, 10 steps)
- [x] asthma-assessment (ACT scoring, 9 steps)
- [x] attention-deficit-assessment (ASRS, 10 steps)
- [x] audiology-assessment (hearing level, 9 steps)
- [x] autism-assessment (AQ-10, 9 steps)
- [x] cardiology-assessment (CCS / NYHA, 10 steps)
- [x] care-privacy-notice (completeness validation, 3 steps)
- [x] casualty-card-form (NEWS2, 14 steps)
- [x] cognitive-assessment (MMSE, 10 steps)
- [x] consent-to-treatment (form validation, 8 steps)
- [x] contraception-assessment (UKMEC, 10 steps)
- [x] dental-assessment (DMFT index, 9 steps)
- [x] dermatology-assessment (DLQI scoring, 9 steps)
- [x] encounter-satisfaction (ESS, 8 steps)
- [x] ergonomic-assessment (REBA, 10 steps)
- [x] framingham-risk-score-for-hard-coronary-heart-disease (10-year CHD risk, 10 steps)
- [x] gastroenterology-assessment (GI severity, 10 steps)
- [x] genetic-assessment (risk stratification, 10 steps)
- [x] gerontology-assessment (CFS, 9 steps)
- [x] gynecology-assessment (symptom severity, 10 steps)
- [x] hearing-aid-assessment (HHIE-S, 9 steps)
- [x] heart-health-check (QRISK3-based CVD risk, 10 steps)
- [x] hormone-replacement-therapy-assessment (MRS, 10 steps)
- [x] kinesiology-assessment (FMS, 10 steps)
- [x] mast-cell-activation-syndrome-assessment (symptom score, 10 steps)
- [x] medical-records-release-permission (form validation, 8 steps)
- [x] mental-health-assessment (PHQ-9 + GAD-7, 9 steps)
- [x] mobility-assessment (Tinetti, 10 steps)
- [x] neurology-assessment (NIHSS, 10 steps)
- [x] occupational-therapy-assessment (COPM, 10 steps)
- [x] oncology-assessment (ECOG, 10 steps)
- [x] ophthalmology-assessment (visual acuity, 10 steps)
- [x] orthopedic-assessment (DASH, 10 steps)
- [x] patient-intake (risk level, 10 steps)
- [x] pediatric-assessment (developmental screen, 9 steps)
- [x] pre-operative-assessment-by-clinician (ASA + Mallampati + RCRI + STOP-BANG, 16 steps)
- [x] pre-operative-assessment-by-patient (ASA grading, 16 steps)
- [x] prenatal-assessment (risk stratification, 10 steps)
- [x] prescription-request
- [x] psychiatry-assessment (GAF scale, 11 steps)
- [x] pulmonology-assessment (GOLD staging, 10 steps)
- [x] respirology-assessment (MRC dyspnoea, 10 steps)
- [x] rheumatology-assessment (DAS28, 10 steps)
- [x] semaglutide-assessment (eligibility, 10 steps)
- [x] sleep-quality-assessment (PSQI, 9 steps)
- [x] stroke-assessment (NIHSS, 10 steps)
- [x] systematic-coronary-risk-evaluation-2-diabetes (SCORE2-Diabetes)
- [x] urology-assessment (IPSS, 10 steps)
- [x] vaccinations-assessment (immunisation compliance)

## Design specs authored (awaiting full implementation)

- [x] anesthesiology-assessment (ASA + Mallampati + RCRI + STOP-BANG)
- [x] obstetrics-assessment
- [x] organ-donation-assessment
- [x] otolaryngology-assessment
- [x] palliative-assessment
- [x] patient-satisfaction-survey
- [x] plastic-surgery-assessment
- [x] post-operative-report
- [x] post-traumatic-stress-assessment
- [x] provider-transfer-request
- [x] psychology-assessment (DASS-21)
- [x] renal-assessment
- [x] screening-program-privacy-notice
- [x] seasonal-affective-disorder-assessment
- [x] sports-medicine-assessment
- [x] substance-abuse-assessment
- [x] sundowner-syndrome-assessment
- [x] vaccinations-checklist
- [x] 43 design specs covering workplace, training, donation, specialty, and
      administrative forms (see `forms/AGENTS.md` index for the full list)

## Pending

### Implementation of design-spec forms

- [ ] For each design-spec-only form: author domain-specific SQL migrations,
      regenerate XML + DTD and FHIR R5 JSON, build the four front-ends, and
      flesh out the Rust crate.

### Platform-wide

- [ ] Flesh out SvelteKit skeletons per form — multi-step wizard, scoring
      engine, Vitest tests, SVAR DataGrid dashboard.
- [ ] Flesh out HTML skeletons per form — form fields, scoring logic, report
      rendering.
- [ ] Extend CI: `npm run check && npm run build` per front-end,
      `cargo build && cargo test` per backend.
- [ ] Playwright end-to-end tests for form flows.
- [ ] Zod input validation schemas.
- [ ] axe-core accessibility audit.
- [ ] localStorage autosave.
- [ ] Backend database seed data per form.
- [ ] Internationalisation (i18n) scaffolding.
- [ ] Clinical safety case per form.
- [ ] DCB0129 clinical risk management review.
- [ ] GDPR data-processing impact assessment.

## Known issues

- Rust full-stack crates are scaffolds (`fn main() {}`) for most forms; each
  needs domain-specific controllers, models, migrations, and tests before
  `cargo build` will produce a running service.
- `orthopedic-assessment` uses the American spelling; UK audiences may
  prefer "Orthopaedic".
