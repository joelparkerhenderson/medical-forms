# Plan: Renal Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The renal grader computes CKD-EPI 2021 eGFR from serum creatinine, age, and sex, assigns the GFR category (G1-G5), and combines it with the urine ACR category (A1-A3) to produce the KDIGO composite risk heatmap position (Low, Moderate, High, or Very High). Acute kidney injury rules (KDIGO AKI stages 1-3) run in parallel and override CKD staging when rapid creatinine change or oligo/anuria are present. Flagged issues include AKI, rapid eGFR decline, nephrotic-range proteinuria, haematuria with proteinuria (glomerular warning), and need for medication dose adjustment.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with nephrology teams
