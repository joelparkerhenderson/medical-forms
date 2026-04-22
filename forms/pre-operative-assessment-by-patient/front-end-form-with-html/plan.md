# Plan: Static HTML patient wizard

## Status

Implemented. Single-page HTML + Alpine.js wizard backed by a JavaScript ASA
grading engine, no build step required.

## Build order

1. [x] `index.html` — 16-step single-page wizard shell with Tailwind CDN
       and Alpine.js 3.
2. [x] `js/data-model.js` — default assessment shape (camelCase, empty
       strings, `null` for unanswered numerics).
3. [x] `js/steps.js` — step metadata (id, title, body-system grouping).
4. [x] `js/asa-rules.js` — 42 ASA rules across 11 body systems, each with a
       stable `ruleId`.
5. [x] `js/flagged-issues.js` — safety-flag rule catalogue.
6. [x] `js/asa-grader.js` — pure grader that runs the rule set and returns
       the computed ASA grade plus fired rules.
7. [x] `js/utils.js` — formatting helpers.
8. [x] `js/api.js` — optional thin client for backend persistence.
9. [x] `js/app.js` — Alpine.js component wiring state, step navigation,
       grader invocation, and report handoff.
10. [x] `report.html` — printable report template (browser print-to-PDF).

## Future enhancements

- Offline-first service worker.
- LocalStorage autosave.
- Accessibility audit with axe-core.
