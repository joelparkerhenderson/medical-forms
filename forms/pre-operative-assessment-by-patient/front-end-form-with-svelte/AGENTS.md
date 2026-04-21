# Pre-op assessment: front-end patient form

SvelteKit TypeScript application for patient pre-operative assessment intake questionnaire.

@../../../AGENTS/front-end-with-sveltekit-tailwind-svar.md

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # TypeScript type checking
npx vitest run       # Run unit tests
```

## Architecture

### Directory Structure

```
src/
├── app.css                          # Tailwind CSS entry + custom theme
├── app.html                         # HTML shell
├── app.d.ts                         # App-level type declarations
├── params/
│   └── step.ts                      # Route param matcher (1-16)
├── lib/
│   ├── engine/
│   │   ├── types.ts                 # All interfaces and types
│   │   ├── utils.ts                 # BMI, METs, age, ASA helpers
│   │   ├── asa-rules.ts             # 42 declarative ASA rules
│   │   ├── asa-grader.ts            # calculateASA() pure function
│   │   ├── flagged-issues.ts        # detectAdditionalFlags()
│   │   └── asa-grader.test.ts       # Unit tests
│   ├── config/
│   │   └── steps.ts                 # 16-step wizard config
│   ├── stores/
│   │   └── assessment.svelte.ts     # Central reactive store
│   ├── components/
│   │   ├── ui/                      # 12 reusable form components
│   │   └── steps/                   # 16 step components
│   └── report/
│       └── pdf-builder.ts           # pdfmake document builder
└── routes/
    ├── +layout.svelte               # Root layout
    ├── +page.svelte                 # Landing page
    ├── assessment/
    │   ├── +layout.svelte           # Assessment layout + progress bar
    │   └── [step=step]/+page.svelte # Dynamic step renderer
    └── report/
        ├── +page.svelte             # Report preview
        └── pdf/+server.ts           # PDF generation endpoint
```

### ASA Grading Engine

- 42 declarative rules across 11 body systems
- Pure function: `calculateASA(data) → { asaGrade, firedRules }`
- Maximum-grade algorithm (worst comorbidity sets the grade)
- ASA I default when no rules fire (healthy patient)
- Each rule has unique ID for audit trail

### Safety Flag Detection

- 20+ safety-critical flags (airway, allergy, cardiac, pregnancy, etc.)
- Priority levels: high, medium, low
- Independent from ASA grade (flags can exist at any grade)

### Key Files

- `src/lib/engine/types.ts` - Source of truth for all data types
- `src/lib/engine/asa-rules.ts` - All 42 ASA rules
- `src/lib/stores/assessment.svelte.ts` - Central state store
- `src/lib/config/steps.ts` - Step definitions and navigation logic

### Testing

- Unit tests in `src/lib/engine/asa-grader.test.ts`
- Run with `npx vitest run`
- Tests cover: ASA I-IV grading, rule uniqueness, flag detection
- Vitest config uses `$lib` path alias

### Backend Integration

The frontend ASA grading engine runs client-side for immediate feedback.
The backend at `http://localhost:5150` provides:

- Assessment persistence via REST API
- Server-side grading with identical engine
- Report generation
