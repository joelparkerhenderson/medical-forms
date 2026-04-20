# Plan: Seasonal Affective Disorder Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The seasonal affective disorder assessment uses two complementary screening instruments. The SPAQ (Seasonal Pattern Assessment Questionnaire) Global Seasonality Score (GSS) evaluates seasonal variation in six domains (sleep length, social activity, mood, weight, appetite, and energy level), each scored 0-4, yielding a total of 0-24. Scores of 0-7 indicate no SAD, 8-10 indicate subsyndromal SAD, and 11-24 indicate SAD likely. The PHQ-9 (Patient Health Questionnaire-9) screens for depression severity with nine items scored 0-3, yielding a total of 0-27. Scores of 0-4 are minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, and 20-27 severe. The combined severity integrates both instruments: no SAD (GSS 0-7 + PHQ-9 0-4), mild (subsyndromal + PHQ-9 5-9), moderate (SAD likely + PHQ-9 10-14), severe (SAD likely + PHQ-9 15-19), and critical (SAD likely + PHQ-9 20-27 or suicidal ideation present).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
