# Plan: Employee Onboarding Checklist

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The employee onboarding checklist uses a completion percentage scoring system. Each of the 10 onboarding sections contains required items that must be completed before a new healthcare staff member can begin clinical duties. The completion percentage is calculated as the ratio of completed items to total required items across all sections. Status categories are: not started (0%), in progress (1-49%), mostly complete (50-89%), and complete (90-100%). Risk flags are generated for overdue items, missing mandatory training certifications, expired professional registrations, and incomplete DBS checks.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with HR staff
