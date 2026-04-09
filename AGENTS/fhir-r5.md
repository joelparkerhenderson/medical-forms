# FHIR HL7 R5 representations

Ultrathink. FHIR HL7 R5 JSON resources for the forms.

Research the SQL in the folder `sql-migrations`.

Slug: fhir-r5

## FHIR R5 resource mapping

Each SQL table maps to a FHIR R5 resource type:

| SQL table               | FHIR R5 resource      | Purpose                              |
|-------------------------|-----------------------|--------------------------------------|
| patient                 | Patient               | Patient demographics and identifiers |
| assessment              | Encounter             | Clinical encounter for the form      |
| assessment_*            | Observation           | Clinical data sections (components)  |
| grading_result          | ClinicalImpression    | Computed scoring/grading result      |
| grading_fired_rule      | DetectedIssue         | Rules that fired during grading      |
| grading_additional_flag | DetectedIssue         | Safety-critical flags                |

## Directory structure

```
fhir-r5/
  patient.json                    # FHIR Patient resource
  assessment.json                 # FHIR Encounter resource
  assessment_<section>.json       # FHIR Observation resource per section
  grading_result.json             # FHIR ClinicalImpression resource
  grading_fired_rule.json         # FHIR DetectedIssue resource
  grading_additional_flag.json    # FHIR DetectedIssue resource
```

## FHIR conventions

- FHIR version: R5 (5.0.0)
- All resources include `meta.profile` referencing the base StructureDefinition
- Patient NHS numbers use system `https://fhir.nhs.uk/Id/nhs-number`
- Encounter class coded as AMB (ambulatory) from v3-ActCode
- Observation category coded as `survey` for form-based data
- Observation components map SQL columns to typed FHIR values
- ClinicalImpression summarises grading results as free text
- DetectedIssue severity maps from SQL priority (high/medium/low)
- References use `"reference": "ResourceType/uuid"` format
- Form-specific code systems use `urn:medical-forms:<slug>` URIs

## Regenerate

```sh
python3 bin/generate-fhir-r5-representations.py
```

## Verify

Verify that each JSON file is valid JSON and contains a valid `resourceType`.
