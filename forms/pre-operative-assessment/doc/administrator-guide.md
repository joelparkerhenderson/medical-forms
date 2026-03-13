# Administrator Guide

This guide covers system configuration, rule customisation, audit capabilities, and ongoing maintenance for the Pre-Operative Assessment system.

## System Overview for Administrators

The Pre-Operative Assessment system is a web application that:
- Presents a 16-step health questionnaire to patients
- Evaluates responses against 42 ASA grading rules
- Generates 20+ safety flags for the anaesthetist
- Produces an on-screen report and downloadable PDF

The system includes a Rust backend with PostgreSQL database for persistent storage, and a SvelteKit frontend for the patient-facing questionnaire.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | HTTP port the server listens on |
| `HOST` | 0.0.0.0 | Host interface to bind to |
| `ORIGIN` | (auto-detected) | The URL origin for CSRF protection |

Example:

```bash
PORT=8080 HOST=127.0.0.1 ORIGIN=https://preop.hospital.nhs.uk node build/index.js
```

### Build Configuration

The build is configured in `vite.config.ts` and `svelte.config.js`. These rarely need modification for standard deployments.

---

## Rule Customisation

### Understanding the Rule Structure

Each ASA rule in `src/lib/engine/asa-rules.ts` is a JavaScript object:

```typescript
{
    id: 'CV-001',           // Unique identifier (system prefix + number)
    system: 'Cardiovascular', // Body system for grouping
    description: 'Controlled hypertension',  // Human-readable label
    grade: 2,               // ASA grade this rule assigns (2, 3, or 4)
    evaluate: (d) =>        // Function that returns true/false
        d.cardiovascular.hypertension === 'yes' &&
        d.cardiovascular.hypertensionControlled === 'yes'
}
```

### Adding a New Rule

1. Open `src/lib/engine/asa-rules.ts`.
2. Add a new rule object to the `asaRules` array.
3. Assign a unique ID following the naming convention (`XX-NNN` where `XX` is the system prefix).
4. Write the `evaluate` function to test the appropriate fields in the `AssessmentData` structure.
5. Add a corresponding unit test in `src/lib/engine/asa-grader.test.ts`.
6. Rebuild and test.

**Example - Adding a rule for severe aortic stenosis:**

```typescript
{
    id: 'CV-011',
    system: 'Cardiovascular',
    description: 'Severe aortic stenosis',
    grade: 4,
    evaluate: (d) =>
        d.cardiovascular.valvularDisease === 'yes' &&
        d.cardiovascular.valvularDetails.toLowerCase().includes('severe aortic stenosis')
}
```

### Modifying an Existing Rule

1. Locate the rule by its ID in `src/lib/engine/asa-rules.ts`.
2. Modify the `grade` or `evaluate` function as needed.
3. Update the corresponding unit test.
4. Document the change with the date and clinical rationale.
5. Rebuild and test.

### Disabling a Rule

To temporarily disable a rule without removing it, wrap the evaluate function:

```typescript
evaluate: (d) => false  // Disabled: original logic was...
```

Or remove the rule from the array and keep it in a comment block for reference.

### Rule ID Conventions

| Prefix | System |
|--------|--------|
| CV | Cardiovascular |
| RS | Respiratory |
| RN | Renal |
| HP | Hepatic |
| EN | Endocrine |
| NR | Neurological |
| HM | Haematological |
| OB | Obesity |
| FC | Functional Capacity |
| AG | Age / Demographics |
| SH | Social History |

### Flag Customisation

Flags in `src/lib/engine/flagged-issues.ts` follow a similar pattern but use the `AdditionalFlag` structure:

```typescript
{
    id: 'FLAG-AIRWAY-001',
    category: 'Airway',
    message: 'Previous difficult airway reported',
    priority: 'high'  // 'high' | 'medium' | 'low'
}
```

To add, modify, or remove flags, edit the `detectAdditionalFlags()` function.

---

## Questionnaire Customisation

### Adding a Question to an Existing Step

1. Add the new field to the appropriate interface in `src/lib/engine/types.ts`.
2. Add a default value in `src/lib/stores/assessment.svelte.ts`.
3. Add the UI component in the corresponding step file (`src/lib/components/steps/StepN*.svelte`).
4. If the question affects grading, add corresponding rules and/or flags.
5. Rebuild and test.

### Modifying Question Wording

Question text is defined directly in the step component files. Edit the `label` property of the relevant form component.

### Conditional Questions

Questions can be shown/hidden based on previous answers using Svelte's `{#if}` blocks:

```svelte
{#if data.field === 'yes'}
    <TextInput label="Please provide details" ... />
{/if}
```

---

## Audit and Reporting

### Assessment Audit Trail

Each completed assessment produces:

1. **ASA Grade** (I-IV)
2. **Fired Rules List** with unique IDs
3. **Additional Flags** with priority levels
4. **Timestamp** of assessment completion
5. **Complete Patient Responses** captured in the PDF

### Generating Audit Data

Since the system has no persistent storage, audit data must be captured externally:

| Method | Description | Complexity |
|--------|------------|------------|
| PDF archive | Save downloaded PDFs to a shared network drive | Low |
| Server request logging | Log POST requests to `/report/pdf` (without body) | Low |
| Custom audit endpoint | Add a server endpoint that logs assessment metadata | Medium |
| EHR integration | Push assessment results to the electronic health record | High |

### Recommended Audit Workflow

1. Patient completes assessment.
2. Anaesthetist reviews on screen.
3. PDF is downloaded and saved to the patient's electronic record.
4. Anaesthetist documents their final ASA grade (which may differ from the automated grade).
5. Discrepancies between automated and clinician grades are reviewed quarterly.

---

## Maintenance Procedures

### Regular Maintenance Tasks

| Task | Frequency | Procedure |
|------|-----------|-----------|
| Node.js security updates | Monthly | Update Node.js to latest patch version |
| npm dependency audit | Monthly | Run `npm audit` and update packages |
| Clinical rule review | Annually | CSO reviews rules against current guidelines |
| TLS certificate renewal | Per certificate expiry | Renew and deploy new certificates |
| Tablet device maintenance | Quarterly | Check device health, update OS, clean screens |
| Backup verification | Quarterly | Verify rebuild procedure from source |

### Dependency Updates

```bash
# Check for vulnerabilities
npm audit

# Update non-breaking changes
npm update

# Check for major version updates
npx npm-check-updates

# After updates, always run tests
npx vitest run
npx svelte-check
npm run build
```

### Version Management

The system version is tracked in `package.json`. Use semantic versioning:

- **Patch** (1.0.x): Bug fixes, dependency updates
- **Minor** (1.x.0): New questions, new rules, UI improvements
- **Major** (x.0.0): Architectural changes, breaking rule changes, new body system sections

---

## Troubleshooting for Administrators

### Common Issues

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Blank page on load | JavaScript error | Check browser console (F12); rebuild application |
| PDF generation fails | Server-side error | Check server logs; verify pdfmake installed |
| Styles missing | CSS build issue | Run `npm run build` and redeploy |
| Assessment data disappears | Page refresh | Expected behaviour; data is session-only |
| Tablet can't access system | Network issue | Verify tablet is on correct network; check firewall |
| Step 16 not showing | Conditional logic | Only shows for female patients age 12-55 |
| ASA grade seems wrong | Rule evaluation | Check fired rules list; each rule ID is traceable to source |

### Diagnostic Commands

```bash
# Check application is running
curl -I http://localhost:3000

# Check Node.js version
node --version

# Run test suite
npx vitest run

# Type-check all code
npx svelte-check

# Build and check for errors
npm run build

# Check npm dependencies for vulnerabilities
npm audit
```

### Log Analysis

If using PM2:

```bash
# View real-time logs
pm2 logs preop-assessment

# View error logs only
pm2 logs preop-assessment --err

# View last 100 lines
pm2 logs preop-assessment --lines 100
```

---

## System Limits

| Aspect | Limit | Notes |
|--------|-------|-------|
| Concurrent users | Hundreds (per server) | No database contention; limited only by Node.js capacity |
| Medications per patient | No hard limit | Dynamic list; very large lists may slow the UI |
| Allergies per patient | No hard limit | Dynamic list; same as medications |
| PDF size | Typically < 100 KB | Scales with content |
| Session duration | Browser session | No server-side session; no timeout enforced |
| Data retention | 0 (not stored) | Data exists only in browser memory |

---

## Contact and Support

### Reporting Issues

- Application bugs: File an issue in the source repository
- Clinical rule concerns: Contact the Clinical Safety Officer
- Security vulnerabilities: Contact the IT Security team immediately
- Deployment issues: Contact the IT infrastructure team

### Emergency Procedures

If the system is suspected of producing incorrect clinical output:

1. **Stop using the system** for clinical assessments.
2. **Revert to paper-based assessment** (standard fallback).
3. **Notify the Clinical Safety Officer** immediately.
4. **Document the suspected error** with the patient profile and expected vs. actual output.
5. **Do not modify the system** until the CSO has investigated.
