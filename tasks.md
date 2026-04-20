# Tasks

## Completed

### Fully implemented forms

- [x] Implement advance-decision-to-refuse-treatment (validity check, 10 steps)
- [x] Implement advance-statement-about-care (completeness check, 9 steps)
- [x] Implement allergy-assessment (allergy severity, 10 steps)
- [x] Implement asthma-assessment (ACT scoring, 9 steps)
- [x] Implement attention-deficit-assessment (ASRS, 10 steps)
- [x] Implement audiology-assessment (hearing level, 9 steps)
- [x] Implement autism-assessment (AQ-10, 9 steps)
- [x] Implement cardiology-assessment (CCS / NYHA, 10 steps)
- [x] Implement casualty-card-form (NEWS2, 14 steps)
- [x] Implement cognitive-assessment (MMSE, 10 steps)
- [x] Implement consent-to-treatment (form validation, 8 steps)
- [x] Implement contraception-assessment (UKMEC, 10 steps)
- [x] Implement dental-assessment (DMFT index, 9 steps)
- [x] Implement dermatology-assessment (DLQI scoring, 9 steps)
- [x] Implement encounter-satisfaction (ESS, 8 steps)
- [x] Implement ergonomic-assessment (REBA, 10 steps)
- [x] Implement framingham-risk-score-for-hard-coronary-heart-disease (10-year CHD risk, 10 steps)
- [x] Implement gastroenterology-assessment (GI severity, 10 steps)
- [x] Implement genetic-assessment (risk stratification, 10 steps)
- [x] Implement gerontology-assessment (CFS, 9 steps)
- [x] Implement gynecology-assessment (symptom severity, 10 steps)
- [x] Implement hearing-aid-assessment (HHIE-S, 9 steps)
- [x] Implement heart-health-check (QRISK3-based CVD risk, 10 steps)
- [x] Implement hormone-replacement-therapy-assessment (MRS, 10 steps)
- [x] Implement kinesiology-assessment (FMS, 10 steps)
- [x] Implement mast-cell-activation-syndrome-assessment (symptom score, 10 steps)
- [x] Implement medical-records-release-permission (form validation, 8 steps)
- [x] Implement mental-health-assessment (PHQ-9 + GAD-7, 9 steps)
- [x] Implement mobility-assessment (Tinetti, 10 steps)
- [x] Implement neurology-assessment (NIHSS, 10 steps)
- [x] Implement occupational-therapy-assessment (COPM, 10 steps)
- [x] Implement oncology-assessment (ECOG, 10 steps)
- [x] Implement ophthalmology-assessment (visual acuity, 10 steps)
- [x] Implement orthopedic-assessment (DASH, 10 steps)
- [x] Implement patient-intake (risk level, 10 steps)
- [x] Implement pediatric-assessment (developmental screen, 9 steps)
- [x] Implement pre-operative-assessment (ASA grading, 16 steps)
- [x] Implement prenatal-assessment (risk stratification, 10 steps)
- [x] Implement psychiatry-assessment (GAF scale, 11 steps)
- [x] Implement pulmonology-assessment (GOLD staging, 10 steps)
- [x] Implement respirology-assessment (MRC dyspnoea, 10 steps)
- [x] Implement rheumatology-assessment (DAS28, 10 steps)
- [x] Implement semaglutide-assessment (eligibility, 10 steps)
- [x] Implement sleep-quality-assessment (PSQI, 9 steps)
- [x] Implement stroke-assessment (NIHSS, 10 steps)
- [x] Implement systematic-coronary-risk-evaluation-2-diabetes (SCORE2-Diabetes)
- [x] Implement urology-assessment (IPSS, 10 steps)
- [x] Implement vaccinations-assessment (immunisation compliance)
- [x] Implement care-privacy-notice (completeness validation, 3 steps)
- [x] Implement prescription-request

### Design specs authored

- [x] Design spec: anesthesiology-assessment (ASA + Mallampati + RCRI + STOP-BANG)
- [x] Design spec: screening-program-privacy-notice
- [x] Design specs from `tasks2.md` (43 forms): workplace safety / climate / stress, employee satisfaction / onboarding / offboarding, CPR training, first-aid training, EMT psychomotor examination, post-traumatic stress, post-operative report, hospital discharge, provider transfer request, medical language speaking (English + Cymraeg), code of conduct notice, substance abuse, vaccinations checklist, donation (blood / organ / bone marrow), first responder, nutrition, fertility, endometriosis, integumentary, audio-vestibular, genetics, endocrinology, palliative, renal, sports medicine, otolaryngology, plastic surgery, learning disability, obstetrics, dyslexia, fall risk, sundowner syndrome, seasonal affective disorder, birth control, medical error report, patient satisfaction survey
- [x] Update root `forms/AGENTS.md` index with all task2.md form entries
- [x] Update root `index.md`, `AGENTS.md`, `plan.md`, `tasks.md`, and per-stack agent docs

## Pending

### Implementation of design-spec forms

- [ ] Implement SQL migrations, XML / DTD, FHIR R5, front-ends, and Rust backend for each design-spec-only form listed under "Design specs authored"

### Platform-wide

- [x] Fix `bin/test-form` missing closing quote (`sql-migrations/00_extensions.sql` line)
- [x] Remove `ergonomoic-assessment`, `cardiopulmonary-resuscitation-training-checklis`, and `workplace-safety-asssment` misspelled duplicate directories
- [x] Make `bin/test` pass cleanly (1,449 → 0 errors via re-scaffolding, `00_extensions.sql` template, and minimal Rust crate shells with HTMX + Alpine.js + `hx-boost` tera base template)
- [x] Reconcile `forms/AGENTS.md` index with every directory on disk
- [x] Converge `fhir-api/` → `fhir-r5/` for all forms (removed 112 empty `fhir-api/` shells; updated `bin/create-form` and `bin/test-form` to treat `fhir-r5/` as canonical)
- [x] Populate design-spec docs for 12 underpopulated forms (`advance-statement-about-care`, `urology-assessment`, `diabetes-assessment`, `predicting-risk-of-cardiovascular-disease-events`, `anesthesiology-assessment`, `international-patient-summary`, `lifeguard-certification-checklist`, `research-and-planning-privacy-notice`, `hematology-assessment`, `vaccinations-assessment`, `systematic-coronary-risk-evaluation-2-diabetes`, `framingham-risk-score-for-hard-coronary-heart-disease`)
- [x] Consolidate extensions-file naming (`00_extensions.sql` → `00-extensions.sql`) for all 112 forms and update `bin/test-form`
- [x] Add baseline 5-table SQL schema to 42 design-spec-only forms (patient, assessment, grading_result, grading_fired_rule, grading_additional_flag, using numbers 01/02/90/91/92 so domain tables can slot in between)
- [x] Regenerate XML + DTD (2,460 files) and FHIR R5 JSON (1,230 files) for every form (112/112 coverage)
- [x] Add GitHub Actions CI workflow (`bin/test`, generators, XML DTD validation, FHIR R5 resourceType check, generator-diff guard)
- [x] Scaffold SvelteKit skeletons (package.json / svelte.config.js / vite.config.ts / tsconfig.json / app.css / app.d.ts / +layout.svelte / +page.svelte) for 102 previously-empty front-end Svelte directories (patient form + clinician dashboard)
- [x] Scaffold plain-HTML skeletons (index.html + css/style.css + js/app.js) for 192 previously-empty HTML front-end directories
- [x] Fix `bin/test` typo (`test_form` → `test_forms`)
- [ ] Flesh out Svelte skeletons per form — multi-step wizard, scoring engine, Vitest tests, clinician SVAR DataGrid
- [ ] Flesh out HTML skeletons per form — form fields, scoring logic, report rendering
- [ ] Complete `predicting-risk-of-cardiovascular-disease-events` full-stack implementation
- [ ] Extend CI pipeline: `npm run check && npm run build` per front-end, `cargo build && cargo test` per backend
- [ ] Add Playwright end-to-end tests for patient form flows
- [ ] Add Zod input validation schemas
- [ ] Add axe-core accessibility audit
- [ ] Add form autosave to localStorage
- [ ] Add backend database migrations and seed data per form
- [ ] Add internationalisation (i18n) scaffolding
- [ ] Clinical safety case documentation per form
- [ ] DCB0129 clinical risk management review
- [ ] GDPR data processing impact assessment

## Known issues

- `ophthalmology-assessment` directory was corrected from `opthamology-assessment`
- `orthopedic-assessment` display name uses American spelling; UK audiences may prefer "Orthopaedic"
- The 60+ forms that received minimal Rust-crate scaffolding have valid file structure but are not yet functional Rust services — each still needs its domain-specific controllers, models, templates, migrations, and tests
