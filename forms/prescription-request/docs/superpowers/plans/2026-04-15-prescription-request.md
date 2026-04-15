# Prescription Request Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a prescription request form with priority classification engine (Routine/Urgent/Emergency), patient-facing SvelteKit wizard, clinician dashboard, SQL migrations, and generated XML/FHIR representations.

**Architecture:** 5-step patient wizard collecting patient info, clinician info, prescription details, substitution options, and request type. Pure priority classification engine derives urgency from request flags and substitution constraints. Clinician dashboard uses SVAR DataGrid with filters.

**Tech Stack:** SvelteKit 2.x, Svelte 5 runes, Tailwind CSS 4, SVAR DataGrid 2.x, pdfmake, Vitest, PostgreSQL 18 with Liquibase SQL

---

### Task 1: SQL Migrations

**Files:**
- Create: `sql-migrations/AGENTS.md`
- Create: `sql-migrations/CLAUDE.md`
- Create: `sql-migrations/00-extensions.sql`
- Create: `sql-migrations/01-patient.sql`
- Create: `sql-migrations/02-clinician.sql`
- Create: `sql-migrations/03-prescription-request.sql`
- Create: `sql-migrations/04-prescription-details.sql`
- Create: `sql-migrations/05-prescription-substitution-options.sql`
- Create: `sql-migrations/06-prescription-request-type.sql`
- Create: `sql-migrations/07-grading-result.sql`
- Create: `sql-migrations/08-grading-fired-rule.sql`
- Create: `sql-migrations/09-grading-additional-flag.sql`

- [ ] **Step 1: Create AGENTS.md and CLAUDE.md**

```markdown
<!-- sql-migrations/CLAUDE.md -->
@AGENTS.md
```

```markdown
<!-- sql-migrations/AGENTS.md -->
# SQL Migrations for Prescription Request

PostgreSQL 18 with Liquibase SQL format.

## Tables

- 00-extensions.sql — pgcrypto extension
- 01-patient.sql — Patient demographics
- 02-clinician.sql — Clinician demographics
- 03-prescription-request.sql — Top-level request linking patient, clinician
- 04-prescription-details.sql — Medication, dosage, instructions
- 05-prescription-substitution-options.sql — Substitution preferences
- 06-prescription-request-type.sql — New/refill, emergency/normal flags
- 07-grading-result.sql — Priority classification result
- 08-grading-fired-rule.sql — Rules that fired
- 09-grading-additional-flag.sql — Additional flags
```

- [ ] **Step 2: Create 00-extensions.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--rollback DROP FUNCTION IF EXISTS set_updated_at(); DROP EXTENSION IF EXISTS "pgcrypto";
```

- [ ] **Step 3: Create 01-patient.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    nhs_number VARCHAR(20) UNIQUE,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient demographic information for prescription requests.';
COMMENT ON COLUMN patient.id IS 'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.first_name IS 'Patient given name.';
COMMENT ON COLUMN patient.last_name IS 'Patient family name.';
COMMENT ON COLUMN patient.date_of_birth IS 'Patient date of birth.';
COMMENT ON COLUMN patient.nhs_number IS 'NHS number, unique per patient.';
COMMENT ON COLUMN patient.phone IS 'Patient phone number.';
COMMENT ON COLUMN patient.email IS 'Patient email address.';
--rollback DROP TABLE patient;
```

- [ ] **Step 4: Create 02-clinician.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    nhs_employee_number VARCHAR(20) UNIQUE,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_clinician_updated_at
    BEFORE UPDATE ON clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinician IS
    'Clinician demographic information for prescription requests.';
COMMENT ON COLUMN clinician.id IS 'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinician.first_name IS 'Clinician given name.';
COMMENT ON COLUMN clinician.last_name IS 'Clinician family name.';
COMMENT ON COLUMN clinician.nhs_employee_number IS 'NHS employee number, unique per clinician.';
COMMENT ON COLUMN clinician.phone IS 'Clinician phone number.';
COMMENT ON COLUMN clinician.email IS 'Clinician email address.';
--rollback DROP TABLE clinician;
```

- [ ] **Step 5: Create 03-prescription-request.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE prescription_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patient(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL
        REFERENCES clinician(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_prescription_request_updated_at
    BEFORE UPDATE ON prescription_request
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_request IS
    'Top-level prescription request linking patient and clinician. Parent entity for all prescription sections.';
COMMENT ON COLUMN prescription_request.id IS 'Primary key UUID, auto-generated.';
COMMENT ON COLUMN prescription_request.patient_id IS 'Foreign key to the patient requesting the prescription.';
COMMENT ON COLUMN prescription_request.clinician_id IS 'Foreign key to the prescribing clinician.';
COMMENT ON COLUMN prescription_request.status IS 'Lifecycle status: draft, submitted, reviewed, approved, or rejected.';
--rollback DROP TABLE prescription_request;
```

- [ ] **Step 6: Create 04-prescription-details.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE prescription_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    medication_name VARCHAR(500) NOT NULL DEFAULT '',
    dosage VARCHAR(255) NOT NULL DEFAULT '',
    frequency VARCHAR(255) NOT NULL DEFAULT '',
    route_of_administration VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (route_of_administration IN ('oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhaled', 'rectal', 'sublingual', 'transdermal', 'other', '')),
    treatment_instructions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_prescription_details_updated_at
    BEFORE UPDATE ON prescription_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_details IS
    'Medication, dosage, and treatment details for a prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN prescription_details.request_date IS 'Date the prescription is requested for.';
COMMENT ON COLUMN prescription_details.medication_name IS 'Name of the medication being prescribed.';
COMMENT ON COLUMN prescription_details.dosage IS 'Dosage amount and unit (e.g. 500mg, 10ml).';
COMMENT ON COLUMN prescription_details.frequency IS 'How often the medication should be taken (e.g. BD, TDS, OD).';
COMMENT ON COLUMN prescription_details.route_of_administration IS 'Route: oral, topical, intravenous, intramuscular, subcutaneous, inhaled, rectal, sublingual, transdermal, other, or empty.';
COMMENT ON COLUMN prescription_details.treatment_instructions IS 'Free-text treatment instructions for the patient.';
--rollback DROP TABLE prescription_details;
```

- [ ] **Step 7: Create 05-prescription-substitution-options.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE prescription_substitution_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    allow_brand_substitution VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (allow_brand_substitution IN ('yes', 'no', '')),
    allow_generic_substitution VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (allow_generic_substitution IN ('yes', 'no', '')),
    allow_dosage_adjustment VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (allow_dosage_adjustment IN ('yes', 'no', '')),
    substitution_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_prescription_substitution_options_updated_at
    BEFORE UPDATE ON prescription_substitution_options
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_substitution_options IS
    'Substitution preferences for a prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN prescription_substitution_options.allow_brand_substitution IS 'Whether a different brand name is acceptable: yes, no, or empty.';
COMMENT ON COLUMN prescription_substitution_options.allow_generic_substitution IS 'Whether a generic equivalent is acceptable: yes, no, or empty.';
COMMENT ON COLUMN prescription_substitution_options.allow_dosage_adjustment IS 'Whether a different dosage is acceptable: yes, no, or empty.';
COMMENT ON COLUMN prescription_substitution_options.substitution_notes IS 'Additional notes about substitution preferences.';
--rollback DROP TABLE prescription_substitution_options;
```

- [ ] **Step 8: Create 06-prescription-request-type.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE prescription_request_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    is_new_prescription VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (is_new_prescription IN ('yes', 'no', '')),
    is_emergency VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (is_emergency IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_prescription_request_type_updated_at
    BEFORE UPDATE ON prescription_request_type
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_request_type IS
    'Request type flags for a prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN prescription_request_type.is_new_prescription IS 'Whether this is a new prescription (yes) or a refill (no).';
COMMENT ON COLUMN prescription_request_type.is_emergency IS 'Whether this is an emergency prescription request: yes, no, or empty.';
COMMENT ON COLUMN prescription_request_type.additional_notes IS 'Additional notes about the request.';
--rollback DROP TABLE prescription_request_type;
```

- [ ] **Step 9: Create 07-grading-result.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    priority_level VARCHAR(10) NOT NULL DEFAULT 'routine'
        CHECK (priority_level IN ('routine', 'urgent', 'emergency')),
    rule_count INTEGER NOT NULL DEFAULT 0
        CHECK (rule_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed priority classification result for the prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN grading_result.priority_level IS 'Overall priority: routine, urgent, or emergency.';
COMMENT ON COLUMN grading_result.rule_count IS 'Total number of classification rules that fired.';
COMMENT ON COLUMN grading_result.graded_at IS 'Timestamp when the priority classification was computed.';
--rollback DROP TABLE grading_result;
```

- [ ] **Step 10: Create 08-grading-fired-rule.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('routine', 'urgent', 'emergency', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual priority classification rules that fired during grading of the prescription request.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS 'Identifier of the rule that fired (e.g. RX-EM-001).';
COMMENT ON COLUMN grading_fired_rule.category IS 'Category of the rule (e.g. Emergency, Substitution, Completeness).';
COMMENT ON COLUMN grading_fired_rule.description IS 'Human-readable description of the rule.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS 'Priority level contributed by this rule: routine, urgent, emergency, or empty.';
--rollback DROP TABLE grading_fired_rule;
```

- [ ] **Step 11: Create 09-grading-additional-flag.sql**

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(30) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_additional_flag IS
    'Additional flags detected during prescription request grading.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS 'Identifier of the flag (e.g. FLAG-NOSUB-001).';
COMMENT ON COLUMN grading_additional_flag.category IS 'Category of the flag (e.g. Substitution, Completeness, Emergency).';
COMMENT ON COLUMN grading_additional_flag.message IS 'Human-readable description of the flagged issue.';
COMMENT ON COLUMN grading_additional_flag.priority IS 'Priority level: high, medium, or low.';
--rollback DROP TABLE grading_additional_flag;
```

- [ ] **Step 12: Commit SQL migrations**

```bash
git add sql-migrations/
git commit -m "feat(prescription-request): add SQL migrations for prescription request form"
```

---

### Task 2: Generate XML and FHIR representations

**Files:**
- Generated: `xml-representations/*.xml`, `xml-representations/*.dtd`
- Generated: `fhir-r5/*.json`

- [ ] **Step 1: Generate XML representations**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
python3 bin/generate-xml-representations.py
```

Expected: XML and DTD files generated in `forms/prescription-request/xml-representations/`

- [ ] **Step 2: Generate FHIR R5 representations**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
python3 bin/generate-fhir-r5-representations.py
```

Expected: JSON files generated in `forms/prescription-request/fhir-r5/`

- [ ] **Step 3: Commit generated files**

```bash
git add forms/prescription-request/xml-representations/ forms/prescription-request/fhir-r5/
git commit -m "feat(prescription-request): add generated XML and FHIR R5 representations"
```

---

### Task 3: Patient Form — Scaffold and Engine

**Files:**
- Create: `front-end-patient-form-with-svelte/package.json`
- Create: `front-end-patient-form-with-svelte/svelte.config.js`
- Create: `front-end-patient-form-with-svelte/vite.config.ts`
- Create: `front-end-patient-form-with-svelte/tsconfig.json`
- Create: `front-end-patient-form-with-svelte/src/app.html`
- Create: `front-end-patient-form-with-svelte/src/app.css`
- Create: `front-end-patient-form-with-svelte/src/app.d.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/index.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/engine/types.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/engine/prescription-grader.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/engine/prescription-rules.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/engine/flagged-issues.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/engine/utils.ts`
- Test: `front-end-patient-form-with-svelte/src/lib/engine/prescription-grader.test.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "prescription-request-patient-form",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^7.0.0",
    "@sveltejs/kit": "^2.50.2",
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "@tailwindcss/vite": "^4.2.1",
    "@types/pdfmake": "^0.3.1",
    "svelte": "^5.49.2",
    "svelte-check": "^4.3.6",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vitest": "^4.0.18"
  },
  "dependencies": {
    "pdfmake": "^0.3.5"
  }
}
```

- [ ] **Step 2: Create config files**

`svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  }
};

export default config;
```

`vite.config.ts`:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    include: ['src/**/*.test.ts']
  }
});
```

`tsconfig.json`:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

`src/app.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

`src/app.css`:
```css
@import 'tailwindcss';

@theme {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-danger: #dc2626;
  --color-warning: #f59e0b;
  --color-success: #16a34a;
  --color-muted: #6b7280;
}

@media print {
  .no-print {
    display: none !important;
  }
}
```

`src/app.d.ts`:
```typescript
declare global {
  namespace App {}
}

export {};
```

`src/lib/index.ts`:
```typescript
// place files you want to import through the `$lib` alias in this folder.
```

- [ ] **Step 3: Create types.ts**

```typescript
// ──────────────────────────────────────────────
// Core prescription request data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type PriorityLevel = 'routine' | 'urgent' | 'emergency';
export type RouteOfAdministration =
  | 'oral'
  | 'topical'
  | 'intravenous'
  | 'intramuscular'
  | 'subcutaneous'
  | 'inhaled'
  | 'rectal'
  | 'sublingual'
  | 'transdermal'
  | 'other'
  | '';

export interface PatientInformation {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nhsNumber: string;
}

export interface ClinicianInformation {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nhsEmployeeNumber: string;
}

export interface PrescriptionDetails {
  requestDate: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  routeOfAdministration: RouteOfAdministration;
  treatmentInstructions: string;
}

export interface SubstitutionOptions {
  allowBrandSubstitution: YesNo;
  allowGenericSubstitution: YesNo;
  allowDosageAdjustment: YesNo;
  substitutionNotes: string;
}

export interface RequestType {
  isNewPrescription: YesNo;
  isEmergency: YesNo;
  additionalNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
  patientInformation: PatientInformation;
  clinicianInformation: ClinicianInformation;
  prescriptionDetails: PrescriptionDetails;
  substitutionOptions: SubstitutionOptions;
  requestType: RequestType;
}

// ──────────────────────────────────────────────
// Priority classification types
// ──────────────────────────────────────────────

export interface PrescriptionRule {
  id: string;
  category: string;
  description: string;
  priorityLevel: PriorityLevel;
  evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
  id: string;
  category: string;
  description: string;
  priorityLevel: PriorityLevel;
}

export interface AdditionalFlag {
  id: string;
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
  priorityLevel: PriorityLevel;
  firedRules: FiredRule[];
  additionalFlags: AdditionalFlag[];
  timestamp: string;
}

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

export interface StepConfig {
  number: number;
  title: string;
  shortTitle: string;
  section: keyof AssessmentData;
}
```

- [ ] **Step 4: Create prescription-rules.ts**

```typescript
import type { PrescriptionRule } from './types';

/**
 * Declarative priority classification rules for prescription requests.
 * Priority is determined by the highest-level rule that fires.
 * Routine is the default when no rules fire.
 */
export const prescriptionRules: PrescriptionRule[] = [
  // ─── EMERGENCY ────────────────────────────────────────
  {
    id: 'RX-EM-001',
    category: 'Emergency',
    description: 'Emergency prescription request',
    priorityLevel: 'emergency',
    evaluate: (d) => d.requestType.isEmergency === 'yes'
  },

  // ─── SUBSTITUTION RESTRICTIONS ────────────────────────
  {
    id: 'RX-SUB-001',
    category: 'Substitution',
    description: 'No brand substitution allowed',
    priorityLevel: 'urgent',
    evaluate: (d) => d.substitutionOptions.allowBrandSubstitution === 'no'
  },
  {
    id: 'RX-SUB-002',
    category: 'Substitution',
    description: 'No generic substitution allowed',
    priorityLevel: 'urgent',
    evaluate: (d) => d.substitutionOptions.allowGenericSubstitution === 'no'
  },
  {
    id: 'RX-SUB-003',
    category: 'Substitution',
    description: 'No dosage adjustment allowed',
    priorityLevel: 'urgent',
    evaluate: (d) => d.substitutionOptions.allowDosageAdjustment === 'no'
  },

  // ─── COMPLETENESS ────────────────────────────────────
  {
    id: 'RX-CMP-001',
    category: 'Completeness',
    description: 'Clinician contact information missing',
    priorityLevel: 'urgent',
    evaluate: (d) =>
      d.clinicianInformation.phone.trim() === '' &&
      d.clinicianInformation.email.trim() === ''
  },
  {
    id: 'RX-CMP-002',
    category: 'Completeness',
    description: 'Patient contact information missing',
    priorityLevel: 'urgent',
    evaluate: (d) =>
      d.patientInformation.phone.trim() === '' &&
      d.patientInformation.email.trim() === ''
  },
  {
    id: 'RX-CMP-003',
    category: 'Completeness',
    description: 'Medication name not provided',
    priorityLevel: 'urgent',
    evaluate: (d) => d.prescriptionDetails.medicationName.trim() === ''
  },
  {
    id: 'RX-CMP-004',
    category: 'Completeness',
    description: 'Dosage not specified',
    priorityLevel: 'urgent',
    evaluate: (d) => d.prescriptionDetails.dosage.trim() === ''
  },

  // ─── REQUEST TYPE ─────────────────────────────────────
  {
    id: 'RX-NEW-001',
    category: 'Request Type',
    description: 'New prescription (not a refill)',
    priorityLevel: 'routine',
    evaluate: (d) => d.requestType.isNewPrescription === 'yes'
  }
];
```

- [ ] **Step 5: Create prescription-grader.ts**

```typescript
import type { AssessmentData, PriorityLevel, FiredRule } from './types';
import { prescriptionRules } from './prescription-rules';

/**
 * Pure function: evaluates all prescription rules against request data.
 * Returns the maximum priority level among all fired rules,
 * defaulting to Routine when no rules fire.
 */
export function calculatePriorityLevel(data: AssessmentData): {
  priorityLevel: PriorityLevel;
  firedRules: FiredRule[];
} {
  const firedRules: FiredRule[] = [];

  for (const rule of prescriptionRules) {
    try {
      if (rule.evaluate(data)) {
        firedRules.push({
          id: rule.id,
          category: rule.category,
          description: rule.description,
          priorityLevel: rule.priorityLevel
        });
      }
    } catch (e) {
      console.warn(`Prescription rule ${rule.id} evaluation failed:`, e);
    }
  }

  const priorityOrder: Record<PriorityLevel, number> = { routine: 0, urgent: 1, emergency: 2 };

  const priorityLevel: PriorityLevel =
    firedRules.length === 0
      ? 'routine'
      : firedRules.reduce<PriorityLevel>((max, r) => {
          return priorityOrder[r.priorityLevel] > priorityOrder[max] ? r.priorityLevel : max;
        }, 'routine');

  return { priorityLevel, firedRules };
}
```

- [ ] **Step 6: Create flagged-issues.ts**

```typescript
import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags for clinician review,
 * independent of priority level.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
  const flags: AdditionalFlag[] = [];

  // ─── Emergency with incomplete info ───────────────────
  if (
    data.requestType.isEmergency === 'yes' &&
    (data.clinicianInformation.phone.trim() === '' ||
      data.patientInformation.phone.trim() === '')
  ) {
    flags.push({
      id: 'FLAG-EMERG-INCOMPLETE',
      category: 'Emergency',
      message: 'Emergency request with incomplete contact details - verify urgently',
      priority: 'high'
    });
  }

  // ─── No substitutions allowed ─────────────────────────
  if (
    data.substitutionOptions.allowBrandSubstitution === 'no' &&
    data.substitutionOptions.allowGenericSubstitution === 'no' &&
    data.substitutionOptions.allowDosageAdjustment === 'no'
  ) {
    flags.push({
      id: 'FLAG-NOSUB-001',
      category: 'Substitution',
      message: 'No substitutions permitted - exact medication required',
      priority: 'high'
    });
  }

  // ─── Missing medication name ──────────────────────────
  if (data.prescriptionDetails.medicationName.trim() === '') {
    flags.push({
      id: 'FLAG-MED-001',
      category: 'Completeness',
      message: 'Medication name not provided',
      priority: 'high'
    });
  }

  // ─── Missing dosage ───────────────────────────────────
  if (data.prescriptionDetails.dosage.trim() === '') {
    flags.push({
      id: 'FLAG-DOSE-001',
      category: 'Completeness',
      message: 'Dosage not specified',
      priority: 'high'
    });
  }

  // ─── Missing clinician ID ────────────────────────────
  if (data.clinicianInformation.nhsEmployeeNumber.trim() === '') {
    flags.push({
      id: 'FLAG-CLIN-001',
      category: 'Administrative',
      message: 'Clinician NHS employee number not provided',
      priority: 'medium'
    });
  }

  // ─── Missing patient ID ──────────────────────────────
  if (data.patientInformation.nhsNumber.trim() === '') {
    flags.push({
      id: 'FLAG-PAT-001',
      category: 'Administrative',
      message: 'Patient NHS number not provided',
      priority: 'medium'
    });
  }

  // ─── Missing treatment instructions ───────────────────
  if (data.prescriptionDetails.treatmentInstructions.trim() === '') {
    flags.push({
      id: 'FLAG-INSTR-001',
      category: 'Completeness',
      message: 'Treatment instructions not provided',
      priority: 'low'
    });
  }

  // ─── Refill without date ──────────────────────────────
  if (
    data.requestType.isNewPrescription === 'no' &&
    data.prescriptionDetails.requestDate === ''
  ) {
    flags.push({
      id: 'FLAG-REFILL-001',
      category: 'Completeness',
      message: 'Refill request without a request date',
      priority: 'medium'
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return flags;
}
```

- [ ] **Step 7: Create utils.ts**

```typescript
import type { PriorityLevel } from './types';

/** Priority level label. */
export function priorityLevelLabel(level: PriorityLevel): string {
  switch (level) {
    case 'routine':
      return 'Routine - Standard processing';
    case 'urgent':
      return 'Urgent - Requires prompt attention';
    case 'emergency':
      return 'Emergency - Immediate action required';
    default:
      return `Priority: ${level}`;
  }
}

/** Priority level colour class. */
export function priorityLevelColor(level: PriorityLevel): string {
  switch (level) {
    case 'routine':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'urgent':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'emergency':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
```

- [ ] **Step 8: Write the failing tests — prescription-grader.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { calculatePriorityLevel } from './prescription-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { prescriptionRules } from './prescription-rules';
import type { AssessmentData } from './types';

function createRoutineRequest(): AssessmentData {
  return {
    patientInformation: {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '07700 900000',
      email: 'jane@example.com',
      nhsNumber: '943 476 5919'
    },
    clinicianInformation: {
      firstName: 'Dr',
      lastName: 'Smith',
      phone: '020 7946 0958',
      email: 'dr.smith@nhs.net',
      nhsEmployeeNumber: 'C1234567'
    },
    prescriptionDetails: {
      requestDate: '2026-04-15',
      medicationName: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'TDS',
      routeOfAdministration: 'oral',
      treatmentInstructions: 'Take with food, complete full course'
    },
    substitutionOptions: {
      allowBrandSubstitution: 'yes',
      allowGenericSubstitution: 'yes',
      allowDosageAdjustment: 'yes',
      substitutionNotes: ''
    },
    requestType: {
      isNewPrescription: 'yes',
      isEmergency: 'no',
      additionalNotes: ''
    }
  };
}

describe('Prescription Priority Classification Engine', () => {
  it('returns Routine priority for a standard prescription request', () => {
    const data = createRoutineRequest();
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('routine');
  });

  it('returns Emergency priority when emergency flag is set', () => {
    const data = createRoutineRequest();
    data.requestType.isEmergency = 'yes';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('emergency');
  });

  it('returns Urgent priority when no substitutions are allowed', () => {
    const data = createRoutineRequest();
    data.substitutionOptions.allowBrandSubstitution = 'no';
    data.substitutionOptions.allowGenericSubstitution = 'no';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('urgent');
  });

  it('returns Urgent priority when clinician contact is missing', () => {
    const data = createRoutineRequest();
    data.clinicianInformation.phone = '';
    data.clinicianInformation.email = '';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('urgent');
  });

  it('returns Urgent priority when medication name is missing', () => {
    const data = createRoutineRequest();
    data.prescriptionDetails.medicationName = '';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('urgent');
  });

  it('detects all rule IDs are unique', () => {
    const ids = prescriptionRules.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('Additional Flags Detection', () => {
  it('returns no flags for a complete routine request', () => {
    const data = createRoutineRequest();
    const flags = detectAdditionalFlags(data);
    expect(flags).toHaveLength(0);
  });

  it('flags emergency with incomplete contact', () => {
    const data = createRoutineRequest();
    data.requestType.isEmergency = 'yes';
    data.patientInformation.phone = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-EMERG-INCOMPLETE')).toBe(true);
  });

  it('flags no substitutions permitted', () => {
    const data = createRoutineRequest();
    data.substitutionOptions.allowBrandSubstitution = 'no';
    data.substitutionOptions.allowGenericSubstitution = 'no';
    data.substitutionOptions.allowDosageAdjustment = 'no';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-NOSUB-001')).toBe(true);
  });

  it('flags missing medication name', () => {
    const data = createRoutineRequest();
    data.prescriptionDetails.medicationName = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-MED-001')).toBe(true);
  });

  it('flags missing clinician NHS employee number', () => {
    const data = createRoutineRequest();
    data.clinicianInformation.nhsEmployeeNumber = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-CLIN-001')).toBe(true);
  });

  it('flags refill without date', () => {
    const data = createRoutineRequest();
    data.requestType.isNewPrescription = 'no';
    data.prescriptionDetails.requestDate = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-REFILL-001')).toBe(true);
  });

  it('sorts flags by priority (high first)', () => {
    const data = createRoutineRequest();
    data.prescriptionDetails.medicationName = '';
    data.clinicianInformation.nhsEmployeeNumber = '';
    data.prescriptionDetails.treatmentInstructions = '';
    const flags = detectAdditionalFlags(data);
    const priorities = flags.map((f) => f.priority);
    const sortedPriorities = [...priorities].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a] - order[b];
    });
    expect(priorities).toEqual(sortedPriorities);
  });
});
```

- [ ] **Step 9: Install dependencies and run tests**

```bash
cd forms/prescription-request/front-end-patient-form-with-svelte
npm install
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 10: Commit engine**

```bash
git add front-end-patient-form-with-svelte/
git commit -m "feat(prescription-request): add patient form scaffold and priority classification engine with tests"
```

---

### Task 4: Patient Form — Store, Config, UI Components

**Files:**
- Create: `front-end-patient-form-with-svelte/src/lib/stores/assessment.svelte.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/config/steps.ts`
- Create: `front-end-patient-form-with-svelte/src/params/step.ts`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/SectionCard.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/TextInput.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/TextArea.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/RadioGroup.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/SelectInput.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/ProgressBar.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/StepNavigation.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/ui/Badge.svelte`

- [ ] **Step 1: Create assessment.svelte.ts**

```typescript
import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
  return {
    patientInformation: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      nhsNumber: ''
    },
    clinicianInformation: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      nhsEmployeeNumber: ''
    },
    prescriptionDetails: {
      requestDate: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      routeOfAdministration: '',
      treatmentInstructions: ''
    },
    substitutionOptions: {
      allowBrandSubstitution: '',
      allowGenericSubstitution: '',
      allowDosageAdjustment: '',
      substitutionNotes: ''
    },
    requestType: {
      isNewPrescription: '',
      isEmergency: '',
      additionalNotes: ''
    }
  };
}

class AssessmentStore {
  data = $state<AssessmentData>(createDefaultAssessment());
  result = $state<GradingResult | null>(null);
  currentStep = $state(1);

  reset() {
    this.data = createDefaultAssessment();
    this.result = null;
    this.currentStep = 1;
  }
}

export const assessment = new AssessmentStore();
```

- [ ] **Step 2: Create steps.ts**

```typescript
import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 5;

export const steps: StepConfig[] = [
  { number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
  { number: 2, title: 'Clinician Information', shortTitle: 'Clinician', section: 'clinicianInformation' },
  { number: 3, title: 'Prescription Details', shortTitle: 'Prescription', section: 'prescriptionDetails' },
  { number: 4, title: 'Substitution Options', shortTitle: 'Substitutions', section: 'substitutionOptions' },
  { number: 5, title: 'Request Type & Review', shortTitle: 'Request', section: 'requestType' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
  return steps;
}

export function getNextStep(current: number, data: AssessmentData): number | null {
  const visible = getVisibleSteps(data);
  const idx = visible.findIndex((s) => s.number === current);
  if (idx === -1 || idx >= visible.length - 1) return null;
  return visible[idx + 1].number;
}

export function getPrevStep(current: number, data: AssessmentData): number | null {
  const visible = getVisibleSteps(data);
  const idx = visible.findIndex((s) => s.number === current);
  if (idx <= 0) return null;
  return visible[idx - 1].number;
}
```

- [ ] **Step 3: Create params/step.ts**

```typescript
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  const n = parseInt(param, 10);
  return !isNaN(n) && n >= 1 && n <= 5;
};
```

- [ ] **Step 4: Create UI components**

Copy the exact UI component patterns from patient-intake (SectionCard, TextInput, TextArea, RadioGroup, SelectInput, ProgressBar, StepNavigation, Badge) — these are identical reusable components. The Badge component uses `priorityLevelLabel` and `priorityLevelColor` from the prescription engine utils instead of the intake engine.

`Badge.svelte`:
```svelte
<script lang="ts">
  import { priorityLevelLabel, priorityLevelColor } from '$lib/engine/utils';
  import type { PriorityLevel } from '$lib/engine/types';

  let {
    level
  }: {
    level: PriorityLevel;
  } = $props();

  const colorClass = $derived(priorityLevelColor(level));
  const label = $derived(priorityLevelLabel(level));
</script>

<span class="inline-block rounded-full border px-4 py-1.5 text-sm font-bold {colorClass}">
  {label}
</span>
```

All other UI components (SectionCard, TextInput, TextArea, RadioGroup, SelectInput, ProgressBar, StepNavigation) are identical to the patient-intake versions.

- [ ] **Step 5: Commit store, config, and UI components**

```bash
git add front-end-patient-form-with-svelte/src/lib/stores/ front-end-patient-form-with-svelte/src/lib/config/ front-end-patient-form-with-svelte/src/params/ front-end-patient-form-with-svelte/src/lib/components/ui/
git commit -m "feat(prescription-request): add assessment store, step config, and UI components"
```

---

### Task 5: Patient Form — Step Components and Routes

**Files:**
- Create: `front-end-patient-form-with-svelte/src/lib/components/steps/Step1PatientInformation.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/steps/Step2ClinicianInformation.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/steps/Step3PrescriptionDetails.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/steps/Step4SubstitutionOptions.svelte`
- Create: `front-end-patient-form-with-svelte/src/lib/components/steps/Step5RequestType.svelte`
- Create: `front-end-patient-form-with-svelte/src/routes/+page.svelte`
- Create: `front-end-patient-form-with-svelte/src/routes/+layout.svelte`
- Create: `front-end-patient-form-with-svelte/src/routes/assessment/+layout.svelte`
- Create: `front-end-patient-form-with-svelte/src/routes/assessment/[step=step]/+page.svelte`

- [ ] **Step 1: Create Step1PatientInformation.svelte**

```svelte
<script lang="ts">
  import { assessment } from '$lib/stores/assessment.svelte';
  import SectionCard from '$lib/components/ui/SectionCard.svelte';
  import TextInput from '$lib/components/ui/TextInput.svelte';

  const p = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Please provide the patient's details">
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <TextInput label="First Name" name="firstName" bind:value={p.firstName} required />
    <TextInput label="Last Name" name="lastName" bind:value={p.lastName} required />
  </div>

  <TextInput label="NHS Patient Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="e.g. 943 476 5919" />

  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <TextInput label="Phone" name="phone" bind:value={p.phone} required />
    <TextInput label="Email" name="email" type="email" bind:value={p.email} />
  </div>
</SectionCard>
```

- [ ] **Step 2: Create Step2ClinicianInformation.svelte**

```svelte
<script lang="ts">
  import { assessment } from '$lib/stores/assessment.svelte';
  import SectionCard from '$lib/components/ui/SectionCard.svelte';
  import TextInput from '$lib/components/ui/TextInput.svelte';

  const c = assessment.data.clinicianInformation;
</script>

<SectionCard title="Clinician Information" description="Details of the prescribing clinician">
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <TextInput label="First Name" name="clinFirstName" bind:value={c.firstName} required />
    <TextInput label="Last Name" name="clinLastName" bind:value={c.lastName} required />
  </div>

  <TextInput label="NHS Employee Number" name="nhsEmployeeNumber" bind:value={c.nhsEmployeeNumber} placeholder="e.g. C1234567" />

  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <TextInput label="Phone" name="clinPhone" bind:value={c.phone} required />
    <TextInput label="Email" name="clinEmail" type="email" bind:value={c.email} />
  </div>
</SectionCard>
```

- [ ] **Step 3: Create Step3PrescriptionDetails.svelte**

```svelte
<script lang="ts">
  import { assessment } from '$lib/stores/assessment.svelte';
  import SectionCard from '$lib/components/ui/SectionCard.svelte';
  import TextInput from '$lib/components/ui/TextInput.svelte';
  import SelectInput from '$lib/components/ui/SelectInput.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';

  const d = assessment.data.prescriptionDetails;

  const routeOptions = [
    { value: 'oral', label: 'Oral' },
    { value: 'topical', label: 'Topical' },
    { value: 'intravenous', label: 'Intravenous' },
    { value: 'intramuscular', label: 'Intramuscular' },
    { value: 'subcutaneous', label: 'Subcutaneous' },
    { value: 'inhaled', label: 'Inhaled' },
    { value: 'rectal', label: 'Rectal' },
    { value: 'sublingual', label: 'Sublingual' },
    { value: 'transdermal', label: 'Transdermal' },
    { value: 'other', label: 'Other' }
  ];
</script>

<SectionCard title="Prescription Details" description="Medication and dosage information">
  <TextInput label="Request Date" name="requestDate" type="date" bind:value={d.requestDate} required />

  <TextInput label="Medication Name" name="medicationName" bind:value={d.medicationName} required placeholder="e.g. Amoxicillin" />

  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <TextInput label="Dosage" name="dosage" bind:value={d.dosage} required placeholder="e.g. 500mg" />
    <TextInput label="Frequency" name="frequency" bind:value={d.frequency} placeholder="e.g. TDS, BD, OD" />
  </div>

  <SelectInput label="Route of Administration" name="route" options={routeOptions} bind:value={d.routeOfAdministration} />

  <TextArea label="Treatment Instructions" name="treatmentInstructions" bind:value={d.treatmentInstructions} placeholder="Instructions for the patient..." />
</SectionCard>
```

- [ ] **Step 4: Create Step4SubstitutionOptions.svelte**

```svelte
<script lang="ts">
  import { assessment } from '$lib/stores/assessment.svelte';
  import SectionCard from '$lib/components/ui/SectionCard.svelte';
  import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';

  const s = assessment.data.substitutionOptions;

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
</script>

<SectionCard title="Substitution Options" description="Indicate whether alternatives are acceptable">
  <RadioGroup
    label="Allow brand name substitution?"
    name="allowBrand"
    options={yesNoOptions}
    bind:value={s.allowBrandSubstitution}
  />

  <RadioGroup
    label="Allow generic substitution?"
    name="allowGeneric"
    options={yesNoOptions}
    bind:value={s.allowGenericSubstitution}
  />

  <RadioGroup
    label="Allow dosage adjustment?"
    name="allowDosage"
    options={yesNoOptions}
    bind:value={s.allowDosageAdjustment}
  />

  <TextArea label="Substitution Notes" name="substitutionNotes" bind:value={s.substitutionNotes} placeholder="Any additional notes about substitution preferences..." />
</SectionCard>
```

- [ ] **Step 5: Create Step5RequestType.svelte**

```svelte
<script lang="ts">
  import { assessment } from '$lib/stores/assessment.svelte';
  import SectionCard from '$lib/components/ui/SectionCard.svelte';
  import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';

  const r = assessment.data.requestType;

  const newRefillOptions = [
    { value: 'yes', label: 'New Prescription' },
    { value: 'no', label: 'Refill / Repeat' }
  ];

  const emergencyOptions = [
    { value: 'yes', label: 'Emergency' },
    { value: 'no', label: 'Normal' }
  ];
</script>

<SectionCard title="Request Type & Review" description="Classify this prescription request">
  <RadioGroup
    label="Is this a new prescription or a refill?"
    name="isNew"
    options={newRefillOptions}
    bind:value={r.isNewPrescription}
    required
  />

  <RadioGroup
    label="Is this an emergency request?"
    name="isEmergency"
    options={emergencyOptions}
    bind:value={r.isEmergency}
    required
  />

  <TextArea label="Additional Notes" name="additionalNotes" bind:value={r.additionalNotes} placeholder="Any other information relevant to this request..." />
</SectionCard>
```

- [ ] **Step 6: Create routes**

`src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>Prescription Request</title>
</svelte:head>

{@render children()}
```

`src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { assessment } from '$lib/stores/assessment.svelte';

  function startAssessment() {
    assessment.reset();
    goto('/assessment/1');
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-lg text-center">
    <div class="mb-8">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900">Prescription Request Form</h1>
      <p class="mt-3 text-gray-600">
        Complete this form to request a new or repeat prescription.
        Your request will be classified by priority and reviewed by a clinician.
      </p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
      <h2 class="mb-3 font-semibold text-gray-900">What to expect</h2>
      <ul class="space-y-2 text-sm text-gray-600">
        <li class="flex items-start gap-2">
          <span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
          5 sections: patient info, clinician info, medication details, substitutions, and request type
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
          Takes approximately 3-5 minutes to complete
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
          You can navigate back to change answers at any time
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
          A priority classification and downloadable PDF report will be generated
        </li>
      </ul>
    </div>

    <button
      onclick={startAssessment}
      class="mt-6 w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark"
    >
      Begin Prescription Request
    </button>

    <p class="mt-4 text-xs text-gray-400">
      This form is for prescription request purposes only. All requests will be reviewed by a qualified clinician.
    </p>
  </div>
</div>
```

`src/routes/assessment/+layout.svelte`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { assessment } from '$lib/stores/assessment.svelte';
  import { getVisibleSteps } from '$lib/config/steps';
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte';

  let { children }: { children: Snippet } = $props();

  const visibleSteps = $derived(getVisibleSteps(assessment.data));
</script>

<div class="min-h-screen bg-gray-50">
  <header class="border-b border-gray-200 bg-white shadow-sm no-print">
    <div class="mx-auto max-w-3xl px-4 py-4">
      <h1 class="text-lg font-bold text-gray-900">Prescription Request Form</h1>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-6">
    <ProgressBar currentStep={assessment.currentStep} steps={visibleSteps} />
    {@render children()}
  </main>
</div>
```

`src/routes/assessment/[step=step]/+page.svelte`:
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { assessment } from '$lib/stores/assessment.svelte';
  import { steps, getNextStep, getPrevStep, getVisibleSteps } from '$lib/config/steps';
  import { calculatePriorityLevel } from '$lib/engine/prescription-grader';
  import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
  import StepNavigation from '$lib/components/ui/StepNavigation.svelte';

  import Step1PatientInformation from '$lib/components/steps/Step1PatientInformation.svelte';
  import Step2ClinicianInformation from '$lib/components/steps/Step2ClinicianInformation.svelte';
  import Step3PrescriptionDetails from '$lib/components/steps/Step3PrescriptionDetails.svelte';
  import Step4SubstitutionOptions from '$lib/components/steps/Step4SubstitutionOptions.svelte';
  import Step5RequestType from '$lib/components/steps/Step5RequestType.svelte';

  const stepNumber = $derived(Number($page.params.step));
  const stepConfig = $derived(steps.find((s) => s.number === stepNumber));
  const visibleSteps = $derived(getVisibleSteps(assessment.data));
  const isLast = $derived(visibleSteps[visibleSteps.length - 1]?.number === stepNumber);
  const nextStep = $derived(getNextStep(stepNumber, assessment.data));
  const prevStep = $derived(getPrevStep(stepNumber, assessment.data));
  const nextHref = $derived(nextStep ? `/assessment/${nextStep}` : null);
  const prevHref = $derived(prevStep ? `/assessment/${prevStep}` : null);

  $effect(() => {
    assessment.currentStep = stepNumber;
  });

  function submitAssessment() {
    const { priorityLevel, firedRules } = calculatePriorityLevel(assessment.data);
    const additionalFlags = detectAdditionalFlags(assessment.data);
    assessment.result = {
      priorityLevel,
      firedRules,
      additionalFlags,
      timestamp: new Date().toISOString()
    };
    goto('/report');
  }
</script>

{#if stepConfig}
  {#if stepNumber === 1}
    <Step1PatientInformation />
  {:else if stepNumber === 2}
    <Step2ClinicianInformation />
  {:else if stepNumber === 3}
    <Step3PrescriptionDetails />
  {:else if stepNumber === 4}
    <Step4SubstitutionOptions />
  {:else if stepNumber === 5}
    <Step5RequestType />
  {/if}

  <StepNavigation {prevHref} {nextHref} {isLast} onsubmit={submitAssessment} />
{/if}
```

- [ ] **Step 7: Commit step components and routes**

```bash
git add front-end-patient-form-with-svelte/src/lib/components/steps/ front-end-patient-form-with-svelte/src/routes/
git commit -m "feat(prescription-request): add step components and SvelteKit routes"
```

---

### Task 6: Patient Form — Report Page and PDF

**Files:**
- Create: `front-end-patient-form-with-svelte/src/lib/report/pdf-builder.ts`
- Create: `front-end-patient-form-with-svelte/src/routes/report/+page.svelte`
- Create: `front-end-patient-form-with-svelte/src/routes/report/pdf/+server.ts`

- [ ] **Step 1: Create pdf-builder.ts**

```typescript
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { priorityLevelLabel } from '$lib/engine/utils';

export function buildPdfDocument(
  data: AssessmentData,
  result: GradingResult
): TDocumentDefinitions {
  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: {
      text: 'PRESCRIPTION REQUEST REPORT',
      alignment: 'center',
      margin: [0, 20, 0, 0],
      fontSize: 10,
      color: '#6b7280',
      bold: true
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage} of ${pageCount} | Generated ${new Date(result.timestamp).toLocaleString()}`,
      alignment: 'center',
      margin: [0, 20, 0, 0],
      fontSize: 8,
      color: '#9ca3af'
    }),
    content: [
      // Title & Priority Level
      {
        text: `Priority: ${result.priorityLevel.toUpperCase()}`,
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 4]
      },
      {
        text: priorityLevelLabel(result.priorityLevel),
        fontSize: 14,
        alignment: 'center',
        color: '#4b5563',
        margin: [0, 0, 0, 20]
      },

      // Patient Details
      sectionHeader('Patient Details'),
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              field('Name', `${data.patientInformation.firstName} ${data.patientInformation.lastName}`),
              field('NHS Number', data.patientInformation.nhsNumber || 'N/A')
            ],
            [
              field('Phone', data.patientInformation.phone || 'N/A'),
              field('Email', data.patientInformation.email || 'N/A')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number]
      },

      // Clinician Details
      sectionHeader('Clinician Details'),
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              field('Name', `${data.clinicianInformation.firstName} ${data.clinicianInformation.lastName}`),
              field('NHS Employee No.', data.clinicianInformation.nhsEmployeeNumber || 'N/A')
            ],
            [
              field('Phone', data.clinicianInformation.phone || 'N/A'),
              field('Email', data.clinicianInformation.email || 'N/A')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number]
      },

      // Prescription Details
      sectionHeader('Prescription Details'),
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              field('Medication', data.prescriptionDetails.medicationName || 'N/A'),
              field('Dosage', data.prescriptionDetails.dosage || 'N/A')
            ],
            [
              field('Frequency', data.prescriptionDetails.frequency || 'N/A'),
              field('Route', data.prescriptionDetails.routeOfAdministration || 'N/A')
            ],
            [
              field('Request Date', data.prescriptionDetails.requestDate || 'N/A'),
              field('Type', data.requestType.isNewPrescription === 'yes' ? 'New' : data.requestType.isNewPrescription === 'no' ? 'Refill' : 'N/A')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number]
      },

      // Treatment Instructions
      ...(data.prescriptionDetails.treatmentInstructions.trim()
        ? [
            sectionHeader('Treatment Instructions'),
            {
              text: data.prescriptionDetails.treatmentInstructions,
              margin: [0, 0, 0, 16] as [number, number, number, number]
            }
          ]
        : []),

      // Additional Flags
      ...(result.additionalFlags.length > 0
        ? [
            sectionHeader('Flagged Issues for Clinician'),
            {
              ul: result.additionalFlags.map(
                (f) => ({
                  text: `[${f.priority.toUpperCase()}] ${f.category}: ${f.message}`,
                  color: f.priority === 'high' ? '#dc2626' : f.priority === 'medium' ? '#d97706' : '#4b5563',
                  margin: [0, 2, 0, 2] as [number, number, number, number]
                })
              ),
              margin: [0, 0, 0, 16] as [number, number, number, number]
            }
          ]
        : []),

      // Fired Rules
      ...(result.firedRules.length > 0
        ? [
            sectionHeader('Priority Classification Justification'),
            {
              table: {
                headerRows: 1,
                widths: [60, 80, '*', 60],
                body: [
                  [
                    { text: 'Rule ID', bold: true, fontSize: 9 },
                    { text: 'Category', bold: true, fontSize: 9 },
                    { text: 'Finding', bold: true, fontSize: 9 },
                    { text: 'Priority', bold: true, fontSize: 9 }
                  ],
                  ...result.firedRules.map((r) => [
                    { text: r.id, fontSize: 8, color: '#6b7280' },
                    { text: r.category, fontSize: 9 },
                    { text: r.description, fontSize: 9 },
                    { text: r.priorityLevel, fontSize: 9, bold: true }
                  ])
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 16] as [number, number, number, number]
            }
          ]
        : [])
    ],
    defaultStyle: {
      fontSize: 10
    }
  };
}

function sectionHeader(text: string) {
  return {
    text,
    fontSize: 14,
    bold: true,
    color: '#1f2937',
    margin: [0, 8, 0, 8] as [number, number, number, number]
  };
}

function field(label: string, value: string) {
  return {
    text: [
      { text: `${label}: `, bold: true, color: '#6b7280' },
      { text: value }
    ],
    margin: [0, 4, 0, 4] as [number, number, number, number]
  };
}
```

- [ ] **Step 2: Create report/pdf/+server.ts**

```typescript
import type { RequestHandler } from './$types';
import { buildPdfDocument } from '$lib/report/pdf-builder';
import type { AssessmentData, GradingResult } from '$lib/engine/types';

export const POST: RequestHandler = async ({ request }) => {
  const { data, result } = (await request.json()) as {
    data: AssessmentData;
    result: GradingResult;
  };

  const docDefinition = buildPdfDocument(data, result);

  const PdfPrinter = (await import('pdfmake')).default;

  const fonts = {
    Roboto: {
      normal: 'node_modules/pdfmake/build/vfs_fonts.js',
      bold: 'node_modules/pdfmake/build/vfs_fonts.js',
      italics: 'node_modules/pdfmake/build/vfs_fonts.js',
      bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js'
    }
  };

  // @ts-expect-error pdfmake types don't expose constructor correctly
  const printer = new PdfPrinter(fonts);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  const chunks: Uint8Array[] = [];

  return new Promise<Response>((resolve) => {
    pdfDoc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(
        new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="prescription-request.pdf"`
          }
        })
      );
    });
    pdfDoc.end();
  });
};
```

- [ ] **Step 3: Create report/+page.svelte**

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { assessment } from '$lib/stores/assessment.svelte';
  import { priorityLevelLabel, priorityLevelColor } from '$lib/engine/utils';

  const data = $derived(assessment.data);
  const result = $derived(assessment.result);

  $effect(() => {
    if (!assessment.result) {
      goto('/');
    }
  });

  let pdfError = $state('');

  async function downloadPDF() {
    pdfError = '';
    try {
      const res = await fetch('/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: assessment.data, result: assessment.result })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-request-${data.patientInformation.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        pdfError = 'Failed to generate PDF. Please try again.';
      }
    } catch {
      pdfError = 'Failed to generate PDF. Please check your connection and try again.';
    }
  }

  function startNew() {
    assessment.reset();
    goto('/');
  }

  const priorityColor: Record<string, string> = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-gray-100 text-gray-700 border-gray-300'
  };
</script>

{#if result}
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white shadow-sm no-print">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <h1 class="text-lg font-bold text-gray-900">Prescription Request Report</h1>
        <div class="flex gap-3">
          {#if pdfError}
            <span class="text-sm text-red-600">{pdfError}</span>
          {/if}
          <button
            onclick={downloadPDF}
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Download PDF
          </button>
          <button
            onclick={() => window.print()}
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Print
          </button>
          <button
            onclick={startNew}
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            New Request
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-6">
      <!-- Priority Level Banner -->
      <div class="mb-6 rounded-xl border-2 p-6 text-center {priorityLevelColor(result.priorityLevel)}">
        <div class="text-3xl font-bold capitalize">{result.priorityLevel}</div>
        <div class="mt-1 text-lg">{priorityLevelLabel(result.priorityLevel)}</div>
        <div class="mt-2 text-sm opacity-75">
          Generated {new Date(result.timestamp).toLocaleString()}
        </div>
      </div>

      <!-- Additional Flags -->
      {#if result.additionalFlags.length > 0}
        <div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
          <h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Clinician</h2>
          <div class="space-y-2">
            {#each result.additionalFlags as flag}
              <div class="flex items-start gap-3 rounded-lg border p-3 {priorityColor[flag.priority]}">
                <span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor[flag.priority]}">
                  {flag.priority}
                </span>
                <div>
                  <span class="font-medium">{flag.category}:</span>
                  {flag.message}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Fired Rules -->
      {#if result.firedRules.length > 0}
        <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-lg font-bold text-gray-900">Priority Classification Justification</h2>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-gray-600">
                <th class="pb-2 pr-4">Rule</th>
                <th class="pb-2 pr-4">Category</th>
                <th class="pb-2 pr-4">Finding</th>
                <th class="pb-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {#each result.firedRules as rule}
                <tr class="border-b border-gray-100">
                  <td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
                  <td class="py-2 pr-4">{rule.category}</td>
                  <td class="py-2 pr-4">{rule.description}</td>
                  <td class="py-2 capitalize">{rule.priorityLevel}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      <!-- Prescription Summary -->
      <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-lg font-bold text-gray-900">Prescription Summary</h2>
        <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><span class="font-medium text-gray-600">Patient:</span> {data.patientInformation.firstName} {data.patientInformation.lastName}</div>
          <div><span class="font-medium text-gray-600">NHS Number:</span> {data.patientInformation.nhsNumber || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Clinician:</span> {data.clinicianInformation.firstName} {data.clinicianInformation.lastName}</div>
          <div><span class="font-medium text-gray-600">NHS Employee No.:</span> {data.clinicianInformation.nhsEmployeeNumber || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Medication:</span> {data.prescriptionDetails.medicationName || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Dosage:</span> {data.prescriptionDetails.dosage || 'N/A'} {data.prescriptionDetails.frequency || ''}</div>
          <div><span class="font-medium text-gray-600">Route:</span> {data.prescriptionDetails.routeOfAdministration || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Request Date:</span> {data.prescriptionDetails.requestDate || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Type:</span> {data.requestType.isNewPrescription === 'yes' ? 'New' : 'Refill'}</div>
          <div><span class="font-medium text-gray-600">Emergency:</span> {data.requestType.isEmergency === 'yes' ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <!-- Treatment Instructions -->
      {#if data.prescriptionDetails.treatmentInstructions.trim()}
        <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 class="mb-4 text-lg font-bold text-gray-900">Treatment Instructions</h2>
          <p class="text-sm whitespace-pre-wrap">{data.prescriptionDetails.treatmentInstructions}</p>
        </div>
      {/if}

      <!-- Substitution Options -->
      <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-lg font-bold text-gray-900">Substitution Options</h2>
        <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div><span class="font-medium text-gray-600">Brand:</span> {data.substitutionOptions.allowBrandSubstitution || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Generic:</span> {data.substitutionOptions.allowGenericSubstitution || 'N/A'}</div>
          <div><span class="font-medium text-gray-600">Dosage:</span> {data.substitutionOptions.allowDosageAdjustment || 'N/A'}</div>
        </div>
        {#if data.substitutionOptions.substitutionNotes.trim()}
          <p class="mt-3 text-sm text-gray-600">{data.substitutionOptions.substitutionNotes}</p>
        {/if}
      </div>
    </main>
  </div>
{/if}
```

- [ ] **Step 4: Commit report and PDF**

```bash
git add front-end-patient-form-with-svelte/src/lib/report/ front-end-patient-form-with-svelte/src/routes/report/
git commit -m "feat(prescription-request): add report page and PDF generation"
```

---

### Task 7: Clinician Dashboard

**Files:**
- Create: `front-end-clinician-dashboard-with-svelte/package.json`
- Create: `front-end-clinician-dashboard-with-svelte/svelte.config.js`
- Create: `front-end-clinician-dashboard-with-svelte/vite.config.ts`
- Create: `front-end-clinician-dashboard-with-svelte/tsconfig.json`
- Create: `front-end-clinician-dashboard-with-svelte/src/app.html`
- Create: `front-end-clinician-dashboard-with-svelte/src/app.css`
- Create: `front-end-clinician-dashboard-with-svelte/src/app.d.ts`
- Create: `front-end-clinician-dashboard-with-svelte/src/lib/index.ts`
- Create: `front-end-clinician-dashboard-with-svelte/src/lib/types.ts`
- Create: `front-end-clinician-dashboard-with-svelte/src/lib/data.ts`
- Create: `front-end-clinician-dashboard-with-svelte/src/lib/api.ts`
- Create: `front-end-clinician-dashboard-with-svelte/src/routes/+layout.svelte`
- Create: `front-end-clinician-dashboard-with-svelte/src/routes/+page.svelte`

- [ ] **Step 1: Create package.json and config files**

`package.json`:
```json
{
  "name": "prescription-request-clinician-dashboard",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^7.0.0",
    "@sveltejs/kit": "^2.50.2",
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "@tailwindcss/vite": "^4.2.1",
    "svelte": "^5.49.2",
    "svelte-check": "^4.3.6",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.9.3",
    "vite": "^7.3.1"
  },
  "dependencies": {
    "@svar-ui/svelte-grid": "^2.5.1"
  }
}
```

Config files (`svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `src/app.html`, `src/app.d.ts`, `src/lib/index.ts`) are identical to the patient form versions (without the `test` config in vite.config.ts).

`src/app.css`:
```css
@import 'tailwindcss';

@theme {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-danger: #dc2626;
  --color-warning: #f59e0b;
  --color-success: #16a34a;
  --color-muted: #6b7280;
  --color-nhs-blue: #005eb8;
}
```

- [ ] **Step 2: Create types.ts**

```typescript
/** Prescription request row displayed in the clinician dashboard */
export interface PrescriptionRow {
  id: string;
  nhsNumber: string;
  patientName: string;
  clinicianName: string;
  medicationName: string;
  dosage: string;
  requestType: string;
  priorityLevel: string;
  requestDate: string;
  status: string;
}

/** Response from GET /api/dashboard/prescriptions */
export interface DashboardPrescriptionsResponse {
  items: PrescriptionRow[];
  total: number;
}
```

- [ ] **Step 3: Create data.ts**

```typescript
import type { PrescriptionRow } from './types.ts';

/** Sample prescription request data for the clinician dashboard */
export const prescriptions: PrescriptionRow[] = [
  {
    id: '1',
    nhsNumber: '943 476 5919',
    patientName: 'Doe, Jane',
    clinicianName: 'Dr Smith',
    medicationName: 'Amoxicillin',
    dosage: '500mg TDS',
    requestType: 'New',
    priorityLevel: 'routine',
    requestDate: '2026-04-15',
    status: 'submitted',
  },
  {
    id: '2',
    nhsNumber: '721 938 4102',
    patientName: 'Patel, Priya',
    clinicianName: 'Dr Jones',
    medicationName: 'Metformin',
    dosage: '500mg BD',
    requestType: 'Refill',
    priorityLevel: 'routine',
    requestDate: '2026-04-14',
    status: 'approved',
  },
  {
    id: '3',
    nhsNumber: '384 615 7230',
    patientName: 'Jones, Margaret',
    clinicianName: 'Dr Williams',
    medicationName: 'Salbutamol Inhaler',
    dosage: '100mcg PRN',
    requestType: 'New',
    priorityLevel: 'emergency',
    requestDate: '2026-04-15',
    status: 'submitted',
  },
  {
    id: '4',
    nhsNumber: '512 847 9063',
    patientName: 'Williams, David',
    clinicianName: 'Dr Smith',
    medicationName: 'Ramipril',
    dosage: '10mg OD',
    requestType: 'Refill',
    priorityLevel: 'routine',
    requestDate: '2026-04-13',
    status: 'approved',
  },
  {
    id: '5',
    nhsNumber: '167 293 8451',
    patientName: 'Brown, Sarah',
    clinicianName: 'Dr Taylor',
    medicationName: 'Insulin Glargine',
    dosage: '20 units OD',
    requestType: 'Refill',
    priorityLevel: 'urgent',
    requestDate: '2026-04-15',
    status: 'submitted',
  },
  {
    id: '6',
    nhsNumber: '835 162 4097',
    patientName: 'Taylor, James',
    clinicianName: 'Dr Smith',
    medicationName: 'Omeprazole',
    dosage: '20mg OD',
    requestType: 'New',
    priorityLevel: 'routine',
    requestDate: '2026-04-12',
    status: 'reviewed',
  },
  {
    id: '7',
    nhsNumber: '294 708 5316',
    patientName: 'Davies, Helen',
    clinicianName: 'Dr Jones',
    medicationName: 'Sertraline',
    dosage: '50mg OD',
    requestType: 'New',
    priorityLevel: 'urgent',
    requestDate: '2026-04-14',
    status: 'submitted',
  },
  {
    id: '8',
    nhsNumber: '608 341 2975',
    patientName: 'Wilson, Robert',
    clinicianName: 'Dr Williams',
    medicationName: 'Amlodipine',
    dosage: '5mg OD',
    requestType: 'Refill',
    priorityLevel: 'routine',
    requestDate: '2026-04-11',
    status: 'approved',
  },
  {
    id: '9',
    nhsNumber: '473 926 1084',
    patientName: 'Evans, Catherine',
    clinicianName: 'Dr Taylor',
    medicationName: 'EpiPen',
    dosage: '0.3mg PRN',
    requestType: 'New',
    priorityLevel: 'emergency',
    requestDate: '2026-04-15',
    status: 'submitted',
  },
  {
    id: '10',
    nhsNumber: '159 684 7302',
    patientName: 'Thomas, Michael',
    clinicianName: 'Dr Smith',
    medicationName: 'Atorvastatin',
    dosage: '20mg OD',
    requestType: 'Refill',
    priorityLevel: 'routine',
    requestDate: '2026-04-10',
    status: 'approved',
  },
  {
    id: '11',
    nhsNumber: '742 051 3896',
    patientName: 'Robinson, Emma',
    clinicianName: 'Dr Jones',
    medicationName: 'Fluoxetine',
    dosage: '20mg OD',
    requestType: 'New',
    priorityLevel: 'urgent',
    requestDate: '2026-04-14',
    status: 'reviewed',
  },
  {
    id: '12',
    nhsNumber: '386 219 5740',
    patientName: 'Clark, George',
    clinicianName: 'Dr Williams',
    medicationName: 'GTN Spray',
    dosage: '400mcg PRN',
    requestType: 'New',
    priorityLevel: 'emergency',
    requestDate: '2026-04-15',
    status: 'submitted',
  },
];
```

- [ ] **Step 4: Create api.ts**

```typescript
import type { DashboardPrescriptionsResponse, PrescriptionRow } from './types.ts';

const API_BASE = 'http://localhost:5150';

/** Fetch prescription list from the backend dashboard endpoint. */
export async function fetchPrescriptions(): Promise<PrescriptionRow[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/prescriptions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch prescriptions: ${res.status} ${res.statusText}`);
  }
  const data: DashboardPrescriptionsResponse = await res.json();
  return data.items;
}
```

- [ ] **Step 5: Create routes**

`src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>Prescription Request -- Clinician Dashboard</title>
</svelte:head>

{@render children()}
```

`src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import { Grid, Willow } from '@svar-ui/svelte-grid';
  import { fetchPrescriptions } from '$lib/api.ts';
  import { prescriptions as samplePrescriptions } from '$lib/data.ts';
  import type { PrescriptionRow } from '$lib/types.ts';

  let prescriptions = $state<PrescriptionRow[]>(samplePrescriptions);
  let loading = $state(true);
  let error = $state('');
  let searchTerm = $state('');
  let priorityFilter = $state('');
  let typeFilter = $state('');
  let gridApi = $state<any>(null);

  $effect(() => {
    fetchPrescriptions()
      .then((items) => {
        if (items.length > 0) {
          prescriptions = items;
        }
        loading = false;
      })
      .catch(() => {
        loading = false;
      });
  });

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'New', label: 'New' },
    { value: 'Refill', label: 'Refill' },
  ];

  const columns = [
    { id: 'patientName', header: 'Patient', flexgrow: 1, sort: true },
    { id: 'medicationName', header: 'Medication', flexgrow: 1, sort: true },
    { id: 'dosage', header: 'Dosage', width: 120, sort: true },
    { id: 'requestType', header: 'Type', width: 80, sort: true },
    {
      id: 'priorityLevel',
      header: 'Priority',
      width: 110,
      sort: true,
      template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    { id: 'requestDate', header: 'Date', width: 110, sort: true },
    {
      id: 'status',
      header: 'Status',
      width: 100,
      sort: true,
      template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
  ];

  function init(api: any) {
    gridApi = api;
    api.exec('sort-rows', { key: 'requestDate', order: 'desc' });
  }

  function applyFilters() {
    if (!gridApi) return;

    const term = searchTerm.toLowerCase();

    const filter = (row: PrescriptionRow) => {
      if (term) {
        const matches =
          row.patientName.toLowerCase().includes(term) ||
          row.medicationName.toLowerCase().includes(term) ||
          row.nhsNumber.toLowerCase().includes(term) ||
          row.clinicianName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      if (priorityFilter && row.priorityLevel !== priorityFilter) return false;
      if (typeFilter && row.requestType !== typeFilter) return false;

      return true;
    };

    gridApi.exec('filter-rows', { filter });
  }

  function clearFilters() {
    searchTerm = '';
    priorityFilter = '';
    typeFilter = '';
    if (gridApi) {
      gridApi.exec('filter-rows', { filter: () => true });
    }
  }

  let hasActiveFilters = $derived(
    searchTerm !== '' || priorityFilter !== '' || typeFilter !== ''
  );
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-nhs-blue text-white shadow">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <h1 class="text-2xl font-bold">Prescription Request -- Clinician Dashboard</h1>
      <p class="mt-1 text-sm text-blue-100">Prescription requests with priority classification</p>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <!-- Filters bar -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-4">
        <div class="min-w-[240px] flex-1">
          <label for="search" class="mb-1 block text-sm font-medium text-gray-700">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Patient, medication, NHS number, or clinician..."
            bind:value={searchTerm}
            oninput={applyFilters}
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label for="priority-filter" class="mb-1 block text-sm font-medium text-gray-700">Priority</label>
          <select
            id="priority-filter"
            bind:value={priorityFilter}
            onchange={applyFilters}
            class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {#each priorityOptions as opt (opt.value)}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="type-filter" class="mb-1 block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type-filter"
            bind:value={typeFilter}
            onchange={applyFilters}
            class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {#each typeOptions as opt (opt.value)}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>

        {#if hasActiveFilters}
          <button
            onclick={clearFilters}
            class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Clear filters
          </button>
        {/if}
      </div>
    </div>

    <!-- Data grid -->
    <div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
      {#if loading}
        <div class="flex h-full items-center justify-center text-muted">
          Loading prescriptions...
        </div>
      {:else}
        <Willow>
          <Grid data={prescriptions} {columns} {init} />
        </Willow>
      {/if}
    </div>

    <!-- Summary -->
    <div class="mt-4 flex items-center gap-4 text-sm text-muted">
      <span>{prescriptions.length} prescription requests total</span>
      {#if error}
        <span class="text-warning">{error}</span>
      {/if}
    </div>
  </main>
</div>
```

- [ ] **Step 6: Install dependencies**

```bash
cd forms/prescription-request/front-end-clinician-dashboard-with-svelte
npm install
```

- [ ] **Step 7: Commit clinician dashboard**

```bash
git add front-end-clinician-dashboard-with-svelte/
git commit -m "feat(prescription-request): add clinician dashboard with SVAR DataGrid"
```

---

### Task 8: Project Documentation

**Files:**
- Create: `index.md`
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `plan.md`
- Create: `README.md` (symlink to index.md)

- [ ] **Step 1: Create index.md**

```markdown
# Prescription Request

Prescription request form collecting patient information, clinician details, medication and dosage, substitution options, and request type classification with priority urgency grading (Routine / Urgent / Emergency).

## Scoring system

- **Instrument**: Priority Classification
- **Range**: Routine / Urgent / Emergency
- **Categories**: Routine = standard processing, Urgent = requires prompt attention, Emergency = immediate action required

## Steps

| # | Step |
|---|------|
| 1 | Patient Information |
| 2 | Clinician Information |
| 3 | Prescription Details |
| 4 | Substitution Options |
| 5 | Request Type & Review |

## Directory structure

```
prescription-request/
  front-end-patient-form-with-svelte/
  front-end-clinician-dashboard-with-svelte/
  sql-migrations/
  xml-representations/
  fhir-r5/
```

## Technology

See [root index.md](../index.md) for technology stacks.
```

- [ ] **Step 2: Create AGENTS.md, CLAUDE.md, plan.md, README.md symlink**

`CLAUDE.md`:
```markdown
@AGENTS.md
```

`AGENTS.md`:
```markdown
# Prescription Request

Prescription request form with priority classification engine (Routine / Urgent / Emergency).

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./sql-migrations/ - PostgreSQL schema migrations
- ./xml-representations/ - XML and DTD per SQL table entity
- ./fhir-r5/ - FHIR HL7 R5 JSON per SQL table entity

## Scoring system

- **Instrument**: Priority Classification
- **Range**: Routine / Urgent / Emergency
- **Engine files**: `types.ts`, `prescription-rules.ts`, `prescription-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `prescription-grader.test.ts`

## Assessment steps (5 total)

1. Patient Information - `Step1PatientInformation.svelte`
2. Clinician Information - `Step2ClinicianInformation.svelte`
3. Prescription Details - `Step3PrescriptionDetails.svelte`
4. Substitution Options - `Step4SubstitutionOptions.svelte`
5. Request Type & Review - `Step5RequestType.svelte`

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
```

`plan.md`:
```markdown
# Prescription Request - Development Plan

## Status: Complete

All tasks implemented:
- [x] SQL migrations
- [x] XML and FHIR R5 representations
- [x] Patient form with SvelteKit
- [x] Priority classification engine with tests
- [x] Report page with PDF generation
- [x] Clinician dashboard with SVAR DataGrid
- [x] Project documentation
```

README.md symlink:
```bash
cd forms/prescription-request
ln -s index.md README.md
```

- [ ] **Step 3: Commit documentation**

```bash
git add index.md AGENTS.md CLAUDE.md plan.md README.md
git commit -m "feat(prescription-request): add project documentation"
```

---

### Task 9: Run tests and verify

- [ ] **Step 1: Run engine tests**

```bash
cd forms/prescription-request/front-end-patient-form-with-svelte
npx vitest run
```

Expected: All 13 tests pass (7 grading + 6 flags).

- [ ] **Step 2: Run type checking on patient form**

```bash
cd forms/prescription-request/front-end-patient-form-with-svelte
npm run check
```

Expected: No type errors.

- [ ] **Step 3: Run type checking on clinician dashboard**

```bash
cd forms/prescription-request/front-end-clinician-dashboard-with-svelte
npm run check
```

Expected: No type errors.

- [ ] **Step 4: Run project-level tests**

```bash
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test
```

Expected: All tests pass.
