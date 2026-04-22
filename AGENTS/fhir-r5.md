# FHIR HL7 R5 representations

FHIR HL7 R5 JSON resources for each form, generated from `sql-migrations/`.
The directory where the JSON lives is `fhir-r5/` inside each form.

Slug: fhir-r5

- Search pattern: `forms/*/sql-migrations/*.sql`
- Search pattern: `forms/*/fhir-r5/*.json`

## FHIR R5 resource mapping

Each SQL table maps to a FHIR R5 resource type as follows:

| SQL table               | FHIR R5 resource   | Purpose                              |
| ----------------------- | ------------------ | ------------------------------------ |
| patient                 | Patient            | Patient demographics and identifiers |
| assessment              | Encounter          | Clinical encounter for the form      |
| assessment_*            | Observation        | Clinical data sections (components)  |
| grading_result          | ClinicalImpression | Computed scoring / grading result    |
| grading_fired_rule      | DetectedIssue      | Rules that fired during grading      |
| grading_additional_flag | DetectedIssue      | Safety-critical flags                |

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
- Every resource includes a `resourceType` field matching the resource type
- Every resource includes a `meta.profile` referencing the base StructureDefinition
- `id` values are the UUIDv4 primary key of the source SQL row
- References use the `"reference": "ResourceType/uuid"` format
- Patient NHS numbers use system `https://fhir.nhs.uk/Id/nhs-number`
- Encounter `class` coded as `AMB` (ambulatory) from v3-ActCode
- Encounter `type` coded with SNOMED CT where available
- Observation `category` coded as `survey` for form-based data
- Observation `components` map SQL columns to typed FHIR values (`valueInteger`, `valueString`, `valueQuantity`, etc.)
- ClinicalImpression summarises grading results in `summary` as free text, with `finding` entries for each categorical outcome
- DetectedIssue `severity` maps from SQL priority: `high` → `high`, `medium` → `moderate`, `low` → `low`
- Form-specific code systems use `urn:medical-forms:<slug>` URIs
- Form-specific ValueSets use `urn:medical-forms:<slug>:<name>` URIs

## Regenerate

Regenerate all FHIR R5 JSON files from the current SQL migrations:

```sh
python3 bin/generate-fhir-r5-representations.py
```

## Verify

Validate that every JSON file is well-formed and contains a `resourceType`:

```sh
for f in forms/*/fhir-r5/*.json; do
  python3 -c "import json, sys; d = json.load(open('$f')); assert 'resourceType' in d, 'missing resourceType'" \
    || echo "FAIL: $f"
done
```

For full FHIR validation, run the official HL7 FHIR Validator:

```sh
java -jar validator_cli.jar -version 5.0.0 forms/*/fhir-r5/*.json
```
