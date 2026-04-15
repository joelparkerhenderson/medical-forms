# Care Privacy Notice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-step care privacy notice form (practice config, privacy notice display, acknowledgment) with clinician dashboard.

**Architecture:** Multi-step SvelteKit wizard following existing consent-to-treatment patterns. Practice staff configure placeholders, patient reads rendered notice, checks agreement box, types name and date. Dashboard shows all completed acknowledgments.

**Tech Stack:** SvelteKit 2.x, Svelte 5 runes, Tailwind CSS 4, SVAR DataGrid, PostgreSQL, Vitest

---

### Task 1: Scaffold form directory and documentation

**Files:**
- Create: `forms/care-privacy-notice/index.md`
- Create: `forms/care-privacy-notice/README.md` (symlink)
- Create: `forms/care-privacy-notice/AGENTS.md`
- Create: `forms/care-privacy-notice/CLAUDE.md`
- Create: `forms/care-privacy-notice/plan.md`
- Create: `forms/care-privacy-notice/tasks.md`

- [ ] **Step 1: Create all documentation files and symlink**

See spec for content. Key points:
- index.md: 3 steps, Completeness Validation (Complete/Incomplete)
- AGENTS.md: Full directory structure, scoring system, 3 assessment steps, architecture
- CLAUDE.md: `@AGENTS.md`
- plan.md: Current status + future enhancements
- tasks.md: Checklist tracking
- README.md: symlink to index.md

- [ ] **Step 2: Commit**

---

### Task 2: SQL migrations

Create `forms/care-privacy-notice/sql-migrations/` with 7 files following the consent-to-treatment pattern.

- [ ] **Step 1: Create 00-extensions.sql** — pgcrypto + set_updated_at() trigger function
- [ ] **Step 2: Create 01-patient.sql** — first_name, last_name, date_of_birth, nhs_number, sex
- [ ] **Step 3: Create 02-assessment.sql** — patient_id FK, status (draft/submitted/reviewed/urgent)
- [ ] **Step 4: Create 03-assessment-practice-configuration.sql** — practice_name, practice_address, dpo_name, dpo_contact_details, research_organisations, data_sharing_partners
- [ ] **Step 5: Create 04-assessment-acknowledgment.sql** — agreed (boolean), patient_typed_full_name, patient_typed_date, acknowledged_at
- [ ] **Step 6: Create 05-grading-result.sql** — completeness_status (complete/incomplete), sections_complete (0-3), sections_total (3)
- [ ] **Step 7: Create 06-grading-fired-rule.sql** — rule_id, category, description, severity_level
- [ ] **Step 8: Commit**

---

### Task 3: Svelte patient form — project scaffold and engine

- [ ] **Step 1: Create project config files** — package.json, svelte.config.js, vite.config.ts, tsconfig.json, app.css, app.html, AGENTS.md, CLAUDE.md
- [ ] **Step 2: Create src/params/step.ts** — match 1-3
- [ ] **Step 3: Create src/lib/engine/types.ts** — PracticeConfiguration, AcknowledgmentSignature, AssessmentData, ValidationRule, FiredRule, AdditionalFlag, GradingResult, StepConfig
- [ ] **Step 4: Create src/lib/engine/utils.ts** — completenessPercent, validationStatus, completenessColor, completenessLabel
- [ ] **Step 5: Create src/lib/engine/validation-rules.ts** — REQ-PC-001 through REQ-PC-004 (practice config required fields), REQ-AK-001 through REQ-AK-003 (acknowledgment fields)
- [ ] **Step 6: Create src/lib/engine/form-validator.ts** — validateForm() checking all rules, treating `false` as empty for boolean `agreed` field
- [ ] **Step 7: Create src/lib/engine/flagged-issues.ts** — FLAG-NOACK-001 (not acknowledged), FLAG-NAME-001 (short name), FLAG-CONFIG-001 (missing practice config)
- [ ] **Step 8: Create src/lib/engine/form-validator.test.ts** — 11 tests covering complete form, empty form, individual missing fields, unique rule IDs, flag detection, priority sorting
- [ ] **Step 9: Create src/lib/config/steps.ts** — 3 steps (Practice Configuration, Privacy Notice, Acknowledgment & Signature)
- [ ] **Step 10: Create src/lib/stores/assessment.svelte.ts** — AssessmentStore class with $state, reset()
- [ ] **Step 11: Install dependencies and run tests**
- [ ] **Step 12: Commit**

---

### Task 4: Svelte patient form — UI components and step components

- [ ] **Step 1: Create UI components** — TextInput, TextArea, SectionCard, StepNavigation, ProgressBar (copied from consent-to-treatment with minor tweaks)
- [ ] **Step 2: Create Step1PracticeConfiguration.svelte** — TextInput/TextArea for practice_name, practice_address, dpo_name, dpo_contact_details, research_organisations, data_sharing_partners
- [ ] **Step 3: Create Step2PrivacyNotice.svelte** — Full BMA template text with practice details interpolated via $derived. Sections: medical research, clinical audits, legal basis, recipients and rights
- [ ] **Step 4: Create Step3AcknowledgmentSignature.svelte** — Checkbox (agreed), TextInput (full name), TextInput type=date (today's date, auto-populated)
- [ ] **Step 5: Commit**

---

### Task 5: Svelte patient form — routes and layout

- [ ] **Step 1: Create +layout.svelte** — imports app.css, title "Care Privacy Notice"
- [ ] **Step 2: Create +page.svelte** — landing page with description and "Begin Privacy Notice" button
- [ ] **Step 3: Create assessment/[step=step]/+page.svelte** — step router with ProgressBar, step components, StepNavigation, submitAssessment()
- [ ] **Step 4: Create report/+page.svelte** — completeness banner, flagged issues, missing fields table, acknowledgment summary
- [ ] **Step 5: Commit**

---

### Task 6: HTML clinician dashboard

- [ ] **Step 1: Create index.html** — header, filter bar (search, status dropdown, clear), table (Patient Name, NHS Number, Date Acknowledged, Status, Practice Name), footer
- [ ] **Step 2: Create css/style.css** — NHS Blue header, table styling, status badges (complete=green, incomplete=red), responsive
- [ ] **Step 3: Create js/data.js** — 15 sample patients with acknowledgment data
- [ ] **Step 4: Create js/api.js** — fetchPatients() from localhost:5150
- [ ] **Step 5: Create js/dashboard.js** — sort, filter, render, XSS escaping
- [ ] **Step 6: Create AGENTS.md and CLAUDE.md**
- [ ] **Step 7: Commit**

---

### Task 7: Svelte clinician dashboard

- [ ] **Step 1: Create project config files** — package.json (with @svar-ui/svelte-grid), svelte.config.js, vite.config.ts, tsconfig.json, app.css, app.html
- [ ] **Step 2: Create src/lib/types.ts** — PatientRow (patientName, nhsNumber, dateAcknowledged, status, practiceName), DashboardPatientsResponse
- [ ] **Step 3: Create src/lib/data.ts** — 15 sample patients matching HTML dashboard data
- [ ] **Step 4: Create src/lib/api.ts** — fetchPatients() from localhost:5150
- [ ] **Step 5: Create src/routes/+layout.svelte and +page.svelte** — SVAR Grid with Willow theme, filters (search, status), columns matching HTML dashboard
- [ ] **Step 6: Create AGENTS.md and CLAUDE.md**
- [ ] **Step 7: Install dependencies**
- [ ] **Step 8: Commit**

---

### Task 8: Generate XML and FHIR representations

- [ ] **Step 1: Generate XML** — `python3 bin/generate-xml-representations.py forms/care-privacy-notice`
- [ ] **Step 2: Generate FHIR R5** — `python3 bin/generate-fhir-r5-representations.py forms/care-privacy-notice`
- [ ] **Step 3: Commit**

---

### Task 9: Run tests and verify

- [ ] **Step 1: Run unit tests** — `npx vitest run` in patient form dir
- [ ] **Step 2: Run project-wide tests** — `bin/test`
- [ ] **Step 3: Update forms/AGENTS.md** — add care-privacy-notice entry alphabetically
- [ ] **Step 4: Final commit**
