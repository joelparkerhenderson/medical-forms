# Screening Program Privacy Notice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a screening program privacy notice form where patients read an NHS privacy notice about medical research / service planning / clinical audits, then acknowledge by checking a box, entering their full name and date. A clinician dashboard lists all completed acknowledgments.

**Architecture:** Single-page HTML patient form with a `practiceConfig` JS object for practice-specific customization (practice name, DPO, research orgs, GDPR basis). Dashboard reads submissions from localStorage with sample data fallback. SQL migrations, XML, and FHIR R5 follow the established sibling pattern from `legal-requirements-privacy-notice`.

**Tech Stack:** Vanilla HTML/CSS/JS, PostgreSQL 18, XML/DTD, FHIR HL7 R5 JSON

---

### Task 1: Documentation scaffolding

**Files:**
- Create: `index.md`
- Create: `AGENTS.md`
- Create: `CLAUDE.md` (symlink to AGENTS.md)
- Create: `README.md` (symlink to index.md)
- Create: `plan.md`
- Create: `tasks.md`

- [ ] **Step 1: Create index.md**

```markdown
# Screening Program Privacy Notice

A UK NHS GP practice privacy notice informing patients how their information
is used for medical research, planning services, and checking the quality of
care (national clinical audits). The patient reads the notice, confirms
understanding and agreement, then provides their full name and date.

## Form flow

- Step 1: Privacy Notice — patient reads the full screening program privacy notice
- Step 2: Acknowledgment — patient checks a box confirming understanding and agreement, enters full name and date

## Scoring

This form does not use a scoring engine. It is an acknowledgment form — the
patient either confirms or does not confirm that they have read and understood
the notice.

## Completion status

- **Complete**: checkbox is checked, full name is provided, date is provided
- **Incomplete**: any required field is missing

## Technology stacks

- SQL migrations: PostgreSQL 18 with Liquibase-format migrations
- XML representations: XML and DTD per SQL table entity
- FHIR R5: FHIR HL7 R5 JSON per SQL table entity
- Front-end patient form with HTML: single-page HTML/CSS/JS
- Front-end clinician dashboard with HTML: single-page HTML/CSS/JS

## Conventions

- Property names use camelCase in JavaScript and snake_case in SQL.
- Unanswered text fields default to empty string `''`.
- Unanswered date fields default to empty string `''`.
- Boolean fields default to `false`.

## Compliance

- UK GDPR Article 6(1)(e) — processing necessary for a task carried out in the public interest
- UK GDPR Article 9(2)(a) — explicit consent for special category data
- UK GDPR Article 9(2)(j) — scientific or historical research purposes
- UK GDPR Article 9(2)(h) — preventative medicine, health/social care provision
```

- [ ] **Step 2: Create AGENTS.md**

```markdown
# Screening Program Privacy Notice

## Directory structure

screening-program-privacy-notice/
  index.md
  README.md -> index.md
  AGENTS.md
  CLAUDE.md -> AGENTS.md
  plan.md
  tasks.md
  seed.md
  sql-migrations/
  xml-representations/
  fhir-r5/
  front-end-form-with-html/
  front-end-dashboard-with-html/

## Form data model

- **patient**: patient demographics (first_name, last_name, nhs_number)
- **acknowledgment**: the acknowledgment record (patient_id, confirmed, full_name, acknowledged_date)

## Patient form

The patient form has two sections:
1. Privacy Notice — displays the full screening program text with practice-customizable fields
2. Acknowledgment — checkbox, full name input, date input

## Practice customization

The patient form includes a `practiceConfig` JavaScript object at the top of the script section. Practices edit this object to fill in their specific details (practice name, DPO, research organisations, GDPR basis).

## Dashboard

The clinician dashboard displays a table of completed acknowledgments with columns:
- Patient Name
- NHS Number
- Acknowledged Date
- Status (Complete/Incomplete)
```

- [ ] **Step 3: Create symlinks, plan.md, tasks.md**

```bash
cd forms/screening-program-privacy-notice
ln -s AGENTS.md CLAUDE.md
ln -s index.md README.md
```

plan.md:
```markdown
# Screening Program Privacy Notice — Implementation Plan

## Status: In Progress

## Steps

1. [ ] Create documentation (index.md, AGENTS.md, plan.md, tasks.md)
2. [ ] Create SQL migrations (extensions, patient, acknowledgment)
3. [ ] Create XML representations (patient, acknowledgment)
4. [ ] Create FHIR R5 representations (patient, acknowledgment)
5. [ ] Create HTML patient form
6. [ ] Create HTML clinician dashboard
```

tasks.md:
```markdown
# Tasks

- [ ] Documentation files
- [ ] SQL migrations
- [ ] XML representations
- [ ] FHIR R5 representations
- [ ] HTML patient form
- [ ] HTML clinician dashboard
```

- [ ] **Step 4: Create doc/ directory**

```bash
mkdir -p doc
```

- [ ] **Step 5: Commit**

```bash
git add index.md AGENTS.md CLAUDE.md README.md plan.md tasks.md doc/
git commit -m "feat(screening-program-privacy-notice): add documentation scaffolding"
```

---

### Task 2: SQL migrations

**Files:**
- Create: `sql-migrations/00-extensions.sql`
- Create: `sql-migrations/01-patient.sql`
- Create: `sql-migrations/02-acknowledgment.sql`

- [ ] **Step 1: Create 00-extensions.sql**

```sql
-- liquibase formatted sql

-- changeset screening-program-privacy-notice:00-extensions

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a reusable trigger function to set updated_at on row modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 2: Create 01-patient.sql**

```sql
-- liquibase formatted sql

-- changeset screening-program-privacy-notice:01-patient

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    nhs_number TEXT NOT NULL DEFAULT '' UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS 'Patient demographic information.';
COMMENT ON COLUMN patient.id IS 'Unique identifier for the patient (UUID).';
COMMENT ON COLUMN patient.first_name IS 'Patient first name.';
COMMENT ON COLUMN patient.last_name IS 'Patient last name.';
COMMENT ON COLUMN patient.nhs_number IS 'NHS number, unique identifier within the NHS.';
COMMENT ON COLUMN patient.created_at IS 'Timestamp when the record was created.';
COMMENT ON COLUMN patient.updated_at IS 'Timestamp when the record was last updated.';
```

- [ ] **Step 3: Create 02-acknowledgment.sql**

```sql
-- liquibase formatted sql

-- changeset screening-program-privacy-notice:02-acknowledgment

CREATE TABLE acknowledgment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    full_name TEXT NOT NULL DEFAULT '',
    acknowledged_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_acknowledgment_updated_at
    BEFORE UPDATE ON acknowledgment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE acknowledgment IS 'Patient acknowledgment of the screening program privacy notice.';
COMMENT ON COLUMN acknowledgment.id IS 'Unique identifier for the acknowledgment (UUID).';
COMMENT ON COLUMN acknowledgment.patient_id IS 'Foreign key referencing the patient who acknowledged the notice.';
COMMENT ON COLUMN acknowledgment.confirmed IS 'Whether the patient confirmed they have read and understood the privacy notice.';
COMMENT ON COLUMN acknowledgment.full_name IS 'Full name typed by the patient as their acknowledgment signature.';
COMMENT ON COLUMN acknowledgment.acknowledged_date IS 'Date the patient acknowledged the privacy notice.';
COMMENT ON COLUMN acknowledgment.created_at IS 'Timestamp when the record was created.';
COMMENT ON COLUMN acknowledgment.updated_at IS 'Timestamp when the record was last updated.';
```

- [ ] **Step 4: Commit**

```bash
git add sql-migrations/
git commit -m "feat(screening-program-privacy-notice): add SQL migrations"
```

---

### Task 3: XML representations

**Files:**
- Create: `xml-representations/patient.xml`
- Create: `xml-representations/patient.dtd`
- Create: `xml-representations/acknowledgment.xml`
- Create: `xml-representations/acknowledgment.dtd`

- [ ] **Step 1: Create patient XML and DTD**

patient.dtd:
```dtd
<!ELEMENT patient (id, first_name, last_name, nhs_number, created_at, updated_at)>
<!ELEMENT id (#PCDATA)>
<!ELEMENT first_name (#PCDATA)>
<!ELEMENT last_name (#PCDATA)>
<!ELEMENT nhs_number (#PCDATA)>
<!ELEMENT created_at (#PCDATA)>
<!ELEMENT updated_at (#PCDATA)>
```

patient.xml:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE patient SYSTEM "patient.dtd">
<patient>
  <id></id>
  <first_name></first_name>
  <last_name></last_name>
  <nhs_number></nhs_number>
  <created_at></created_at>
  <updated_at></updated_at>
</patient>
```

- [ ] **Step 2: Create acknowledgment XML and DTD**

acknowledgment.dtd:
```dtd
<!ELEMENT acknowledgment (id, patient_id, confirmed, full_name, acknowledged_date, created_at, updated_at)>
<!ELEMENT id (#PCDATA)>
<!ELEMENT patient_id (#PCDATA)>
<!ELEMENT confirmed (#PCDATA)>
<!ELEMENT full_name (#PCDATA)>
<!ELEMENT acknowledged_date (#PCDATA)>
<!ELEMENT created_at (#PCDATA)>
<!ELEMENT updated_at (#PCDATA)>
```

acknowledgment.xml:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE acknowledgment SYSTEM "acknowledgment.dtd">
<acknowledgment>
  <id></id>
  <patient_id></patient_id>
  <confirmed></confirmed>
  <full_name></full_name>
  <acknowledged_date></acknowledged_date>
  <created_at></created_at>
  <updated_at></updated_at>
</acknowledgment>
```

- [ ] **Step 3: Commit**

```bash
git add xml-representations/
git commit -m "feat(screening-program-privacy-notice): add XML representations"
```

---

### Task 4: FHIR R5 representations

**Files:**
- Create: `fhir-r5/patient.json`
- Create: `fhir-r5/acknowledgment.json`

- [ ] **Step 1: Create patient.json**

```json
{
  "resourceType": "Patient",
  "id": "00000000-0000-0000-0000-000000000000",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/StructureDefinition/Patient"
    ],
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  "identifier": [
    {
      "system": "https://fhir.nhs.uk/Id/nhs-number",
      "value": ""
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "",
      "given": [
        ""
      ]
    }
  ]
}
```

- [ ] **Step 2: Create acknowledgment.json**

```json
{
  "resourceType": "Consent",
  "id": "00000000-0000-0000-0000-000000000000",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/StructureDefinition/Consent"
    ],
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  "status": "active",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          "code": "INFA",
          "display": "information access"
        }
      ]
    }
  ],
  "subject": {
    "reference": "Patient/00000000-0000-0000-0000-000000000000"
  },
  "date": "",
  "grantor": [
    {
      "reference": "Patient/00000000-0000-0000-0000-000000000000"
    }
  ],
  "decision": "permit",
  "provision": [
    {
      "purpose": [
        {
          "system": "urn:medical-forms:screening-program-privacy-notice",
          "code": "screening_program_privacy_notice",
          "display": "Acknowledgment of screening program privacy notice"
        }
      ]
    }
  ],
  "extension": [
    {
      "url": "urn:medical-forms:screening-program-privacy-notice:confirmed",
      "valueBoolean": false
    },
    {
      "url": "urn:medical-forms:screening-program-privacy-notice:full_name",
      "valueString": ""
    },
    {
      "url": "urn:medical-forms:screening-program-privacy-notice:acknowledged_date",
      "valueDate": ""
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add fhir-r5/
git commit -m "feat(screening-program-privacy-notice): add FHIR R5 representations"
```

---

### Task 5: HTML patient form

**Files:**
- Create: `front-end-form-with-html/index.html`

- [ ] **Step 1: Create index.html**

Single-page HTML file with:
- NHS blue header (`#005eb8`)
- `practiceConfig` JS object at top of `<script>` with editable fields:
  - `practiceName` (default: `'[Insert name of practice]'`)
  - `dataControllerAddress` (default: `'[Insert practice name and address]'`)
  - `dataProtectionOfficer` (default: `'[Insert DPO name and contact details]'`)
  - `researchOrganisations` (default: `'[Insert names e.g. Clinical Practice Research Datalink, NHS England]'`)
  - `planningOrganisations` (default: `'[Insert relevant organisations]'`)
  - `auditBody` (default: `'Healthcare Quality Improvements Partnership'`)
  - `subjectAccessRequestLink` (default: `'[Insert link]'`)
  - `gdprBasis` (default: `'consent'`, alternative: `'research'`)
- Card-based notice sections from seed.md content with `<span class="config-value">` elements populated by JS
- GDPR Article 9(2)(a) vs 9(2)(j) toggle based on `gdprBasis` config value
- Acknowledgment card with checkbox, full name input, date input (auto-populated with today)
- Submit button disabled until all fields valid
- Confirmation screen with tick, name and date display
- Reset button for "Submit another"
- On submit: saves to localStorage key `screeningProgramAcknowledgments` as JSON array
- Inline CSS following NHS design system colors
- XSS protection via textContent assignment

See full HTML implementation in the task execution — follows the exact pattern from `legal-requirements-privacy-notice/front-end-form-with-html/index.html` with the addition of `practiceConfig` and config-value span population.

- [ ] **Step 2: Commit**

```bash
git add front-end-form-with-html/
git commit -m "feat(screening-program-privacy-notice): add HTML patient form with practice config"
```

---

### Task 6: HTML clinician dashboard

**Files:**
- Create: `front-end-dashboard-with-html/index.html`

- [ ] **Step 1: Create index.html**

Single-page HTML file with:
- NHS blue header with "Screening Program Privacy Notice" title and "Clinician Dashboard — Patient Acknowledgments" subtitle
- Filter bar: text search (name/NHS number), status dropdown (All/Complete/Incomplete), clear button
- Count display: "Showing X of Y acknowledgments"
- Sortable table with columns: Patient Name, NHS Number, Acknowledged Date, Status
- Sort arrows on column headers, click to toggle asc/desc
- Status badges: green "Complete" / orange "Incomplete"
- Empty state message when no matches
- Sample data: 8 patients with realistic UK names, NHS numbers, dates, mix of complete/incomplete
- On page load: reads localStorage `screeningProgramAcknowledgments`, merges with sample data
- `escapeHtml()` function for XSS protection
- Footer with GDPR article references
- Follows exact pattern from `legal-requirements-privacy-notice/front-end-dashboard-with-html/index.html`

- [ ] **Step 2: Commit**

```bash
git add front-end-dashboard-with-html/
git commit -m "feat(screening-program-privacy-notice): add HTML clinician dashboard"
```

---

### Task 7: Final updates

**Files:**
- Modify: `plan.md` — mark all steps complete
- Modify: `tasks.md` — check all boxes

- [ ] **Step 1: Update plan.md and tasks.md**

Mark all items as complete with `[x]`.

- [ ] **Step 2: Final commit**

```bash
git add plan.md tasks.md
git commit -m "feat(screening-program-privacy-notice): mark implementation complete"
```
