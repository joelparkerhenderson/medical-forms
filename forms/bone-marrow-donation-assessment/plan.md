# Plan: Bone Marrow Donation Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The bone marrow donation assessment uses a Donor Eligibility Classification system combined with HLA Match Grading. Potential haematopoietic stem cell donors are evaluated across ten domains: demographics, HLA typing and donor registration status, comprehensive medical history, physical examination, haematological parameters, infectious disease screening, anaesthetic fitness, collection method suitability (peripheral blood stem cells via apheresis vs bone marrow harvest under general anaesthesia), psychological readiness, and informed consent. The eligibility outcome is one of three categories: suitable (ideal match, healthy donor, no contraindications), conditionally suitable (minor issues requiring further evaluation), or unsuitable (contraindicated). An overall risk level (low, moderate, high, critical) is assigned based on the worst-case finding across all domains. Rules fire for HLA mismatch severity, abnormal blood counts, positive infectious disease markers, anaesthetic risk factors, and psychological concerns.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
