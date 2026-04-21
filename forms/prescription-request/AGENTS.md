# Prescription Request

Prescription request form with priority classification engine (Routine / Urgent / Emergency).

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./sql-migrations/ - PostgreSQL schema migrations
- ./xml-representations/ - XML and DTD per SQL table entity
- ./fhir-r5/ - FHIR HL7 R5 JSON per SQL table entity

## Scoring system

- **Instrument**: Priority Classification
- **Range**: Routine / Urgent / Emergency
- **Engine files**: `types.ts`, `prescription-rules.ts`, `prescription-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `prescription-grader.test.ts`

## Form sections (single continuous page)

1. Patient Information
2. Clinician Information
3. Prescription Details
4. Substitution Options
5. Request Type

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
