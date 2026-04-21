# Heart Health Check: Front End Clinician Dashboard With HTML

Clinician-facing dashboard for reviewing submitted Heart Health Check assessments. Built with plain HTML, CSS, and vanilla JavaScript.

## Architecture

- Single-page dashboard with patient data table
- API client fetches from backend at `http://localhost:5150/api/dashboard/patients`
- Falls back to bundled sample data (15 patients) when API unavailable
- NHS blue (#005eb8) header and colour-coded risk badges

## Features

- **Search**: Filter by NHS number or patient name
- **Risk filter**: All, Low, Moderate, High
- **Sortable columns**: Click column headers to sort ASC/DESC
- **Patient count**: Summary of filtered results

## Files

```
front-end-dashboard-with-html/
  index.html       # Dashboard page with filter bar and data table
  css/style.css    # Responsive styling with NHS colour scheme
  js/api.js        # fetchPatients() API client
  js/dashboard.js  # Filtering, sorting, rendering logic
  js/data.js       # Sample patient data (15 records)
```

## Table columns

NHS Number, Patient Name, Age/Sex, Risk Category, 10-Year CVD Risk %, Flags, Submitted Date.

## Status

Implemented.
