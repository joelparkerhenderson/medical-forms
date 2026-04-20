# Plan: Sports Medicine Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The PPE grader applies a rule catalogue covering the 14-point AHA cardiovascular screen, family history of sudden cardiac death or inherited cardiomyopathies, prior concussions, asthma control, musculoskeletal limitation, RED-S risk (when menstrual history is present), and vision/skin findings. Red flags (e.g. exertional syncope, family SCD < 50, positive Marfan screen) escalate the outcome to Not Cleared Pending Further Evaluation. Sport-specific contraindications (e.g. enlarged spleen in contact sport) drive Not Cleared for Sport. Flagged issues provide the rationale for each restriction and specify required further investigations.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with sports medicine clinicians
