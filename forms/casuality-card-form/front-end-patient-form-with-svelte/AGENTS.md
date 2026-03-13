# Casualty card form: front-end patient form

SvelteKit TypeScript application for Emergency Department casualty card documentation.

@../../../AGENTS/front-end-with-sveltekit-tailwind-svar.md

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # TypeScript type checking
```

## Architecture

### Directory Structure

```
src/
├── app.css                          # Tailwind CSS entry + custom theme
├── app.html                         # HTML shell
├── app.d.ts                         # App-level type declarations
├── params/
│   └── step.ts                      # Route param matcher (1-14)
├── lib/
│   ├── engine/
│   │   ├── types.ts                 # All interfaces and types
│   │   ├── utils.ts                 # Age, NEWS2 helpers
│   │   ├── news2-calculator.ts      # calculateNEWS2() pure function
│   │   └── flagged-issues.ts        # detectFlaggedIssues()
│   ├── config/
│   │   └── steps.ts                 # 14-step wizard config
│   ├── stores/
│   │   └── casualtyCard.svelte.ts   # Central reactive store
│   ├── components/
│   │   ├── ui/                      # 10 reusable form components
│   │   └── steps/                   # 14 step components
│   └── index.ts                     # Exports
└── routes/
    ├── +layout.svelte               # Root layout
    ├── +page.svelte                 # Landing page
    ├── assessment/
    │   ├── +layout.svelte           # Assessment layout + progress bar
    │   └── [step=step]/+page.svelte # Dynamic step renderer
    └── report/
        └── +page.svelte             # Report preview
```

### NEWS2 Scoring Engine

- 7 parameters: RR, SpO2, Systolic BP, Pulse, Consciousness, Temperature, Supplemental O2
- Pure function: `calculateNEWS2(vitals) → { totalScore, parameterScores, clinicalResponse, hasAnySingleScore3 }`
- Score range 0-20
- Clinical response thresholds: Low (0-4), Low-Medium (single 3), Medium (5-6), High (>=7)

### Safety Flag Detection

- 11 safety-critical flags (NEWS2, airway, neurological, safeguarding, allergies, etc.)
- Priority levels: high, medium, low
- Independent from NEWS2 score (flags can exist at any score)

### Key Files

- `src/lib/engine/types.ts` - Source of truth for all data types
- `src/lib/engine/news2-calculator.ts` - NEWS2 scoring algorithm
- `src/lib/stores/casualtyCard.svelte.ts` - Central state store
- `src/lib/config/steps.ts` - Step definitions and navigation logic
