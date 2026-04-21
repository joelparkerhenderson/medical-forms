# Pre-operative Assessment by Clinician — SvelteKit data-entry wizard

SvelteKit 2 + Svelte 5 + TypeScript + Tailwind 4 single-page clinician wizard
that collects objective pre-operative findings across 16 steps, computes an
ASA Physical Status grade plus Mallampati / RCRI / STOP-BANG / Clinical
Frailty Scale scores, raises safety flags, and generates a signed PDF report.

Although the directory is named `front-end-form-with-svelte` (monorepo
convention), the data-entry operator is a **clinician**, not the patient.

## Stack

- SvelteKit 2.x
- Svelte 5 runes (`$state`, `$derived`, `$bindable`, `$props`, `$effect`)
- TypeScript strict
- Tailwind CSS 4 (`@import 'tailwindcss'`, `@theme`)
- `pdfmake` for server-side PDF generation
- Vitest for engine unit tests
- ESLint + Prettier

## Directory structure

```
src/
├── app.css                              # Tailwind entry + custom theme
├── app.html                             # HTML shell
├── app.d.ts                             # App type declarations
├── params/
│   └── step.ts                          # Route matcher 1-16
├── lib/
│   ├── engine/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── asa-rules.ts
│   │   ├── mallampati-rules.ts
│   │   ├── rcri-rules.ts
│   │   ├── stopbang-rules.ts
│   │   ├── frailty-rules.ts
│   │   ├── composite-grader.ts
│   │   ├── flagged-issues.ts
│   │   └── composite-grader.test.ts
│   ├── config/steps.ts
│   ├── stores/assessment.svelte.ts
│   ├── components/
│   │   ├── ui/
│   │   └── steps/Step01..Step16
│   └── report/pdf-builder.ts
└── routes/
    ├── +layout.svelte
    ├── +page.svelte
    ├── assessment/[step=step]/+page.svelte
    └── report/
        ├── +page.svelte
        └── pdf/+server.ts
```

## Running

```sh
npm install
npm run dev
```

Open `http://localhost:5173` and step through the wizard.

## Testing

```sh
npx vitest run
```
