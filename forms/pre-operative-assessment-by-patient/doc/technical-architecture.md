# Technical Architecture

This document describes the system architecture, data flow, technology stack, file structure, component design, and the grading engine's declarative rule pattern.

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | SvelteKit | Full-stack web framework with SSR and file-based routing |
| Language | TypeScript | Type-safe development across client and server |
| UI Reactivity | Svelte 5 Runes | Fine-grained reactivity with `$state`, `$derived`, `$effect` |
| Styling | Tailwind CSS 4 | Utility-first CSS with mobile-first responsive design |
| Validation | Zod | Schema validation (available for client + server use) |
| PDF Generation | pdfmake | Server-side PDF document creation |
| Testing | Vitest | Unit testing framework |
| Build Tool | Vite | Development server and production bundler |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│                                                              │
│  ┌──────────┐   ┌─────────────────┐   ┌─────────────────┐  │
│  │ Landing   │──>│ Assessment      │──>│ Report          │  │
│  │ Page      │   │ Wizard (16 steps)│   │ Preview Page    │  │
│  │ /         │   │ /assessment/N   │   │ /report         │  │
│  └──────────┘   └────────┬────────┘   └────────┬────────┘  │
│                          │                      │            │
│                  ┌───────▼────────┐             │            │
│                  │ Assessment     │             │            │
│                  │ Store          │◄────────────┘            │
│                  │ ($state)       │                          │
│                  └───────┬────────┘                          │
│                          │ on submit                         │
│                  ┌───────▼────────┐                          │
│                  │ ASA Grading    │                          │
│                  │ Engine         │                          │
│                  │ (pure functions)│                          │
│                  └───────┬────────┘                          │
│                          │ result                            │
│                  ┌───────▼────────┐   POST /report/pdf      │
│                  │ Store.result   │──────────────────────┐   │
│                  └────────────────┘                      │   │
│                                                          │   │
└──────────────────────────────────────────────────────────┼───┘
                                                           │
┌──────────────────────────────────────────────────────────┼───┐
│                     Server (Node.js)                     │   │
│                                                          │   │
│  ┌───────────────────────────────────────────────────┐   │   │
│  │ POST /report/pdf                                   │◄──┘   │
│  │                                                    │       │
│  │  1. Receive assessment data + grading result       │       │
│  │  2. Build pdfmake document definition              │       │
│  │  3. Generate PDF binary                            │       │
│  │  4. Return as application/pdf response             │       │
│  └───────────────────────────────────────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Patient Input Phase

```
Patient fills wizard step → bind:value to store property → reactive state updates
```

Each form component uses Svelte 5's `$bindable` props to create two-way bindings with the central assessment store. Changes are reflected immediately in the store.

### 2. Grading Phase

```
Submit button clicked → calculateASA(store.data) → detectAdditionalFlags(store.data)
→ store.result = { asaGrade, firedRules, additionalFlags, timestamp }
→ navigate to /report
```

Both `calculateASA()` and `detectAdditionalFlags()` are **pure functions** - they take the complete `AssessmentData` object and return results without side effects.

### 3. Report Phase

```
/report page reads store.result → renders report
PDF button → POST store data to /report/pdf → server generates PDF → browser downloads
```

### 4. Session End

```
Browser closed / New Assessment clicked → store.reset() → all data cleared
```

---

## File Structure

```
src/
├── app.css                          # Tailwind CSS entry point with custom theme
├── app.html                         # HTML shell template
├── params/
│   └── step.ts                      # Route param matcher (validates step 1-16)
├── lib/
│   ├── engine/
│   │   ├── types.ts                 # All TypeScript interfaces and types
│   │   ├── utils.ts                 # BMI calc, METs estimator, age calc, ASA helpers
│   │   ├── asa-rules.ts            # 42 declarative ASA grading rules
│   │   ├── asa-grader.ts           # calculateASA() pure function
│   │   ├── flagged-issues.ts       # detectAdditionalFlags() function
│   │   └── asa-grader.test.ts      # 12 unit tests
│   ├── config/
│   │   └── steps.ts                # 16-step wizard configuration
│   ├── stores/
│   │   └── assessment.svelte.ts    # Central reactive state store
│   ├── components/
│   │   ├── ui/                     # 11 reusable form components
│   │   │   ├── RadioGroup.svelte
│   │   │   ├── CheckboxGroup.svelte
│   │   │   ├── TextInput.svelte
│   │   │   ├── NumberInput.svelte
│   │   │   ├── SelectInput.svelte
│   │   │   ├── TextArea.svelte
│   │   │   ├── SectionCard.svelte
│   │   │   ├── ProgressBar.svelte
│   │   │   ├── StepNavigation.svelte
│   │   │   ├── MedicationEntry.svelte
│   │   │   ├── AllergyEntry.svelte
│   │   │   └── Badge.svelte
│   │   └── steps/                  # 16 step components
│   │       ├── Step1Demographics.svelte
│   │       ├── Step2Cardiovascular.svelte
│   │       ├── ...
│   │       └── Step16Pregnancy.svelte
│   └── report/
│       └── pdf-builder.ts          # pdfmake document definition builder
└── routes/
    ├── +layout.svelte              # Root layout (CSS import)
    ├── +page.svelte                # Landing page
    ├── assessment/
    │   ├── +layout.svelte          # Assessment layout (header + progress bar)
    │   └── [step=step]/
    │       └── +page.svelte        # Dynamic step renderer
    └── report/
        ├── +page.svelte            # Report preview page
        └── pdf/
            └── +server.ts          # PDF generation endpoint
```

---

## Component Architecture

### Reusable UI Components

All form components follow a consistent pattern:

```svelte
<script lang="ts">
    let {
        label,
        name,
        value = $bindable(''),  // Two-way binding with parent
        required = false
    }: {
        label: string;
        name: string;
        value: string;
        required?: boolean;
    } = $props();
</script>
```

Key design decisions:
- **`$bindable` props** for two-way data flow with the store
- **Consistent styling** via Tailwind utility classes
- **Accessible** with proper `<label>` associations and ARIA attributes
- **Mobile-first** responsive design

### Step Components

Each step component:
1. Imports the assessment store
2. Destructures the relevant section (e.g., `const c = assessment.data.cardiovascular`)
3. Uses reusable UI components with `bind:value` to store properties
4. Implements conditional sub-questions with `{#if}` blocks

### Dynamic Step Renderer

The `[step=step]/+page.svelte` route:
1. Reads the step number from the URL parameter
2. Renders the corresponding step component via `{#if}`/`{:else if}` chain
3. Provides navigation (previous/next) with conditional pregnancy step skip
4. Handles form submission (calculateASA + detectFlags + navigate to report)

---

## State Management

### Assessment Store

The store uses Svelte 5's class-based reactive state:

```typescript
class AssessmentStore {
    data = $state<AssessmentData>(createDefaultAssessment());
    result = $state<GradingResult | null>(null);
    currentStep = $state(1);

    reset() {
        this.data = createDefaultAssessment();
        this.result = null;
        this.currentStep = 1;
    }
}

export const assessment = new AssessmentStore();
```

- **`data`**: The complete patient questionnaire responses
- **`result`**: The grading result (null until assessment is submitted)
- **`currentStep`**: Current wizard step number (synced with URL)

### Reactivity Chain

```
User input → bind:value → store.data.section.field updates
           → $derived values (BMI, METs) recalculate
           → UI reflects new values
```

---

## ASA Grading Engine Design

### Declarative Rule Pattern

Rules are declared as data, not imperative code:

```typescript
interface ASARule {
    id: string;                          // Unique identifier
    system: string;                      // Body system label
    description: string;                 // Human-readable description
    grade: ASAGrade;                     // ASA grade (2, 3, or 4)
    evaluate: (data: AssessmentData) => boolean;  // Predicate function
}
```

This pattern provides:
- **Auditability**: Each rule has a unique ID tracked through the system
- **Testability**: Rules can be tested independently
- **Maintainability**: Rules can be added/removed without changing the engine
- **Transparency**: The report shows exactly which rules fired

### Grading Algorithm

```typescript
function calculateASA(data: AssessmentData): { asaGrade: ASAGrade; firedRules: FiredRule[] } {
    const firedRules = [];
    for (const rule of asaRules) {
        if (rule.evaluate(data)) {
            firedRules.push({ id, system, description, grade });
        }
    }
    const asaGrade = firedRules.length === 0
        ? 1  // Healthy patient
        : Math.max(...firedRules.map(r => r.grade));  // Worst comorbidity
    return { asaGrade, firedRules };
}
```

### Flag Detection

Flags follow a similar but distinct pattern - they are procedural checks that produce prioritised alerts rather than grade assignments.

---

## PDF Generation

### Architecture

PDF generation uses server-side pdfmake via a POST endpoint:

1. Client sends full `AssessmentData` + `GradingResult` as JSON
2. Server builds a pdfmake `TDocumentDefinitions` object
3. pdfmake renders to PDF binary using PdfPrinter
4. Server returns the PDF as a binary response

### Why Server-Side?

- pdfmake's client-side bundle is large (~2MB with fonts)
- Server-side generation keeps the client bundle lean
- Server-side is more reliable across different browsers and devices

---

## Routing

### File-Based Routing (SvelteKit)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `routes/+page.svelte` | Landing page |
| `/assessment/1` through `/assessment/16` | `routes/assessment/[step=step]/+page.svelte` | Wizard steps |
| `/report` | `routes/report/+page.svelte` | Report preview |
| `POST /report/pdf` | `routes/report/pdf/+server.ts` | PDF download |

### Param Matcher

The `step` param matcher validates that the URL parameter is an integer between 1 and 16:

```typescript
export const match: ParamMatcher = (param) => {
    const n = parseInt(param, 10);
    return !isNaN(n) && n >= 1 && n <= 16;
};
```

### Navigation Flow

```
/ (landing) → /assessment/1 → /assessment/2 → ... → /assessment/15
                                                          │
                                                          ├─→ /assessment/16 (if female 12-55)
                                                          │        │
                                                          │        ▼
                                                          └───→ /report
```

---

## Testing Strategy

### Unit Tests (Automated)

Located in `src/lib/engine/asa-grader.test.ts`:
- Test the grading engine with known patient profiles
- Verify ASA I through IV classification
- Test flag generation and priority sorting
- Verify rule uniqueness

Run with: `npx vitest run`

### Type Checking

`npx svelte-check` verifies TypeScript types across all `.svelte` and `.ts` files.

### Integration Testing

Manual testing through the browser:
- Walk through all 16 steps
- Submit and verify the report
- Download and inspect the PDF
- Test responsive layout on tablet viewport

---

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Client JS bundle | ~50 KB (gzipped) | Steps are in a single route chunk |
| CSS bundle | ~5 KB (gzipped) | Tailwind tree-shakes unused utilities |
| Grading engine execution | < 1ms | 42 rule evaluations, all synchronous |
| PDF generation | ~200-500ms | Server-side, depends on content volume |
| Time to interactive | < 1 second | SvelteKit SSR with hydration |
| Memory usage (server) | ~50 MB | Node.js baseline + pdfmake |

---

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| XSS | Svelte auto-escapes all rendered values; no `{@html}` usage |
| CSRF | SvelteKit built-in CSRF protection on form actions |
| Data in transit | HTTPS required for production |
| Data at rest | Backend uses PostgreSQL with parameterised queries; no raw SQL |
| Injection | SeaORM parameterised queries prevent SQL injection; no shell execution |
| Dependency vulnerabilities | Regular `npm audit`; minimal dependency tree |
