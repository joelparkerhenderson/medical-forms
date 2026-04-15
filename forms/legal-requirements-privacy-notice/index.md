# Legal Requirements Privacy Notice

## Overview

A UK NHS GP practice privacy notice informing patients how their information
is shared to meet legal requirements. The notice covers legally-mandated data
sharing with NHS England, the Care Quality Commission (CQC), and the UK Health
Security Agency for public health purposes.

The patient reads the privacy notice, confirms understanding and agreement by
checking a checkbox, then provides their full name and the current date as
acknowledgment.

## Form flow

- Step 1: Privacy Notice — patient reads the full legal requirements privacy notice
- Step 2: Acknowledgment — patient checks a box confirming understanding and agreement, enters full name and date

## Scoring

This form does not use a scoring engine. It is an acknowledgment form — the
patient either confirms or does not confirm that they have read and understood
the notice.

## Completion status

- **Complete**: checkbox is checked, full name is provided, date is provided
- **Incomplete**: any required field is missing

## Technology stacks

- SQL migrations: PostgreSQL 18 with Liquibase-format migrations
- XML representations: XML and DTD per SQL table entity
- FHIR R5: FHIR HL7 R5 JSON per SQL table entity
- Front-end patient form with HTML: single-page HTML/CSS/JS
- Front-end patient form with SvelteKit: SvelteKit 2.x, Svelte 5, Tailwind CSS 4
- Front-end clinician dashboard with HTML: single-page HTML/CSS/JS
- Front-end clinician dashboard with SvelteKit: SvelteKit 2.x, Svelte 5, SVAR DataGrid

## Conventions

- Property names use camelCase in TypeScript/Svelte and snake_case in SQL.
- Unanswered text fields default to empty string `''`.
- Unanswered date fields default to empty string `''`.
- Boolean fields default to `false`.

## Compliance

- [MDCG 2019-11 Rev.1 — EU MDR/IVDR Software Classification](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en)
- [ISO/IEC/IEEE 26514:2022 — Design and development of information for users](https://www.iso.org/standard/77451.html)
- UK GDPR Article 6(1)(c) — processing necessary for compliance with a legal obligation
- UK GDPR Article 9(2)(h) — processing necessary for health or social care purposes
