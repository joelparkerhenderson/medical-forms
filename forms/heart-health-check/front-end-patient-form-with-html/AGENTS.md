# Heart Health Check: Front End Patient Form With HTML

Patient-facing 10-step Heart Health Check assessment form. Built with plain HTML, CSS, and vanilla JavaScript with ES modules.

## Architecture

- Single-page 10-step wizard form with progress bar
- Landing page with feature cards and "Begin Assessment" button
- Data binding via `data-field` attributes with nested dot notation (e.g. `data-field="demographicsEthnicity.age"`)
- Conditional field visibility via `data-show-if` attribute (e.g. `data-show-if="smokingAlcohol.smokingStatus=currentSmoker"`)
- Computed values (BMI, TC/HDL ratio) calculated and displayed inline
- Risk calculation on submit with redirect to report page
- Data persisted to sessionStorage between form and report pages

## Files

```
front-end-patient-form-with-html/
  index.html             # Landing page + 10-step form wizard
  report.html            # Risk report with results, flags, rules
  css/style.css          # Responsive styling with NHS colour scheme
  js/
    app.js               # Form navigation, data binding, submission
    data-model.js        # createDefaultAssessment() with 10 sections
    steps.js             # Step metadata (number, title, section key)
    utils.js             # BMI, TC/HDL ratio, formatting, parsing helpers
    grader.js            # estimateTenYearRisk(), calculateHeartAge(), calculateRisk()
    grading-rules.js     # 20 HHC rules (evaluateRules())
    flagged-issues.js    # 13 clinical flags (detectAdditionalFlags())
```

## Scoring engine

- **grader.js**: Point-based scoring with exponential mapping; heart age calculation
- **grading-rules.js**: 20 declarative rules (HHC-001 to HHC-020) with evaluate functions
- **flagged-issues.js**: 13 safety-critical clinical alerts with priority sorting

## Report page

- Risk banner with colour-coded category, 10-year risk %, heart age
- Flagged issues list with priority colours
- Fired rules table (high/medium risk factors, low/positive factors)
- Patient summary grid
- Clinical measurements grid
- Clinician review section
- Print and new assessment actions

## Status

Implemented.
