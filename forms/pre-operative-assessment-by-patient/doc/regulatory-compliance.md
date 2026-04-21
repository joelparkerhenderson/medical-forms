# Regulatory Compliance

This document outlines the regulatory landscape applicable to the Pre-Operative Assessment system and the compliance measures that should be implemented for clinical deployment.

## Regulatory Classification

### Medical Device Classification

The Pre-Operative Assessment system is a **clinical decision-support tool** that:
- Collects patient health information
- Applies a rule-based algorithm to produce a risk classification (ASA grade)
- Generates safety alerts (flagged issues)
- Produces a report for clinical review

Under most regulatory frameworks, this constitutes a **software as a medical device (SaMD)**.

#### UK (MHRA)

Under the UK Medical Devices Regulations 2002 (as amended) and alignment with the EU MDR:
- **Classification: Class IIa** - Software intended to provide information used to take decisions with diagnosis or therapeutic purposes is classified as Class IIa.
- **Conformity Assessment:** Requires involvement of a Notified Body.
- **Clinical Safety Standards:** Must comply with DCB 0129 (Clinical Risk Management: its Application in the Manufacture of Health IT Systems) and DCB 0160 (Clinical Risk Management: its Application in the Deployment and Use of Health IT Systems).

#### EU (MDR 2017/745)

- **Classification: Class IIa** under Rule 11 - Software intended to provide information used to take decisions with diagnosis or therapeutic purposes.
- **Requires CE marking** with Notified Body involvement.

#### US (FDA)

- **Classification: Class II** - Clinical decision support software that provides recommendations requiring clinician review.
- Under the 21st Century Cures Act, the system may qualify for exemption if it meets all four criteria for non-device CDS:
  1. Not intended to acquire, process, or analyze a medical image or signal
  2. Intended for the purpose of displaying, analyzing, or printing medical information
  3. Intended for the purpose of supporting or providing recommendations to a healthcare professional
  4. Intended for the purpose of enabling the professional to independently review the basis for the recommendations

The system likely qualifies for this exemption because the anaesthetist independently reviews all fired rules and can override the grade. However, formal FDA determination should be sought.

#### Australia (TGA)

- Likely classified as **Class IIa** under the Australian regulatory framework for software-based medical devices.

---

## Data Protection

### No Persistent Data Storage

The system is designed with a **privacy-by-design** architecture:
- All patient data is held in client-side reactive state (browser memory) only
- No data is written to a database, file system, or server-side persistent storage
- Data exists only for the duration of the browser session
- Closing the browser or navigating away clears all patient data
- The PDF is generated server-side from a POST request body and is not stored

This significantly reduces data protection obligations but does not eliminate them entirely.

### GDPR (UK/EU)

Even without persistent storage, GDPR applies because the system processes special category data (health data) under Article 9.

**Key Obligations:**

| GDPR Article | Obligation | Implementation |
|---|---|---|
| Art. 5 | Data minimisation | Only clinically necessary data collected |
| Art. 6 | Lawful basis | Legitimate interest / explicit consent for healthcare |
| Art. 9 | Special categories | Health data processed for healthcare purposes under Art. 9(2)(h) |
| Art. 13/14 | Transparency | Patient information leaflet explains data use |
| Art. 25 | Privacy by design | No persistent storage, session-only processing |
| Art. 30 | Records of processing | Hospital maintains processing register entry |
| Art. 32 | Security measures | HTTPS, no server-side storage, access controls |
| Art. 35 | DPIA | Required for health data processing at scale |

**Data Protection Impact Assessment (DPIA):** A DPIA should be conducted before deployment, as the system processes health data. The no-storage architecture significantly reduces risk but the DPIA should address:
- Data in transit (HTTPS encryption)
- Data displayed on screen in shared clinical areas
- PDF generation and storage of downloaded PDFs
- Access to the system (authentication, if implemented)
- Screen locking and session timeout

### HIPAA (US)

If deployed in the US, the system handles Protected Health Information (PHI):

| HIPAA Rule | Requirement | Implementation |
|---|---|---|
| Privacy Rule | Minimum necessary standard | Only necessary health data collected |
| Security Rule | Technical safeguards | HTTPS, no persistent storage |
| Security Rule | Access controls | Deploy behind hospital authentication |
| Breach Notification | Breach procedures | Low risk due to no persistent storage |

### Data in Transit

Even though data is not stored persistently:
- The PDF generation endpoint receives full patient data via POST request
- This data traverses the network between client and server
- **HTTPS must be enforced** in production deployments
- If the server and client are on the same host (localhost), network exposure is minimal
- If deployed behind a reverse proxy, TLS termination must be configured

---

## Clinical Safety Standards

### DCB 0129 - Manufacturer Clinical Risk Management

DCB 0129 is the NHS Digital standard for manufacturers of health IT systems. Compliance requires:

1. **Clinical Safety Officer (CSO):** A registered healthcare professional must be appointed as CSO for the system.

2. **Clinical Risk Management Plan:** Documented plan covering:
   - Scope of the system
   - Clinical risk management process
   - Roles and responsibilities
   - Risk acceptability criteria

3. **Hazard Log:** Maintained register of identified hazards, including:

| Hazard ID | Hazard | Severity | Likelihood | Risk | Mitigation |
|---|---|---|---|---|---|
| HAZ-001 | Incorrect ASA grade (too low) | Major | Possible | Significant | All grades reviewed by anaesthetist; system is decision support, not autonomous |
| HAZ-002 | Missed flagged issue | Catastrophic | Unlikely | Significant | Comprehensive flag set; anaesthetist performs independent assessment |
| HAZ-003 | Patient enters incorrect information | Major | Probable | Significant | Clear question wording; clinical review validates responses |
| HAZ-004 | System unavailable when needed | Moderate | Possible | Tolerable | Fallback to paper-based assessment; no clinical dependency |
| HAZ-005 | PDF report contains incorrect data | Major | Remote | Tolerable | PDF generated directly from same data model used for grading |
| HAZ-006 | Outdated clinical rules | Major | Possible | Significant | Version control; annual clinical review cycle; rule audit trail |

4. **Clinical Safety Case Report:** Document demonstrating that residual clinical risk is acceptable.

5. **Safety Incident Management:** Process for reporting and investigating clinical safety incidents related to the system.

### DCB 0160 - Deployer Clinical Risk Management

DCB 0160 applies to the organisation deploying the system (the hospital). The deploying organisation must:

1. Appoint a Clinical Safety Officer
2. Conduct a deployment clinical risk assessment
3. Establish operating procedures
4. Define training requirements
5. Implement incident reporting procedures

---

## Quality Management

### ISO 13485 - Medical Device Quality Management

If the system is classified as a medical device, the manufacturer should implement a quality management system compliant with ISO 13485. Key requirements include:

- Design and development controls
- Document and record management
- Risk management (ISO 14971)
- Software lifecycle management (IEC 62304)
- Post-market surveillance

### IEC 62304 - Medical Device Software Lifecycle

This standard defines the software development lifecycle for medical device software. Key processes:

| Process | Requirement | Implementation |
|---|---|---|
| Software development planning | Documented development plan | This implementation plan serves as a starting point |
| Software requirements analysis | Requirements specification | Questionnaire specification document |
| Software architectural design | Architecture documentation | Technical architecture document |
| Software unit verification | Unit testing | 12 automated vitest tests |
| Software integration testing | Integration testing | Manual test scenarios in validation guide |
| Software system testing | System-level testing | End-to-end test scenarios |
| Software release | Release management | Version control, change documentation |
| Software maintenance | Maintenance procedures | Rule update process, bug fix procedures |

### IEC 62366 - Usability Engineering

Usability is critical for a system used by patients in a clinical environment:

- **Intended users:** Patients (self-completion), clinical staff (review and override)
- **Use environment:** Waiting room tablets, clinical workstations
- **Usability goals:** Completable in 10-15 minutes, accessible on tablet screens, clear plain-language questions
- **Usability testing:** Should be conducted with representative patient groups before deployment

---

## Audit Requirements

### Audit Trail

The system maintains an audit trail through:

1. **Fired Rule IDs:** Every rule that contributed to the ASA grade is recorded with its unique ID, enabling post-hoc analysis of grading decisions.
2. **Timestamps:** The grading result includes a timestamp of when the assessment was completed.
3. **Complete Data Capture:** The PDF report captures all patient responses at the time of assessment.

### Clinical Audit

The system supports clinical audit by:
- Providing a standardised assessment format
- Recording objective rule-based grading alongside clinical override capability
- Generating PDF reports suitable for inclusion in patient records
- Enabling comparison of automated grades with clinician-assigned grades

### Recommended Audit Cycle

| Audit Activity | Frequency | Responsible |
|---|---|---|
| Rule accuracy review | Annually | Clinical Safety Officer |
| Concordance audit (automated vs clinician grade) | Quarterly | Anaesthetic department |
| Incident review | As needed | Clinical governance team |
| System update review | Per release | CSO + IT |
| DPIA review | Annually or on significant change | Data Protection Officer |

---

## Accessibility

### WCAG 2.1 Compliance

The system should aim for WCAG 2.1 Level AA compliance:

- **Perceivable:** Clear labels, sufficient colour contrast, text alternatives
- **Operable:** Keyboard navigable, no time limits on form completion
- **Understandable:** Plain language questions, consistent navigation
- **Robust:** Semantic HTML, works across browsers

### Equality Act 2010 (UK) / ADA (US)

Healthcare systems must be accessible to patients with disabilities. Considerations include:
- Screen reader compatibility
- Font size adjustability
- High contrast mode support
- Touch-friendly targets for tablet use (minimum 44px)
- Alternative assessment methods for patients unable to use the digital system

---

## Regulatory Pathway Summary

| Market | Classification | Standard | Key Requirement |
|---|---|---|---|
| UK | Class IIa SaMD | DCB 0129/0160, UK MDR | CE/UKCA marking, CSO appointment |
| EU | Class IIa SaMD | EU MDR 2017/745 | CE marking via Notified Body |
| US | Class II (or exempt CDS) | FDA 510(k) or Cures Act exemption | Formal FDA determination |
| Australia | Class IIa SaMD | TGA regulations | TGA registration |
| All markets | N/A | GDPR/HIPAA as applicable | DPIA, data protection measures |

**Important Note:** This document provides guidance on the regulatory landscape. Formal regulatory advice from a qualified regulatory affairs consultant should be obtained before pursuing any specific market approval pathway.
