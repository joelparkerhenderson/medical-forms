# Gastroenterology Assessment -- Full Stack with Rust Axum Loco Tera

Server-rendered web application for evaluating gastrointestinal symptoms including upper/lower GI, alarm features, IBD activity, liver function, nutritional status, and endoscopy needs for conditions including IBS, IBD, GERD, coeliac disease, and liver disease.

@../../../AGENTS/full-stack-with-rust-axum-loco-tera-htmx-alpine.md

## Project Structure

```
src/
  bin/main.rs              # Entry point
  lib.rs                   # Module declarations
  app.rs                   # Tera init, routes registration
  controllers/
    assessment.rs          # Landing, single-page form, submit, report
    dashboard.rs           # Dashboard with filters
  engine/
    types.rs               # AssessmentData and all GI-specific types
    gi_rules.rs            # 20 GI rules (GI-001 to GI-020, high/medium/low concern)
    gi_grader.rs           # calculate_severity() -> (SeverityLevel, f64, Vec<FiredRule>)
    flagged_issues.rs      # 14 actionable clinical flags
    utils.rs               # severity_level_label, composite scoring, alarm feature counting, BMI
  models/
    assessments.rs         # DB queries (find_by_id, list_completed)
    _entities/assessments.rs # SeaORM entity
  views/
    assessment.rs          # build_assessment_context() for single-page form
    dashboard.rs           # PatientRow with GI-specific fields
templates/
  base.html.tera           # Base layout
  landing.html.tera        # Landing page
  assessment.html.tera     # Single-page form wrapping all step partials
  assessment/
    step01-step10.html.tera # 10 step forms
  report.html.tera         # GI assessment report with severity, rules, flags
  dashboard.html.tera      # Dashboard
tests/
  engine_tests.rs          # Test harness
  engine/
    gi_grader_test.rs      # 10 grading tests
    flagged_issues_test.rs # 9 flag detection tests
```

## Assessment Flow

1. **Landing** (`GET /`) -- Describes assessment purpose, begin button
2. **Create** (`POST /assessment/new`) -- Creates draft, redirects to the single-page form
3. **Form** (`GET /assessment/{id}`) -- Renders all sections on one page
4. **Submit** (`POST /assessment/{id}/submit`) -- Saves all form data, redirects to the report
5. **Report** (`GET /assessment/{id}/report`) -- Grades and displays results
6. **Dashboard** (`GET /dashboard`) -- Lists completed assessments with filters

## 10 Assessment Steps

| Step | Title                  | Section Key           |
| ---- | ---------------------- | --------------------- |
| 1    | Patient Information    | patientInformation    |
| 2    | GI History             | giHistory             |
| 3    | Upper GI Symptoms      | upperGiSymptoms       |
| 4    | Lower GI Symptoms      | lowerGiSymptoms       |
| 5    | Alarm Features         | alarmFeatures         |
| 6    | Nutritional Assessment | nutritionalAssessment |
| 7    | Liver Assessment       | liverAssessment       |
| 8    | Investigations         | investigations        |
| 9    | Current Treatment      | currentTreatment      |
| 10   | Clinical Review        | clinicalReview        |

## Scoring Engine

### Scoring Instrument

Composite GI Severity Score derived from symptom frequency/severity ratings (0-4) across 13 scored items. The score is converted to a 0-100 percentage scale. Alarm features override score-based severity classification.

### Severity Level

| Level    | Criteria                       | Meaning                                        |
| -------- | ------------------------------ | ---------------------------------------------- |
| draft    | N/A                            | Fewer than 3 scored items answered             |
| mild     | Score 0-25, no alarm features  | Low severity, functional symptoms likely       |
| moderate | Score 26-50, no alarm features | Moderate symptoms requiring investigation      |
| severe   | Score >50 OR 1 alarm feature   | Significant symptoms or single alarm feature   |
| alarm    | 2+ alarm features              | Multiple red flags, urgent assessment required |

### Types

- GERD symptoms: heartburn frequency/severity (0-4 scale)
- Dysphagia grading: 0 (none) to 4 (complete)
- Bowel habit changes: diarrhoea, constipation, alternating
- Rectal bleeding: presence and frequency (0-4)
- Weight loss: percentage and duration
- Family cancer history: yes/no with details
- Liver function markers: ALT, AST, ALP, bilirubin (U/L or umol/L)
- Albumin: g/L
- BMI: calculated from weight/height
- MUST screening score: 0-4 (Malnutrition Universal Screening Tool)
- IBD activity index: 0 (remission) to 4 (very severe)

### 20 GI Rules (GI-001 to GI-020)

- **High concern (GI-001-005):** Multiple alarm features present, weight loss >10%, progressive dysphagia grade 3-4, active GI bleeding, jaundice
- **Medium concern (GI-006-015):** Upper GI score >60%, lower GI score >60%, rectal bleeding high frequency, IBD activity elevated, MUST high risk, elevated liver enzymes, elevated bilirubin, low albumin, weight loss 5-10%, family cancer history with age >50
- **Low concern (GI-016-020):** Mild GERD, low severity no alarms (possible IBS), minimal QoL impact, normal MUST score, normal liver function

### 14 Additional Flags

FLAG-TWW-001 (two-week wait cancer pathway), FLAG-ENDO-001 (urgent endoscopy), FLAG-COEL-001 (coeliac screening), FLAG-HP-001 (H. pylori testing), FLAG-CIRR-001 (liver cirrhosis), FLAG-NUTR-001 (malnutrition risk), FLAG-IBD-001 (IBD flare), FLAG-OBST-001 (bowel obstruction), FLAG-ALC-001 (alcohol-related liver disease), FLAG-NSAID-001 (NSAID gastropathy), FLAG-ANTICOAG-001 (anticoagulant with GI bleeding), FLAG-FHX-001 (family cancer history), FLAG-BMI-001 (low BMI)

Sorted by priority: high > medium > low.

## Dashboard

Columns: Patient Name, Primary Diagnosis, Severity Level, Alarm Features, Weight Change, Endoscopy Needed.

Filters: search (patient name/diagnosis), severity_level, endoscopy_needed.

## CSS Severity Classes

- `.severity-mild` -- green (#16a34a)
- `.severity-moderate` -- yellow (#f59e0b)
- `.severity-severe` -- orange (#f97316)
- `.severity-alarm` -- red (#dc2626)
- `.severity-draft` -- gray (#6b7280)

## Database

Single `assessments` table with JSONB `data` and `result` columns. Same schema as other assessment projects.

## Configuration

- Development: port 5370, DB `gastroenterology_assessment_tera_development`
- Test: port 5370, DB `gastroenterology_assessment_tera_test`
- Production: environment variables

## Tests

```bash
cargo test
```

19 tests covering:

- GI grader: empty->draft, mild severity, alarm for multiple alarm features, severe for single alarm feature, dysphagia rule, jaundice rule, weight loss rule, elevated liver enzymes, normal liver function, rule uniqueness
- Flagged issues: no flags for mild patient, two-week wait cancer pathway, urgent endoscopy, coeliac screening, H. pylori testing, liver cirrhosis, malnutrition risk, IBD flare, priority sorting
