# Screening Program Privacy Notice

## Directory structure

```
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
```

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
