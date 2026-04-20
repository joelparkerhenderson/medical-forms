# Plan: Substance Abuse Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The substance abuse assessment uses two complementary validated screening instruments. The AUDIT (Alcohol Use Disorders Identification Test) is a 10-item questionnaire developed by the World Health Organization that screens for hazardous and harmful alcohol consumption, scoring 0-40 with cutoffs at 8 (hazardous), 16 (harmful), and 20 (dependence likely). The DAST-10 (Drug Abuse Screening Test) is a 10-item yes/no questionnaire that screens for problematic drug use, scoring 0-10 with cutoffs at 1 (low), 3 (moderate), 6 (substantial), and 9 (severe). Together these instruments provide a comprehensive picture of substance use disorders, informing treatment decisions and risk stratification. The combined severity level (low, moderate, high, critical) accounts for both scores plus clinical indicators such as active withdrawal symptoms and overdose risk.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
