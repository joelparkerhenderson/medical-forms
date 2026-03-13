# Casualty Card Form - Documentation

Comprehensive documentation for the Casualty Card Form web application, a clinical document used in Emergency Departments (ED) and Minor Injury Units (MIU). It captures patient information from arrival through triage, assessment, treatment, and disposition, with NEWS2 auto-calculation (National Early Warning Score 2) and safety flag detection.

## Documentation Contents

### Clinical and Medical

- **[NEWS2 Scoring Reference](news2-scoring.md)**
  Complete reference of the NEWS2 scoring system, parameter thresholds, clinical response levels, and escalation pathways.

- **[Flagged Issues](flagged-issues.md)**
  Documentation of all safety-critical flags raised for clinical review, covering NEWS2 alerts, airway, neurological, safeguarding, and other high-priority findings.

- **[Clinical Validation Guide](clinical-validation.md)**
  Test scenarios, expected outcomes, and procedures for validating the NEWS2 calculator and flagged issues engine.

### For Developers

- **[Technical Architecture](technical-architecture.md)**
  System architecture, data flow, technology stack, file structure, component design, and the NEWS2 scoring engine.

- **[Questionnaire Specification](questionnaire-specification.md)**
  Detailed specification of all 14 questionnaire steps, every field, data types, and validation rules.
