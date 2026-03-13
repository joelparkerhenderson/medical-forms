# Plan: Allergy Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The allergy grader evaluates overall allergy severity by analysing drug, food, and environmental allergy data along with anaphylaxis history and comorbidities. It assigns a severity level based on the number and type of documented allergies, the severity of past reactions, the presence of anaphylaxis episodes, and whether the patient has comorbid conditions like asthma that increase risk. The result is categorised as Low (mild localised reactions only), Moderate (systemic but non-life-threatening reactions), High (severe reactions or multiple allergen categories affected), or Critical (history of anaphylaxis or life-threatening reactions requiring emergency intervention).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
