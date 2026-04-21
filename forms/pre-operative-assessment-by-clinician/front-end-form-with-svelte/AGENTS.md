# Pre-op Assessment by Clinician — SvelteKit Front-end Agent Instructions

Single-page clinician data-entry wizard. 16 steps. Computes ASA Physical
Status, Mallampati class, RCRI, STOP-BANG, Clinical Frailty Scale, composite
risk, and safety flags. Produces a PDF report.

## Stack

- SvelteKit 2, Svelte 5 runes, TypeScript strict, Tailwind CSS 4, pdfmake, Vitest.

## Conventions

- camelCase TypeScript property names.
- Empty string `''` for unanswered text / enum fields; `null` for unanswered
  numeric fields.
- Step components named `StepNNName.svelte` (2-digit, 1-indexed).
- UI components in `src/lib/components/ui/`.
- Engine files in `src/lib/engine/` with a single `calculateASA()` pure
  function as the entry point.
- Reactive store in `src/lib/stores/assessment.svelte.ts` using `$state` runes.
- Route matcher at `src/params/step.ts` rejects anything outside 1-16.

## Engine contract

```ts
export function calculateASA(data: ClinicianAssessment): GradingResult;
```

No side effects. No network calls. No `Date.now()` inside rules. Tests pin
all expected outputs per rule.

## Rules

See `../doc/asa-grading-rules.md` and `../AGENTS.md` for the canonical rule
catalogue. Every rule has a stable `rule_id` (`R-ASA-III-02`, `R-MP-III`,
`R-RCRI-*`, `R-SB-*`, `R-CFS-*`).

## PDF report

Server route `/report/pdf`. Uses `pdfmake`. Includes clinician
identification, patient identification, findings per body system, computed
vs final ASA grade, fired rules, safety flags, anaesthesia plan, and
electronic signature line.

## Testing

Vitest in `src/lib/engine/composite-grader.test.ts`. Coverage of:
- Default ASA I when no rules fire.
- Each ASA II / III / IV / V / VI rule fires correctly.
- Max-grade algorithm (multiple rules → highest wins).
- Mallampati III+ fires difficult-airway flag.
- Echo EF < 40 % fires severe-cardiac flag.
- INR > 1.5 off anticoagulants fires coagulopathy flag.
- SpO₂ < 92 % fires severe-respiratory flag.
- CFS ≥ 7 fires severe-frailty flag.
- Recent COVID-19 < 7 weeks fires recent-covid-19 flag.
- Rule-ID uniqueness across catalogues.

Run with `npx vitest run`.

## Accessibility

WCAG 2.2 AA target. All inputs have associated `<label>`. Progress bar
announced via `aria-live`. Colour contrast meets AA. Keyboard-only
navigation of wizard verified.
