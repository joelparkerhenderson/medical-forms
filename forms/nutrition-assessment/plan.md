# Plan: Nutrition Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The nutrition assessment uses the Malnutrition Universal Screening Tool (MUST), a five-step screening tool developed by the British Association for Parenteral and Enteral Nutrition (BAPEN). MUST combines three independent scores: Step 1 scores BMI (0 for BMI >20, 1 for 18.5-20, 2 for <18.5); Step 2 scores unplanned weight loss over the past 3-6 months (0 for <5%, 1 for 5-10%, 2 for >10%); Step 3 adds a score of 2 if there has been or is likely to be no nutritional intake for more than 5 days due to acute illness. The total MUST score determines risk: 0 = low risk (routine clinical care), 1 = medium risk (observe), >=2 = high risk (treat). Additionally, the assessment captures dysphagia screening, gastrointestinal function, food allergies and intolerances, nutritional requirements, current nutritional support, and care planning to provide a comprehensive nutritional evaluation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
