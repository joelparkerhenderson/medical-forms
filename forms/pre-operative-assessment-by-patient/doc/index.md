# Pre-Operative Assessment System - Documentation

Comprehensive documentation for the Pre-Operative Assessment web application, a clinical decision-support tool that collects patient health information through a structured questionnaire and produces an ASA (American Society of Anesthesiologists) physical status classification, flagged safety alerts, and a printable PDF report.

## Documentation Contents

### Clinical and Medical

- **[ASA Grading Rules Reference](asa-grading-rules.md)**
  Complete reference of all 42 implemented ASA classification rules, organised by body system, with rule IDs, grade assignments, and clinical rationale.

- **[Medical Capabilities](medical-capabilities.md)**
  Detailed overview of the clinical assessments covered, body systems evaluated, scoring methodologies, and the medical knowledge encoded in the system.

- **[Risk Factors and Flagged Issues](risk-factors-and-flagged-issues.md)**
  Documentation of all 20+ safety-critical flags raised for the anaesthetist, covering airway alerts, allergy warnings, anticoagulation, malignant hyperthermia, and other high-priority findings.

- **[Clinical Validation Guide](clinical-validation.md)**
  Test scenarios, expected outcomes, and procedures for validating the grading engine against known clinical cases. Includes edge cases and boundary conditions.

### Compliance and Governance

- **[Regulatory Compliance](regulatory-compliance.md)**
  Coverage of relevant regulations including data protection (GDPR/HIPAA), medical device classification, clinical safety standards (DCB 0129/DCB 0160), and audit requirements.

- **[Clinical Safety Case](clinical-safety-case.md)**
  Hazard analysis, risk mitigations, intended use statements, contraindications, and the clinical safety argument for deploying this system in a healthcare setting.

### Hospital and Operational

- **[Hospital Deployment Guide](hospital-deployment.md)**
  Practical guide for IT teams deploying the system in a hospital environment, including infrastructure requirements, network configuration, device setup for waiting room tablets, and integration considerations.

- **[Administrator Guide](administrator-guide.md)**
  System configuration, rule customisation, user management concepts, audit logging, and ongoing maintenance procedures.

### For Patients

- **[Patient Information Leaflet](patient-information-leaflet.md)**
  Plain-language guide for patients explaining what the pre-operative assessment is, why it matters, what questions to expect, and how to prepare.

### For Developers

- **[Technical Architecture](technical-architecture.md)**
  System architecture, data flow, technology stack, file structure, component design, and the grading engine's declarative rule pattern.

- **[Questionnaire Specification](questionnaire-specification.md)**
  Detailed specification of all 16 questionnaire steps, every field, data types, conditional logic, and validation rules.

- **[Backend API Reference](backend-api-reference.md)**
  REST API endpoints, request/response formats, grading engine integration, and database architecture for the Rust Axum Loco backend.
