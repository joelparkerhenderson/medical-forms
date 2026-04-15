# Screening Program Privacy Notice

A UK NHS GP practice privacy notice informing patients how their information
is used for medical research, planning services, and checking the quality of
care (national clinical audits). The patient reads the notice, confirms
understanding and agreement, then provides their full name and date.

## Form flow

- Step 1: Privacy Notice — patient reads the full screening program privacy notice
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
- Front-end clinician dashboard with HTML: single-page HTML/CSS/JS

## Conventions

- Property names use camelCase in JavaScript and snake_case in SQL.
- Unanswered text fields default to empty string `''`.
- Unanswered date fields default to empty string `''`.
- Boolean fields default to `false`.

## Compliance

- UK GDPR Article 6(1)(e) — processing necessary for a task carried out in the public interest
- UK GDPR Article 9(2)(a) — explicit consent for special category data
- UK GDPR Article 9(2)(j) — scientific or historical research purposes
- UK GDPR Article 9(2)(h) — preventative medicine, health/social care provision
