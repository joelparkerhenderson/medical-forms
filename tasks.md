# Tasks

## Completed

- [x] Implement pre-operative-assessment (ASA grading, 16 steps)
- [x] Implement dermatology-assessment (DLQI scoring, 9 steps)
- [x] Implement asthma-assessment (ACT scoring, 9 steps)
- [x] Implement cardiology-assessment (CCS/NYHA, 10 steps)
- [x] Implement dental-assessment (DMFT index, 9 steps)
- [x] Implement gastroenterology-assessment (GI severity, 10 steps)
- [x] Implement gerontology-assessment (CFS, 9 steps)
- [x] Implement mental-health-assessment (PHQ-9 + GAD-7, 9 steps)
- [x] Implement neurology-assessment (NIHSS, 10 steps)
- [x] Implement opthamology-assessment (visual acuity, 10 steps)
- [x] Implement patient-intake (risk level, 10 steps)
- [x] Implement pediatric-assessment (developmental screen, 9 steps)
- [x] Implement psychiatry-assessment (GAF scale, 11 steps)
- [x] Implement pulmonology-assessment (GOLD staging, 10 steps)
- [x] Implement respirology-assessment (MRC dyspnoea, 10 steps)
- [x] Implement rheumatology-assessment (DAS28, 10 steps)
- [x] Implement autism-assessment (AQ-10, 9 steps)
- [x] Implement cognitive-assessment (MMSE, 10 steps)
- [x] Implement gynecology-assessment (symptom severity, 10 steps)
- [x] Implement kinesiology-assessment (FMS, 10 steps)
- [x] Implement mobility-assessment (Tinetti, 10 steps)
- [x] Implement orthopedic-assessment (DASH, 10 steps)
- [x] Implement prenatal-assessment (risk stratification, 10 steps)
- [x] Implement sleep-quality-assessment (PSQI, 9 steps)
- [x] Implement stroke-assessment (NIHSS, 10 steps)
- [x] Implement urology-assessment (IPSS, 10 steps)
- [x] Implement mast-cell-activation-syndrome-assessment (symptom score, 10 steps)
- [x] Implement medical-records-release-permission (form validation, 8 steps)
- [x] Implement consent-to-treatment (form validation, 8 steps)
- [x] Implement contraception-assessment (UKMEC, 10 steps)
- [x] Implement hearing-aid-assessment (HHIE-S, 9 steps)
- [x] Implement genetic-assessment (risk stratification, 10 steps)
- [x] Implement occupational-therapy-assessment (COPM, 10 steps)
- [x] Implement semaglutide-assessment (eligibility, 10 steps)
- [x] Implement advance-decision-to-refuse-treatment (validity check, 10 steps)
- [x] Implement advance-statement-about-care (completeness check, 9 steps)
- [x] Implement allergy-assessment (allergy severity, 10 steps)
- [x] Implement attention-deficit-assessment (ASRS, 10 steps)
- [x] Implement audiology-assessment (hearing level, 9 steps)
- [x] Implement ergonomic-assessment (REBA, 10 steps)
- [x] Implement hormone-replacement-therapy-assessment (MRS, 10 steps)
- [x] Implement oncology-assessment (ECOG, 10 steps)
- [x] Create index.md, AGENTS.md, plan.md, tasks.md for all projects

## Pending

- [ ] Implement encounter-satisfaction
- [ ] Implement hematology-assessment
- [ ] Implement nutrition-assessment
- [ ] Implement otolaryngology-assessment
- [ ] Implement psychology-assessment
- [ ] Implement vaccinations-assessment
- [ ] Remove `ergonomoic-assessment` misspelled duplicate directory
- [ ] Add CI/CD pipeline (`npm run check && npm run build` per project)
- [ ] Add Playwright end-to-end tests for patient form flows
- [ ] Add Zod input validation schemas
- [ ] Add accessibility audit (axe-core)
- [ ] Add backend database migrations and seed data
- [ ] Clinical safety case documentation per project
- [ ] GDPR data processing impact assessment

## Known issues

- `ergonomoic-assessment` is a misspelled duplicate of `ergonomic-assessment`
- `orthopaedic-assessment` in CLAUDE.md maps to `orthopedic-assessment` directory (American spelling)
- Some projects reference `nutrition-assessment`, `otolaryngology-assessment`, `psychology-assessment` in CLAUDE.md but directories may not exist
- SVAR Svelte Core version unknown (listed as `?` in CLAUDE.md)
