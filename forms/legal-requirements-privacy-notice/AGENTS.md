# Legal Requirements Privacy Notice

## Directory structure

```
legal-requirements-privacy-notice/
  index.md                                         # Form description
  README.md -> index.md                            # Symlink for GitHub rendering
  AGENTS.md                                        # Agent instructions
  CLAUDE.md -> AGENTS.md                           # Claude Code project instructions
  plan.md                                          # Implementation plan and status
  tasks.md                                         # Task tracking
  seed.md                                          # Original seed content
  sql-migrations/                                  # PostgreSQL schema migrations
  xml-representations/                             # XML and DTD per SQL table entity
  fhir-r5/                                         # FHIR HL7 R5 JSON per SQL table entity
  front-end-patient-form-with-html/                # Patient form (HTML)
  front-end-patient-form-with-svelte/              # Patient form (SvelteKit)
  front-end-clinician-dashboard-with-html/         # Clinician dashboard (HTML)
  front-end-clinician-dashboard-with-svelte/       # Clinician dashboard (SvelteKit)
```

## Form data model

- **patient**: patient demographics (first_name, last_name, nhs_number)
- **acknowledgment**: the acknowledgment record (patient_id, confirmed, full_name, acknowledged_date)

## Patient form

The patient form has two sections:
1. Privacy Notice — displays the full legal requirements text
2. Acknowledgment — checkbox, full name input, date input

## Clinician dashboard

The clinician dashboard displays a table of completed acknowledgments with columns:
- Patient Name
- NHS Number
- Acknowledged Date
- Status (Complete/Incomplete)
