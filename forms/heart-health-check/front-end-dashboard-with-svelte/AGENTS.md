# Heart Health Check: Front End Clinician Dashboard With Svelte

@../../../AGENTS/front-end-with-sveltekit-tailwind-svar.md

Clinician-facing dashboard for reviewing submitted Heart Health Check assessments. Built with SvelteKit, Svelte 5, Tailwind CSS 4, and SVAR DataGrid.

## Architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $effect)
- Tailwind CSS 4 with custom theme colours (NHS blue, risk category colours)
- SVAR DataGrid (@svar-ui/svelte-grid) with Willow theme for tabular data
- API client fetches from `http://localhost:5150/api/dashboard/patients`
- Falls back to bundled sample data (15 patients) when API unavailable

## Features

- **Search**: Filter by NHS number or patient name
- **Risk filter**: All, Low, Moderate, High
- **Data grid**: Sortable columns via SVAR Willow/Grid components
- **Patient count**: Summary of filtered results

## Files

```
front-end-dashboard-with-svelte/
  package.json            # Dependencies (SvelteKit, Svelte 5, Tailwind, SVAR)
  svelte.config.js        # SvelteKit auto adapter
  tsconfig.json           # TypeScript strict mode
  vite.config.ts          # Tailwind + SvelteKit plugins
  src/
    app.html              # Root HTML template
    app.css               # Tailwind import + custom theme
    app.d.ts              # TypeScript declarations
    lib/
      index.ts            # Module exports
      types.ts            # PatientRow, DashboardPatientsResponse interfaces
      api.ts              # fetchPatients() API client
      data.ts             # Sample patient data (15 records)
    routes/
      +layout.svelte      # App layout with CSS import
      +page.svelte         # Dashboard page with grid, filters
```

## Grid columns

NHS Number, Patient Name, Age, Sex, Risk Category, 10-Year CVD %, Heart Age, Flags, Submitted Date.

## Status

Implemented.
