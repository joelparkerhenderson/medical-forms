# Patient Intake: Front End Clinician Dashboard With HTML

## Status

Implemented. Standalone HTML/CSS/JS clinician dashboard with no build step required.

## Overview

A plain HTML dashboard displaying patient intake data in a sortable, filterable table. Falls back to sample data when the backend API is unavailable.

## Directory structure

```
front-end-dashboard-with-html/
  index.html              # Dashboard page (header, filters, patient table)
  css/style.css           # NHS blue header, table styling, responsive layout
  js/
    data.js               # 15 sample patients (fallback data)
    api.js                # Fetch from /api/dashboard/patients
    dashboard.js          # Sort, filter, render table (ES module entry point)
  AGENTS.md               # This file
  CLAUDE.md               # References AGENTS.md
```

## Architecture

- Plain `<table>` with 5 columns: NHS Number, Patient Name, Risk Level, Reason for Visit, Allergy
- Click column headers to sort (ascending/descending toggle with visual indicators)
- Filter bar: text search (NHS number, name, reason), risk level dropdown, allergy dropdown, clear button
- Risk level badges with color coding (green=low, yellow=medium, red=high)
- Allergy badges with color coding (red=yes, green=no)
- XSS protection via DOM-based text escaping
- Falls back to sample data if backend API is unavailable
- ES module pattern (`type="module"` script tag)

## API integration

- Backend: `http://localhost:5150/api/dashboard/patients`
- Response format: `{ items: PatientRow[] }`
- PatientRow: `{ id, nhsNumber, patientName, riskLevel, reasonForVisit, allergyFlag }`
- Graceful fallback to `data.js` sample data on fetch failure

## Styling

- NHS Blue header (#005eb8)
- Responsive layout with mobile breakpoint at 768px
- Color-coded risk badges: low (green), medium (yellow), high (red)
- Color-coded allergy badges: yes (red), no (green)

## Usage

Open `index.html` directly in a browser. No build step or server required.
