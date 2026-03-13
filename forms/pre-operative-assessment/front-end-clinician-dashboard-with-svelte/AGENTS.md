# Pre-op assessment: front-end clinician dashboard

SvelteKit TypeScript application providing a clinician dashboard for reviewing patient pre-operative assessments.

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
├── lib/
│   ├── types.ts                     # PatientRow interface
│   └── data.ts                      # Sample patient data
└── routes/
    ├── +layout.svelte               # Root layout
    └── +page.svelte                 # Clinician dashboard with SVAR Grid
```

### Dashboard Columns

| Column            | Field                   | Width | Description                                |
| ----------------- | ----------------------- | ----- | ------------------------------------------ |
| NHS Number        | nhsNumber               | 140px | Patient NHS identifier                     |
| Patient Name      | patientName             | flex  | Surname, Forename format                   |
| ASA Grade         | asaGrade                | 110px | ASA I-VI (numeric stored, Roman displayed) |
| Surgery Procedure | surgeryProcedure        | flex  | Planned surgical procedure                 |
| Allergy           | allergyFlag             | 100px | Yes/No allergy flag                        |
| Prev. Adverse     | previousAdverseIncident | 130px | Yes/No previous adverse incident           |

### Filtering

- Text search across NHS number, patient name, and procedure
- Dropdown filter for ASA grade (I-IV)
- Dropdown filter for allergy flag (Yes/No)
- Dropdown filter for previous adverse incident (Yes/No)
- Clear filters button when any filter is active

### Conventions

- camelCase property names in TypeScript
- NHS Blue (#005eb8) header colour
- Imports use `$lib` path alias
