# Patient Intake: Front End Clinician Dashboard With Svelte

@../../../AGENTS/front-end-with-sveltekit-tailwind-svar.md

## Status

Implemented.

## Technology Stack

| Component            | Version | Purpose                     |
| -------------------- | ------- | --------------------------- |
| SvelteKit            | 2.x     | Full-stack web framework    |
| Svelte               | 5.x     | UI reactivity with runes    |
| TypeScript           | 5.x     | Type-safe development       |
| Tailwind CSS         | 4.x     | Utility-first styling       |
| SVAR Svelte DataGrid | 2.x     | Data table with sort/filter |
| Vite                 | 7.x     | Build tool and dev server   |

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Type-check with svelte-check

## Directory Structure

```
front-end-dashboard-with-svelte/
  package.json
  svelte.config.js
  vite.config.ts
  tsconfig.json
  src/
    app.html                  # HTML shell
    app.css                   # Tailwind CSS 4 with custom theme
    lib/
      index.ts                # Library barrel file
      types.ts                # PatientRow, DashboardPatientsResponse
      api.ts                  # fetchPatients() from backend API
      data.ts                 # 15 sample patient records
    routes/
      +layout.svelte          # Root layout
      +page.svelte            # Dashboard page with SVAR Grid
```

## Features

- SVAR DataGrid with Willow theme for consistent styling
- Sortable columns (NHS Number, Patient Name, Risk Level, Reason for Visit, Allergy Flag)
- Filter bar with text search, risk level dropdown, and allergy dropdown
- Fetches from backend API (localhost:5150), falls back to sample data if unavailable
- 15 sample patients with realistic medical scenarios
- Risk level distribution: 6 low, 5 medium, 4 high

## Architecture

- Uses Svelte 5 runes ($state, $derived, $props, $effect)
- SVAR Grid API for programmatic sorting and filtering
- NHS Blue color scheme (#005eb8)
- Responsive design with Tailwind utilities
