# Plan: Vaccinations Assessment

## Current status

Not yet implemented. Directory structure exists but no code has been written.

## Implementation plan

Follow the same patterns as dermatology-assessment (canonical template):

1. Create front-end-form-with-svelte/ with all engine files, step components, and routes
2. Create front-end-dashboard-with-svelte/ with SVAR DataGrid
3. Create back-end-with-rust-axum-loco-json/ with Rust engine types
4. Add Vitest unit tests for grading logic

## Planned scoring system

Immunisation schedule compliance checker comparing patient vaccination records against the UK immunisation schedule (Green Book). Generates catch-up schedules for missed vaccinations and screens for contraindications (immunosuppression, allergy, pregnancy). Travel vaccination requirements based on destination country.

## Planned steps

1. Demographics
2. Childhood Vaccinations (DTaP, MMR, IPV, Hib, MenB, MenACWY, HPV)
3. Adult Vaccinations (flu, pneumococcal, shingles, COVID-19)
4. Travel Vaccinations (hepatitis A/B, typhoid, yellow fever, rabies, Japanese encephalitis)
5. Occupational Vaccinations (hepatitis B, BCG, varicella)
6. Allergy & Contraindications (egg allergy, gelatin allergy, neomycin)
7. Immunocompromised Screen (HIV, organ transplant, chemotherapy, biologics)
8. Previous Adverse Reactions (AEFI history, anaphylaxis)
9. Current Health Status (pregnancy, acute illness, recent blood products)
10. Schedule & Recommendations
