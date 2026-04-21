# Patient Intake: Front End Patient Form With HTML

## Status

Implemented.

## Technology Stack

Standalone HTML/CSS/JS with no build step.

## Usage

Open `index.html` in a browser. No server required.

## Directory Structure

```
front-end-form-with-html/
  index.html              # Landing page + 10-step wizard
  report.html             # Report page (risk level, flags, fired rules)
  css/style.css           # Styling (NHS colors, responsive, print)
  js/
    utils.js              # riskLevelLabel, riskLevelColor, calculateAge
    data-model.js          # createDefaultAssessment() factory
    intake-rules.js        # 25 risk rules (ported from intake-rules.ts)
    intake-grader.js       # calculateRiskLevel() pure function
    flagged-issues.js      # detectAdditionalFlags() (16+ flags)
    steps.js               # Step config (10 steps)
    app.js                 # Wizard controller: navigation, data binding
    api.js                 # Optional backend client (POST to localhost:5150)
```

## Architecture

- Single-page wizard with 10 `<section>` elements toggled via JS
- Data binding via `data-field` attributes (e.g., `data-field="personalInformation.fullName"`)
- Conditional fields via `data-show-if` attributes
- Dynamic arrays for medications and allergies (add/remove rows)
- On submit: runs grading engine client-side, stores in sessionStorage, navigates to report.html
- ES module imports throughout

## Scoring Engine

- 25 intake rules across 9 categories
- Risk levels: low (default), medium, high
- 16+ additional safety/administrative flags
- Pure functions matching the TypeScript/Svelte originals
