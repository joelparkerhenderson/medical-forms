# Care Privacy Notice

Read-and-acknowledge GDPR privacy notice for GP practices (BMA template).

## Form type

Single-page acknowledgment form. No multi-step wizard. No clinical scoring.

## Patient form flow

1. Display privacy notice text (populated from admin configuration)
2. Patient enters: full name, NHS number, date of birth, email
3. Patient checks: "I have read, understand, and agree to this privacy notice"
4. Date acknowledged (auto-populated, editable)
5. Submit

## Admin configuration

Practice-specific fields stored in `practice_configuration` table:
practice_name, practice_address, dpo_name, dpo_contact_details,
shared_records_link, safeguarding_service_name_address, safeguarding_policy_link,
nhs_body_name, nhs_body_website, nhs_body_phone, subject_access_request_link,
risk_stratification_link.

## Clinician dashboard

Table of completed acknowledgments: Patient Name, NHS Number, Date of Birth,
Email, Date Acknowledged. Sortable and searchable.

## Compliance

- UK General Data Protection Regulation (UK GDPR)
- Data Protection Act 2018
- BMA guidance on GDPR privacy notices for GP practices
