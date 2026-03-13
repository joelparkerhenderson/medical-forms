# Technical Architecture

## Overview

The Casualty Card Form is a single-page web application built with SvelteKit. It presents a 14-step wizard that guides clinical staff through the complete documentation of a patient encounter in an Emergency Department or Minor Injury Unit. The application includes two calculation engines: a NEWS2 scorer and a flagged issues detector.

## Technology Stack

| Component    | Version | Purpose                          |
|-------------|---------|----------------------------------|
| SvelteKit   | 2.x     | Full-stack web framework         |
| Svelte      | 5.x     | UI reactivity with runes         |
| TypeScript  | 5.x     | Type-safe development            |
| Tailwind CSS| 4.x     | Utility-first styling            |
| Vite        | 7.x     | Build tool and dev server        |

## Directory Structure

```
src/
  lib/
    components/
      ui/
        SectionCard.svelte        -- Reusable section wrapper with heading
        ProgressBar.svelte        -- Step progress indicator
        StepNavigation.svelte     -- Previous / Next / Submit buttons
        TextInput.svelte          -- Text input with label
        NumberInput.svelte        -- Numeric input with label
        SelectInput.svelte        -- Dropdown select with label
        RadioGroup.svelte         -- Radio button group
        CheckboxGroup.svelte      -- Checkbox group
        TextArea.svelte           -- Multi-line text input
        DateInput.svelte          -- Date picker
        TimeInput.svelte          -- Time picker
        ArrayField.svelte         -- Dynamic array of items (medications, allergies, etc.)
      steps/
        Step1Demographics.svelte
        Step2NextOfKinGP.svelte
        Step3ArrivalTriage.svelte
        Step4PresentingComplaint.svelte
        Step5PainAssessment.svelte
        Step6MedicalHistory.svelte
        Step7VitalSigns.svelte
        Step8PrimarySurvey.svelte
        Step9ClinicalExamination.svelte
        Step10Investigations.svelte
        Step11Treatment.svelte
        Step12AssessmentPlan.svelte
        Step13Disposition.svelte
        Step14SafeguardingConsent.svelte
    engine/
      news2-calculator.ts         -- Pure function: vitals -> NEWS2 score + sub-scores
      flagged-issues.ts           -- Pure function: form data -> array of flagged issues
    stores/
      casualtyCard.svelte.ts      -- Svelte 5 class-based reactive store
    types/
      casualty-card.ts            -- TypeScript interfaces and types
  routes/
    +page.svelte                  -- Main page: wizard shell, step rendering, results
    +layout.svelte                -- App layout with Tailwind imports
```

## Data Flow

```
User Input
    |
    v
Step Components (bind:value via $bindable() props)
    |
    v
casualtyCard store ($state reactive properties)
    |
    +--> NEWS2 Calculator (pure function)
    |        |
    |        v
    |    NEWS2 score, sub-scores, clinical response level
    |
    +--> Flagged Issues Detector (pure function)
             |
             v
         Array of active flags with priority levels
```

### Input Flow

1. The user interacts with form controls in step components.
2. Step components use `bind:value` with `$bindable()` props to synchronise input values with the parent.
3. The parent page component writes values into the `casualtyCard` store.
4. The store properties are declared with `$state()` for reactivity.

### Calculation Flow

1. When vital signs change in the store, the NEWS2 calculator receives the current vital sign values.
2. The calculator is a pure function: it takes vitals as input and returns the NEWS2 aggregate score, individual parameter sub-scores, and the clinical response level.
3. The flagged issues detector receives the complete form data and returns an array of active flags.
4. Both engines are pure functions with no side effects, making them straightforward to test.

### Output Flow

1. The NEWS2 score and clinical response level are displayed on Step 7 (Vital Signs) and in the results summary.
2. Active flags are displayed as alert banners in the results view, colour-coded by priority (red for Critical, amber for Warning).
3. The complete form data, NEWS2 results, and flags are available for export or submission.

## Engine: NEWS2 Calculator

The NEWS2 calculator is implemented as a pure TypeScript function in `src/lib/engine/news2-calculator.ts`.

### Interface

```typescript
interface VitalSigns {
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  supplementalOxygen: boolean | null;
  systolicBP: number | null;
  heartRate: number | null;
  consciousnessLevel: 'alert' | 'confusion' | 'voice' | 'pain' | 'unresponsive' | null;
  temperature: number | null;
}

interface NEWS2Result {
  totalScore: number | null;
  subscores: {
    respiratoryRate: number;
    oxygenSaturation: number;
    supplementalOxygen: number;
    systolicBP: number;
    heartRate: number;
    consciousnessLevel: number;
    temperature: number;
  };
  clinicalResponse: 'low' | 'low-medium' | 'medium' | 'high' | null;
  hasSingleParamScore3: boolean;
}

function calculateNEWS2(vitals: VitalSigns): NEWS2Result;
```

### Behaviour

- Returns `null` for `totalScore` and `clinicalResponse` if any vital sign parameter is `null` (all seven are required for a valid score).
- Individual sub-scores are computed for any non-null parameter.
- `hasSingleParamScore3` is `true` if any individual parameter scores 3.
- The `clinicalResponse` level accounts for both the aggregate score and the single-parameter rule.

## Engine: Flagged Issues Detector

The flagged issues detector is implemented as a pure TypeScript function in `src/lib/engine/flagged-issues.ts`.

### Interface

```typescript
interface FlaggedIssue {
  id: string;
  category: string;
  priority: 'critical' | 'warning';
  message: string;
}

function detectFlaggedIssues(data: CasualtyCardData): FlaggedIssue[];
```

### Behaviour

- Evaluates all flag conditions against the current form data.
- Returns an array of active flags, sorted by priority (critical first).
- Each flag includes a human-readable message for display.
- The function is stateless: it evaluates the full data set on each call.

## State Management

The application uses a Svelte 5 class-based reactive store defined in `src/lib/stores/casualtyCard.svelte.ts`.

### Store Structure

```typescript
class CasualtyCardStore {
  // Reactive state (Svelte 5 runes)
  data = $state<CasualtyCardData>(initialData());
  result = $state<CasualtyCardResult | null>(null);
  currentStep = $state(1);

  // Derived values
  news2 = $derived(calculateNEWS2(this.data.vitalSigns));
  flags = $derived(detectFlaggedIssues(this.data));

  // Methods
  reset(): void;
  submit(): void;
}
```

### Reactive Properties

- `data` -- the complete form data object, initialised with default values (empty strings for text, `null` for numbers, empty arrays for collections).
- `result` -- the final result object, `null` until the form is submitted.
- `currentStep` -- integer 1--14 tracking the active wizard step.
- `news2` -- derived from `data.vitalSigns`, recalculated automatically when vitals change.
- `flags` -- derived from `data`, recalculated automatically when any form data changes.

## Wizard Component Architecture

### Page Shell (`+page.svelte`)

The main page component renders:

1. **ProgressBar** -- shows steps 1--14 with the current step highlighted.
2. **Active Step Component** -- conditionally renders the step component matching `currentStep`.
3. **StepNavigation** -- Previous / Next / Submit buttons with step boundary logic.
4. **Results Panel** -- displayed after submission, showing NEWS2 score, flags, and form summary.

### Step Components

Each step component (`Step1Demographics.svelte` through `Step14SafeguardingConsent.svelte`) follows a consistent pattern:

```svelte
<script lang="ts">
  let { data = $bindable() }: { data: CasualtyCardData } = $props();
</script>

<SectionCard title="Section Title">
  <TextInput label="Field Label" bind:value={data.fieldName} />
  <!-- Additional form controls -->
</SectionCard>
```

- Props use `$bindable()` for two-way data flow.
- Each step wraps its content in one or more `SectionCard` components.
- Form controls use `bind:value` to synchronise with the data object.

### UI Components

All reusable UI components reside in `src/lib/components/ui/` and follow these conventions:

- Accept a `value` prop with `$bindable()` for two-way binding.
- Include proper `<label>` elements with `for` attributes for accessibility.
- Use Tailwind CSS utility classes for styling.
- Support a `required` prop to mark mandatory fields.
- Use mobile-first responsive design.
- Render validation feedback inline below the input.

## Styling

- Tailwind CSS 4.x provides all styling through utility classes.
- No custom CSS files; all styles are expressed as Tailwind classes.
- The colour palette uses standard Tailwind colours with semantic meaning:
  - Red (`red-600`, `red-100`) for critical alerts.
  - Amber (`amber-600`, `amber-100`) for warning alerts.
  - Green (`green-600`, `green-100`) for normal/safe values.
  - Blue (`blue-600`, `blue-100`) for informational elements.
- Responsive breakpoints follow Tailwind defaults (`sm`, `md`, `lg`, `xl`).
