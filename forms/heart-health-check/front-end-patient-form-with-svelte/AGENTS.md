# Heart Health Check: Front End Patient Form With Svelte

@../../../AGENTS/front-end-with-sveltekit-tailwind-svar.md

Patient-facing 10-step Heart Health Check assessment form. Built with SvelteKit 2.x, Svelte 5 runes, and Tailwind CSS 4.

## Architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- Dynamic route parameter validation for step numbers

## Files

```
front-end-patient-form-with-svelte/
  package.json            # Dependencies (SvelteKit, Svelte 5, Tailwind)
  svelte.config.js        # SvelteKit auto adapter
  tsconfig.json           # TypeScript strict mode
  vite.config.ts          # Tailwind + SvelteKit plugins
  src/
    app.html              # Root HTML template
    app.css               # Tailwind import + custom theme
    app.d.ts              # TypeScript declarations
    params/
      step.ts             # Route parameter validator for step numbers
    lib/
      index.ts            # Module exports
      config/
        steps.ts          # Step metadata (number, title, section key)
      stores/
        assessment.svelte.ts  # Reactive assessment state store
      engine/
        types.ts          # AssessmentData and risk-specific types
        risk-calculator.ts # estimateTenYearRisk(), calculateHeartAge()
        risk-grader.ts    # calculateRisk() orchestration
        risk-rules.ts     # 20 HHC rules (evaluateRules())
        flagged-issues.ts # 13 clinical flags (detectAdditionalFlags())
        utils.ts          # BMI, TC/HDL ratio, formatting helpers
      components/
        ui/               # Reusable form components
          TextInput.svelte
          NumberInput.svelte
          SelectInput.svelte
          RadioGroup.svelte
          CheckboxGroup.svelte
          TextArea.svelte
          Badge.svelte
          ProgressBar.svelte
          SectionCard.svelte
          StepNavigation.svelte
        steps/            # Step-specific components
          Step1PatientInformation.svelte
          Step2DemographicsEthnicity.svelte
          Step3BloodPressure.svelte
          Step4Cholesterol.svelte
          Step5MedicalConditions.svelte
          Step6FamilyHistory.svelte
          Step7SmokingAlcohol.svelte
          Step8PhysicalActivityDiet.svelte
          Step9BodyMeasurements.svelte
          Step10ReviewCalculate.svelte
    routes/
      +page.svelte        # Landing page
      +layout.svelte      # App layout
      assessment/
        +layout.svelte    # Assessment layout with progress bar
        [step=step]/
          +page.svelte    # Dynamic step page
      report/
        +page.svelte      # Risk report page
```

## Conventions

- Empty string '' for unanswered text fields
- null for unanswered numeric fields
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/

## Status

Implemented.
