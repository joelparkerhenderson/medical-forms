# HTML patient wizard — Agent Instructions

Single-page static HTML + Alpine.js implementation of the 16-step patient
pre-operative self-assessment wizard. Produces an ASA Physical Status
Classification grade (I–VI) and a list of fired safety flags.

## Stack

- HTML, CSS, Alpine.js 3, Tailwind CSS via CDN.
- No build step, no `node_modules`, no server.
- Browser print-to-PDF via `report.html`.

## Files

- `index.html` — wizard shell and all 16 step panels.
- `report.html` — printable report page.
- `css/` — stylesheet overrides layered on top of the Tailwind CDN.
- `js/data-model.js` — default assessment shape (camelCase fields, empty
  strings for unanswered text / enum, `null` for unanswered numeric).
- `js/steps.js` — step metadata (id, title, body system).
- `js/asa-rules.js` — 42 ASA grading rules with stable `ruleId` values.
- `js/flagged-issues.js` — safety-flag rule catalogue.
- `js/asa-grader.js` — pure grader function.
- `js/utils.js` — small formatting helpers.
- `js/api.js` — optional client for the Rust backend.
- `js/app.js` — Alpine.js component: state, navigation, grader invocation,
  report handoff.

## Engine

Implements the 42-rule ASA grader and safety-flag engine in plain
JavaScript, with the same `ruleId` values as the SvelteKit port at
`../front-end-form-with-svelte/src/lib/engine/`. The two engines must stay
aligned rule-for-rule.

## Conventions

- camelCase JavaScript property names on the assessment object.
- Empty string `''` for unanswered text / enum fields.
- `null` for unanswered numeric fields.
- Single-page wizard — no multi-page forms (monorepo rule).

## Adding a new rule

1. Add the rule to `js/asa-rules.js` (or `js/flagged-issues.js` for safety
   flags) with a fresh `ruleId`.
2. Add the same rule, with the same `ruleId`, to
   `../front-end-form-with-svelte/src/lib/engine/asa-rules.ts`.
3. If the rule depends on a field that does not yet exist in
   `js/data-model.js`, add the field with the correct empty-value
   convention.
4. Re-run `bin/test-form pre-operative-assessment-by-patient`.

## Verify

```sh
bin/test-form pre-operative-assessment-by-patient
```
