# Plan: Framingham Risk Score for Hard Coronary Heart Disease

## Current status

Implemented. Full-stack Rust backend with scoring engine, templates, and dashboard.

## Scoring engine

The Framingham scoring engine uses the Wilson/D'Agostino 1998 Cox proportional hazards regression model with sex-specific coefficients. Log-transformed predictors include age, total cholesterol, HDL cholesterol, systolic blood pressure (with separate treated/untreated coefficients), and smoking status. Baseline survival: 0.9402 (male), 0.98767 (female). Valid for ages 30-79 with no prior CHD or diabetes.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
