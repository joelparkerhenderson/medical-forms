# Clinical Safety Case

This document presents the clinical safety argument for the Pre-Operative Assessment system, including intended use, hazard analysis, risk mitigations, contraindications, and residual risk assessment.

## Intended Use Statement

The Pre-Operative Assessment system is a **clinical decision-support tool** intended to:

1. **Collect** structured patient health information through a guided questionnaire.
2. **Calculate** a preliminary ASA (American Society of Anesthesiologists) Physical Status Classification (grades I-IV) using a rule-based algorithm.
3. **Identify** safety-critical issues (flagged issues) for the reviewing anaesthetist's attention.
4. **Generate** a structured report (on-screen and PDF) summarising the assessment findings.

### Intended Users

| User | Role | Interaction |
|------|------|-------------|
| Patient | Completes the questionnaire | Self-completion on tablet or workstation |
| Pre-assessment nurse | Assists patient, reviews responses | May help patients with questions, reviews completeness |
| Anaesthetist | Reviews and validates assessment | Reviews ASA grade, flags, and patient data; makes final clinical decisions |

### Intended Environment

- Pre-operative assessment clinics
- Day surgery units
- Hospital surgical wards
- Emergency departments (as a supplementary tool)

### Not Intended For

- **Autonomous clinical decision-making.** The system does not make treatment decisions. All outputs require human clinical review.
- **Replacement of face-to-face clinical assessment.** The system supplements, not replaces, the anaesthetist's clinical evaluation.
- **Paediatric patients** (< 16 years). The questionnaire content and ASA rules are designed for adult patients.
- **Intensive care risk scoring.** The system is not an ICU mortality predictor or surgical outcomes calculator.
- **Triage or prioritisation.** The ASA grade is not intended to be used for surgical scheduling priority.

---

## Safety Argument

The overarching safety argument is:

> The Pre-Operative Assessment system is acceptably safe for its intended use because (a) it operates as decision support under clinical supervision, (b) it applies well-established medical classification standards, (c) the anaesthetist independently verifies all outputs, and (d) identified hazards have been mitigated to acceptable levels.

### Supporting Arguments

**Argument 1: Decision support, not autonomous.**
The system does not make treatment decisions, prescribe medications, or determine whether surgery should proceed. The ASA grade and flags are presented to a qualified anaesthetist who makes all clinical decisions. This human-in-the-loop design is the primary safety control.

**Argument 2: Established medical standards.**
The ASA classification system has been in clinical use since 1941 and is universally understood by anaesthetists. The rules implemented in the system are based on published guidelines (NICE, ACC/AHA, AAGBI) and standard medical education. The system does not introduce novel clinical criteria.

**Argument 3: Transparency and auditability.**
Every rule that fires is recorded with a unique ID, enabling the clinician to see exactly why a particular grade was assigned. The clinician can identify any rules they disagree with and override the grade accordingly.

**Argument 4: No data persistence risk.**
The system does not store patient data persistently. If the system fails, no data is lost because the source of truth is the patient (who can repeat the assessment) and the clinical record (which captures the anaesthetist's own assessment). The system has no long-term data integrity risk.

**Argument 5: Fail-safe design.**
If the system is unavailable, clinical work is not blocked. Paper-based pre-operative assessment is the established fallback and remains available at all times.

---

## Hazard Analysis

### Hazard Identification

| ID | Hazard | Description | Cause |
|----|--------|-------------|-------|
| HAZ-001 | ASA grade assigned too low | Patient classified as lower risk than actual, potentially leading to inadequate preparation | Rule gap, patient underreporting, multiple mild conditions with synergistic risk |
| HAZ-002 | ASA grade assigned too high | Patient classified as higher risk, potentially leading to unnecessary investigation or surgery cancellation | Over-sensitive rules, patient over-reporting |
| HAZ-003 | Missed safety flag | A safety-critical condition is not flagged, potentially leading to inadequate preparation | Missing flag rule, patient non-disclosure, unexpected clinical scenario |
| HAZ-004 | False safety flag | A flag fires incorrectly, potentially distracting from genuine concerns or causing unnecessary worry | Overly broad flag criteria, data entry error |
| HAZ-005 | Patient enters incorrect data | Questionnaire responses do not reflect actual medical history | Misunderstanding questions, language barriers, deliberate non-disclosure, data entry errors |
| HAZ-006 | System produces incorrect calculation | BMI, METs, or age calculated incorrectly, leading to wrong rule evaluations | Software bug in calculation functions |
| HAZ-007 | System unavailable | System crashes or is inaccessible when needed for patient assessment | Server failure, network issues, browser crash |
| HAZ-008 | PDF report does not match screen | PDF contains different information from the on-screen report | Software bug in PDF generation |
| HAZ-009 | Clinical rules become outdated | ASA classification guidance or clinical guidelines change, making rules inaccurate | Failure to update system, guideline changes |
| HAZ-010 | Patient data exposed | Patient health information accessed by unauthorised person | Screen visibility in shared areas, unsecured network, device left logged in |

### Risk Assessment

Risk is assessed using the NHS Clinical Safety risk matrix:

**Severity Categories:**
| Level | Description | Clinical Impact |
|-------|-------------|-----------------|
| 1 - Minor | Minor injury or illness | Temporary discomfort, no treatment change |
| 2 - Significant | Significant injury or illness | Temporary harm requiring treatment, delayed surgery |
| 3 - Major | Permanent injury or long-term harm | Incorrect anaesthetic plan leading to serious complication |
| 4 - Catastrophic | Death or permanent severe disability | Unanticipated difficult airway, MH crisis, anaphylaxis without preparation |

**Likelihood Categories:**
| Level | Description |
|-------|-------------|
| 1 - Remote | Difficult to envisage |
| 2 - Unlikely | Not expected to occur |
| 3 - Possible | May occur |
| 4 - Probable | Expected to occur |

### Risk Matrix and Evaluation

| Hazard | Severity | Likelihood (before mitigation) | Initial Risk | Mitigations | Likelihood (after mitigation) | Residual Risk |
|--------|----------|-------------------------------|--------------|-------------|------------------------------|---------------|
| HAZ-001 | Major (3) | Possible (3) | 9 - Unacceptable | M1, M2, M3 | Unlikely (2) | 6 - Tolerable |
| HAZ-002 | Significant (2) | Possible (3) | 6 - Tolerable | M1, M2 | Unlikely (2) | 4 - Acceptable |
| HAZ-003 | Catastrophic (4) | Possible (3) | 12 - Unacceptable | M1, M2, M4, M5 | Remote (1) | 4 - Acceptable |
| HAZ-004 | Minor (1) | Possible (3) | 3 - Acceptable | M1 | Possible (3) | 3 - Acceptable |
| HAZ-005 | Major (3) | Probable (4) | 12 - Unacceptable | M1, M6, M7 | Possible (3) | 9 - Tolerable |
| HAZ-006 | Major (3) | Remote (1) | 3 - Acceptable | M8 | Remote (1) | 3 - Acceptable |
| HAZ-007 | Minor (1) | Possible (3) | 3 - Acceptable | M9 | Possible (3) | 3 - Acceptable |
| HAZ-008 | Significant (2) | Remote (1) | 2 - Acceptable | M10 | Remote (1) | 2 - Acceptable |
| HAZ-009 | Major (3) | Possible (3) | 9 - Unacceptable | M11 | Unlikely (2) | 6 - Tolerable |
| HAZ-010 | Significant (2) | Possible (3) | 6 - Tolerable | M12, M13 | Unlikely (2) | 4 - Acceptable |

---

## Mitigation Register

| ID | Mitigation | Hazards Addressed |
|----|-----------|-------------------|
| M1 | **Independent clinical review.** All system outputs are reviewed by a qualified anaesthetist who performs their own clinical assessment and can override any automated classification. | HAZ-001, HAZ-002, HAZ-003, HAZ-004, HAZ-005 |
| M2 | **Transparent rule audit trail.** Every fired rule is displayed with its ID and description, allowing the clinician to verify the basis for the grade. | HAZ-001, HAZ-002, HAZ-003 |
| M3 | **Conservative rule design.** Where clinically uncertain, rules err on the side of higher classification rather than lower. | HAZ-001 |
| M4 | **Comprehensive flag coverage.** 20+ flags covering airway, allergies, anticoagulation, MH, pregnancy, cardiac devices, and other high-risk conditions. | HAZ-003 |
| M5 | **Flag priority system.** High-priority flags are visually prominent and sorted to the top of the report. | HAZ-003 |
| M6 | **Clear question wording.** Questions use plain English appropriate for patient self-completion. Medical jargon is accompanied by plain-language explanation. | HAZ-005 |
| M7 | **Clinical review of responses.** Pre-assessment nurses review questionnaire responses with the patient. | HAZ-005 |
| M8 | **Automated unit tests.** 12 automated tests verify calculation logic and rule behaviour. Regression tests run on every code change. | HAZ-006 |
| M9 | **Paper-based fallback.** Standard paper pre-assessment forms remain available if the system is unavailable. | HAZ-007 |
| M10 | **PDF generated from same data model.** The PDF builder reads from the identical data structure used for grading, minimising divergence risk. | HAZ-008 |
| M11 | **Annual clinical rule review.** Rules are reviewed annually against current guidelines by a Clinical Safety Officer. | HAZ-009 |
| M12 | **No persistent data storage.** Patient data exists only in browser memory for the session duration. | HAZ-010 |
| M13 | **HTTPS enforcement.** All data in transit is encrypted via TLS. | HAZ-010 |

---

## Contraindications

The system should **not** be used:

1. **As the sole basis for clinical decision-making.** The ASA grade must always be reviewed by a qualified anaesthetist.
2. **For paediatric patients (< 16 years)** without clinical modification of the questionnaire.
3. **For patients unable to understand or complete the questionnaire** without appropriate assistance (language, cognitive, sensory barriers).
4. **As a substitute for specialist referral** when specialist input is clinically indicated.
5. **For surgical risk scoring or mortality prediction.** The ASA classification correlates with but is not a direct predictor of operative mortality.

---

## Residual Risk Statement

After implementation of all identified mitigations, the residual risk profile is:

- **No unacceptable risks remain.** All hazards initially rated as unacceptable have been reduced to tolerable or acceptable through mitigation.
- **Tolerable risks** (HAZ-001, HAZ-005, HAZ-009) are managed through ongoing clinical supervision and annual review processes.
- **The primary safety control** across all hazards is the independent clinical review by a qualified anaesthetist (M1). This mitigation is inherent in the intended use and clinical workflow, not dependent on system features.

### Risk Acceptance

The Clinical Safety Officer should formally accept the residual risk profile before deployment, confirming that:

1. All identified hazards have been assessed.
2. All mitigations have been implemented and verified.
3. Residual risks are acceptable in the context of the clinical benefits.
4. Ongoing monitoring and review processes are in place.

---

## Post-Deployment Monitoring

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Clinical incident review | Per incident | Clinical Safety Officer |
| Grade concordance audit | Quarterly | Anaesthetic department lead |
| Rule accuracy review | Annually | Clinical Safety Officer |
| Hazard log review | Annually or per significant change | Clinical Safety Officer |
| System update safety assessment | Per release | Clinical Safety Officer |
| User feedback review | Quarterly | Product owner |
