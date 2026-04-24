#!/usr/bin/env python3
"""Generate FHIR HL7 R5 JSON representations from SQL migration files.

For each form's sql-migrations/ directory, parses CREATE TABLE statements
and generates corresponding FHIR R5 JSON resources in fhir-r5/.

FHIR resource mapping:
  patient                  → Patient
  assessment               → Encounter
  assessment_*             → Observation (one per section)
  *_item                   → Observation (one per item row)
  grading_result           → ClinicalImpression
  grading_fired_rule       → DetectedIssue (finding)
  grading_additional_flag  → DetectedIssue (flag)
"""

import json
import os
import re
import sys
from pathlib import Path

FORMS_DIR = Path(__file__).resolve().parent.parent / "forms"

# Consistent example UUIDs
UUIDS = [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002",
    "880e8400-e29b-41d4-a716-446655440003",
    "990e8400-e29b-41d4-a716-446655440004",
    "aa0e8400-e29b-41d4-a716-446655440005",
    "bb0e8400-e29b-41d4-a716-446655440006",
    "cc0e8400-e29b-41d4-a716-446655440007",
    "dd0e8400-e29b-41d4-a716-446655440008",
    "ee0e8400-e29b-41d4-a716-446655440009",
    "ff0e8400-e29b-41d4-a716-44665544000a",
    "110e8400-e29b-41d4-a716-44665544000b",
    "220e8400-e29b-41d4-a716-44665544000c",
    "330e8400-e29b-41d4-a716-44665544000d",
    "440e8400-e29b-41d4-a716-44665544000e",
    "551e8400-e29b-41d4-a716-44665544000f",
    "661e8400-e29b-41d4-a716-446655440010",
    "771e8400-e29b-41d4-a716-446655440011",
    "881e8400-e29b-41d4-a716-446655440012",
    "991e8400-e29b-41d4-a716-446655440013",
    "aa1e8400-e29b-41d4-a716-446655440014",
    "bb1e8400-e29b-41d4-a716-446655440015",
    "cc1e8400-e29b-41d4-a716-446655440016",
    "dd1e8400-e29b-41d4-a716-446655440017",
    "ee1e8400-e29b-41d4-a716-446655440018",
    "ff1e8400-e29b-41d4-a716-446655440019",
    "112e8400-e29b-41d4-a716-44665544001a",
    "222e8400-e29b-41d4-a716-44665544001b",
    "332e8400-e29b-41d4-a716-44665544001c",
    "442e8400-e29b-41d4-a716-44665544001d",
]

TIMESTAMP = "2026-04-09T10:00:00+00:00"
DATE_EXAMPLE = "2026-01-15"
DOB_EXAMPLE = "1965-06-15"

table_uuid_map = {}
uuid_counter = 0


def get_uuid(table_name):
    global uuid_counter
    if table_name not in table_uuid_map:
        table_uuid_map[table_name] = UUIDS[uuid_counter % len(UUIDS)]
        uuid_counter += 1
    return table_uuid_map[table_name]


def parse_create_table(sql_text):
    """Parse CREATE TABLE statements from SQL text."""
    tables = []
    pattern = r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\((.*?)\);'
    matches = re.findall(pattern, sql_text, re.DOTALL | re.IGNORECASE)

    for table_name, body in matches:
        # Strip SQL line comments
        body = re.sub(r'--[^\n]*', '', body)
        columns = []
        depth = 0
        current = ""
        for char in body:
            if char == '(':
                depth += 1
                current += char
            elif char == ')':
                depth -= 1
                current += char
            elif char == ',' and depth == 0:
                columns.append(current.strip())
                current = ""
            else:
                current += char
        if current.strip():
            columns.append(current.strip())

        parsed_cols = []
        for col_def in columns:
            col_def = col_def.strip()
            if re.match(r'^(CREATE\b|CONSTRAINT\b|PRIMARY\s+KEY\b|UNIQUE\b|FOREIGN\s+KEY\b|CHECK\b|INDEX\b|EXCLUDE\b)', col_def, re.IGNORECASE):
                continue
            col_match = re.match(r'^(\w+)\s+([\w(),.]+(?:\s*\([^)]*\))?)', col_def, re.IGNORECASE)
            if col_match:
                col_name = col_match.group(1)
                col_type = col_match.group(2)
                if col_name.upper() in ('PRIMARY', 'UNIQUE', 'FOREIGN', 'CHECK', 'CONSTRAINT', 'INDEX', 'EXCLUDE', 'CREATE'):
                    continue
                check_match = re.search(r'CHECK\s*\([^)]*IN\s*\(([^)]+)\)', col_def, re.IGNORECASE)
                check_values = []
                if check_match:
                    check_values = re.findall(r"'([^']*)'", check_match.group(1))
                parsed_cols.append({
                    'name': col_name,
                    'type': col_type,
                    'check_values': check_values,
                    'definition': col_def,
                })
        if parsed_cols:
            tables.append((table_name, parsed_cols))
    return tables


# Boilerplate columns dropped when folding `assessment_<section>` children
# into the parent `assessment` row (so we don't carry per-child id/FK/timestamps).
CHILD_SKIP_COLUMNS = {"id", "assessment_id", "created_at", "updated_at"}


def merge_assessment_tables(tables):
    """Fold every `assessment_<section>` child into the `assessment` parent
    so the FHIR generator emits a single Encounter resource per form.

    Returns a new [(table_name, [columns])] list with assessment_* entries
    removed and their non-boilerplate columns appended to the assessment
    parent. Section-prefix renaming on column-name collision keeps every
    field. Other tables (patient, clinician, grading_*, …) are unchanged.
    """
    parent_idx = None
    children = []
    keep_indices = []

    for i, (name, cols) in enumerate(tables):
        if name == "assessment":
            parent_idx = i
            keep_indices.append(i)
        elif name.startswith("assessment_"):
            section = name[len("assessment_"):]
            children.append((section, cols))
        else:
            keep_indices.append(i)

    if parent_idx is None or not children:
        return list(tables)

    parent_name, parent_cols = tables[parent_idx]
    merged_cols = list(parent_cols)
    taken = {c["name"] for c in merged_cols}

    for section, child_cols in children:
        for col in child_cols:
            if col["name"] in CHILD_SKIP_COLUMNS:
                continue
            new_col = dict(col)
            if new_col["name"] in taken:
                new_col["name"] = f"{section}_{col['name']}"
            merged_cols.append(new_col)
            taken.add(new_col["name"])

    out = []
    for i in keep_indices:
        name, cols = tables[i]
        if i == parent_idx:
            out.append((name, merged_cols))
        else:
            out.append((name, cols))
    return out


def slug_to_title(slug):
    """Convert a form slug to a human-readable title."""
    return slug.replace('-', ' ').replace('_', ' ').title()


def col_name_to_display(name):
    """Convert a column name to a human-readable display string."""
    return name.replace('_', ' ').title()


def determine_fhir_type(col_name, col_type, check_values):
    """Determine the FHIR data type for a column."""
    col_type_upper = col_type.upper()
    name = col_name.lower()

    if name in ('created_at', 'updated_at', 'graded_at'):
        return 'instant'
    if name == 'date_of_birth' or 'DATE' in col_type_upper:
        return 'date'
    if 'date' in name:
        return 'date'
    if 'TIMESTAMPTZ' in col_type_upper or 'TIMESTAMP' in col_type_upper:
        return 'instant'
    if 'BOOLEAN' in col_type_upper:
        return 'boolean'
    if 'INTEGER' in col_type_upper or 'INT' in col_type_upper:
        if 'score' in name or 'total' in name:
            return 'integer-score'
        return 'integer'
    if 'NUMERIC' in col_type_upper or 'DECIMAL' in col_type_upper or 'REAL' in col_type_upper:
        return 'decimal'
    if check_values:
        return 'code'
    if 'TEXT' in col_type_upper:
        return 'string'
    return 'string'


def guess_fhir_value(col_name, col_type, check_values, fhir_type):
    """Generate an example FHIR value for a column."""
    name = col_name.lower()

    if fhir_type == 'instant':
        return TIMESTAMP
    if fhir_type == 'date':
        if name == 'date_of_birth':
            return DOB_EXAMPLE
        return DATE_EXAMPLE
    if fhir_type == 'boolean':
        return True
    if fhir_type == 'code':
        non_empty = [v for v in check_values if v]
        return non_empty[0] if non_empty else ""
    if fhir_type in ('integer', 'integer-score'):
        if 'score' in name or 'total' in name:
            return 5
        if 'age' in name:
            return 45
        if 'sort_order' in name:
            return 0
        if 'number' in name or 'count' in name or 'episodes' in name:
            return 2
        return 1
    if fhir_type == 'decimal':
        if 'weight' in name:
            return 70.0
        if 'height' in name:
            return 170.0
        if 'bmi' in name:
            return 24.2
        if 'score' in name:
            return 5.0
        if 'pressure' in name:
            return 120.0
        if 'rate' in name:
            return 72.0
        return 0.0

    # String values
    if name == 'first_name':
        return "Jane"
    if name == 'last_name':
        return "Doe"
    if name == 'nhs_number':
        return "9434765919"
    if name in ('sex', 'gender'):
        return "female"
    if 'name' in name:
        return "Example"
    if any(kw in name for kw in ('details', 'notes', 'description', 'comment', 'summary',
                                   'explanation', 'reason', 'narrative', 'history', 'plan',
                                   'recommendation', 'instruction', 'finding', 'observation',
                                   'impression', 'conclusion', 'remarks', 'text')):
        return "Example text."
    if 'medication' in name or 'drug' in name:
        return "Paracetamol"
    if 'dose' in name or 'dosage' in name:
        return "500mg"
    if 'frequency' in name:
        return "twice daily"
    if 'route' in name:
        return "oral"
    if 'allergen' in name:
        return "Peanuts"
    if 'reaction' in name:
        return "Urticaria"
    if 'symptom' in name:
        return "Fatigue"
    if 'diagnosis' in name:
        return "Under investigation"
    if 'category' in name:
        return "General"
    if 'rule_id' in name:
        return "RULE-001"
    if 'flag_id' in name:
        return "FLAG-001"
    if 'message' in name:
        return "Clinical flag detected."
    if 'priority' in name:
        return "medium"
    if 'severity' in name:
        return "moderate"
    if 'status' in name:
        return "active"
    if 'type' in name:
        return "standard"
    if 'site' in name or 'location' in name:
        return "Example location"
    if 'provider' in name or 'clinician' in name:
        return "Dr Smith"
    if 'email' in name:
        return "jane.doe@example.com"
    if 'phone' in name or 'telephone' in name:
        return "07700900000"
    if 'address' in name:
        return "123 Example Street"
    if 'postcode' in name:
        return "SW1A 1AA"
    if 'occupation' in name:
        return "Teacher"
    if 'ethnicity' in name:
        return "White British"
    if 'unit' in name:
        return "mg/dL"
    if 'result' in name:
        return "Normal"
    if 'code' in name:
        return "ABC123"
    if 'title' in name:
        return "Example Title"
    return ""


def map_sex_to_fhir_gender(value):
    """Map SQL sex values to FHIR administrative gender codes."""
    mapping = {
        'male': 'male',
        'female': 'female',
        'other': 'other',
        '': 'unknown',
    }
    return mapping.get(value, 'unknown')


def build_patient_resource(table_name, columns):
    """Build a FHIR R5 Patient resource from the patient table."""
    patient_id = get_uuid(table_name)

    # Extract column values
    col_map = {}
    for col in columns:
        if col['name'] in ('id', 'created_at', 'updated_at'):
            continue
        fhir_type = determine_fhir_type(col['name'], col['type'], col['check_values'])
        col_map[col['name']] = guess_fhir_value(col['name'], col['type'], col['check_values'], fhir_type)

    resource = {
        "resourceType": "Patient",
        "id": patient_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/Patient"
            ],
            "lastUpdated": TIMESTAMP
        },
        "identifier": [],
        "name": [
            {
                "use": "official",
                "family": col_map.get("last_name", "Doe"),
                "given": [col_map.get("first_name", "Jane")]
            }
        ],
        "birthDate": col_map.get("date_of_birth", DOB_EXAMPLE),
        "gender": map_sex_to_fhir_gender(col_map.get("sex", "")),
    }

    # Add NHS number if present
    if "nhs_number" in col_map:
        resource["identifier"].append({
            "system": "https://fhir.nhs.uk/Id/nhs-number",
            "value": col_map["nhs_number"]
        })

    if not resource["identifier"]:
        del resource["identifier"]

    # Add physical measurements as extensions
    extensions = []
    if "weight_kg" in col_map:
        extensions.append({
            "url": "http://hl7.org/fhir/StructureDefinition/patient-bodyWeight",
            "valueQuantity": {
                "value": col_map["weight_kg"],
                "unit": "kg",
                "system": "http://unitsofmeasure.org",
                "code": "kg"
            }
        })
    if "height_cm" in col_map:
        extensions.append({
            "url": "http://hl7.org/fhir/StructureDefinition/patient-bodyHeight",
            "valueQuantity": {
                "value": col_map["height_cm"],
                "unit": "cm",
                "system": "http://unitsofmeasure.org",
                "code": "cm"
            }
        })
    if "bmi" in col_map:
        extensions.append({
            "url": "http://hl7.org/fhir/StructureDefinition/patient-bmi",
            "valueDecimal": col_map["bmi"]
        })

    if extensions:
        resource["extension"] = extensions

    # Add extra demographic fields
    if "email" in col_map:
        resource.setdefault("telecom", []).append({
            "system": "email",
            "value": col_map["email"]
        })
    if "phone" in col_map or "telephone" in col_map:
        resource.setdefault("telecom", []).append({
            "system": "phone",
            "value": col_map.get("phone", col_map.get("telephone", ""))
        })
    if "address" in col_map or "postcode" in col_map:
        addr = {}
        if "address" in col_map:
            addr["line"] = [col_map["address"]]
        if "postcode" in col_map:
            addr["postalCode"] = col_map["postcode"]
        resource.setdefault("address", []).append(addr)
    if "ethnicity" in col_map:
        resource.setdefault("extension", []).append({
            "url": "http://hl7.org/fhir/StructureDefinition/patient-ethnicity",
            "valueString": col_map["ethnicity"]
        })
    if "occupation" in col_map:
        resource.setdefault("extension", []).append({
            "url": "http://hl7.org/fhir/StructureDefinition/patient-occupation",
            "valueString": col_map["occupation"]
        })

    return resource


def map_assessment_status_to_fhir(status):
    """Map SQL assessment status to FHIR Encounter status."""
    mapping = {
        'draft': 'planned',
        'submitted': 'in-progress',
        'reviewed': 'completed',
        'urgent': 'in-progress',
        'in-progress': 'in-progress',
        'completed': 'completed',
        'active': 'in-progress',
    }
    return mapping.get(status, 'planned')


def build_encounter_resource(table_name, columns, form_slug):
    """Build a FHIR R5 Encounter resource from the assessment table."""
    encounter_id = get_uuid(table_name)
    patient_id = get_uuid("patient")

    # Find status column
    status_value = "draft"
    for col in columns:
        if col['name'] == 'status' and col['check_values']:
            non_empty = [v for v in col['check_values'] if v]
            if non_empty:
                status_value = non_empty[0]
            break

    resource = {
        "resourceType": "Encounter",
        "id": encounter_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/Encounter"
            ],
            "lastUpdated": TIMESTAMP
        },
        "status": map_assessment_status_to_fhir(status_value),
        "class": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                        "code": "AMB",
                        "display": "ambulatory"
                    }
                ]
            }
        ],
        "type": [
            {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "185349003",
                        "display": "Encounter for check up"
                    }
                ],
                "text": slug_to_title(form_slug)
            }
        ],
        "subject": {
            "reference": f"Patient/{patient_id}"
        },
        "actualPeriod": {
            "start": TIMESTAMP
        }
    }

    return resource


def build_observation_resource(table_name, columns, form_slug):
    """Build a FHIR R5 Observation resource from an assessment section table."""
    obs_id = get_uuid(table_name)
    patient_id = get_uuid("patient")
    encounter_id = get_uuid("assessment")

    # Build components from columns (skip id, FKs, timestamps)
    skip_cols = {'id', 'assessment_id', 'created_at', 'updated_at'}
    components = []

    for col in columns:
        if col['name'] in skip_cols:
            continue
        # Skip FK columns ending in _id
        if col['name'].endswith('_id'):
            continue

        fhir_type = determine_fhir_type(col['name'], col['type'], col['check_values'])
        value = guess_fhir_value(col['name'], col['type'], col['check_values'], fhir_type)

        component = {
            "code": {
                "coding": [
                    {
                        "system": f"urn:medical-forms:{form_slug}",
                        "code": col['name'],
                        "display": col_name_to_display(col['name'])
                    }
                ]
            }
        }

        # Map value to appropriate FHIR value type
        if fhir_type == 'boolean':
            component["valueBoolean"] = value
        elif fhir_type in ('integer', 'integer-score'):
            component["valueInteger"] = value
        elif fhir_type == 'decimal':
            component["valueQuantity"] = {"value": value}
        elif fhir_type == 'code':
            component["valueCodeableConcept"] = {
                "coding": [
                    {
                        "system": f"urn:medical-forms:{form_slug}:{col['name']}",
                        "code": value,
                        "display": col_name_to_display(str(value))
                    }
                ]
            }
        elif fhir_type == 'date':
            component["valueDateTime"] = value
        elif fhir_type == 'instant':
            component["valueDateTime"] = value
        else:
            component["valueString"] = value

        components.append(component)

    # Derive display name from table name
    section_name = table_name.replace('assessment_', '').replace('_', ' ').title()

    resource = {
        "resourceType": "Observation",
        "id": obs_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/Observation"
            ],
            "lastUpdated": TIMESTAMP
        },
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "survey",
                        "display": "Survey"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": f"urn:medical-forms:{form_slug}",
                    "code": table_name,
                    "display": section_name
                }
            ]
        },
        "subject": {
            "reference": f"Patient/{patient_id}"
        },
        "encounter": {
            "reference": f"Encounter/{encounter_id}"
        },
        "effectiveDateTime": TIMESTAMP,
        "component": components
    }

    return resource


def build_clinical_impression_resource(table_name, columns, form_slug):
    """Build a FHIR R5 ClinicalImpression resource from the grading_result table."""
    ci_id = get_uuid(table_name)
    patient_id = get_uuid("patient")
    encounter_id = get_uuid("assessment")

    # Extract grading-specific values
    skip_cols = {'id', 'assessment_id', 'created_at', 'updated_at', 'graded_at'}
    summary_parts = []

    for col in columns:
        if col['name'] in skip_cols:
            continue
        if col['name'].endswith('_id'):
            continue
        fhir_type = determine_fhir_type(col['name'], col['type'], col['check_values'])
        value = guess_fhir_value(col['name'], col['type'], col['check_values'], fhir_type)
        summary_parts.append(f"{col_name_to_display(col['name'])}: {value}")

    resource = {
        "resourceType": "ClinicalImpression",
        "id": ci_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/ClinicalImpression"
            ],
            "lastUpdated": TIMESTAMP
        },
        "status": "completed",
        "subject": {
            "reference": f"Patient/{patient_id}"
        },
        "encounter": {
            "reference": f"Encounter/{encounter_id}"
        },
        "effectiveDateTime": TIMESTAMP,
        "date": TIMESTAMP,
        "description": slug_to_title(form_slug) + " grading result",
        "summary": "; ".join(summary_parts) if summary_parts else "Grading complete."
    }

    return resource


def build_fired_rule_resource(table_name, columns, form_slug):
    """Build a FHIR R5 DetectedIssue resource from the grading_fired_rule table."""
    issue_id = get_uuid(table_name)
    patient_id = get_uuid("patient")

    resource = {
        "resourceType": "DetectedIssue",
        "id": issue_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/DetectedIssue"
            ],
            "lastUpdated": TIMESTAMP
        },
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": f"urn:medical-forms:{form_slug}",
                        "code": "grading-fired-rule",
                        "display": "Grading Fired Rule"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": f"urn:medical-forms:{form_slug}:rules",
                    "code": "RULE-001",
                    "display": "Example grading rule"
                }
            ]
        },
        "severity": "moderate",
        "subject": {
            "reference": f"Patient/{patient_id}"
        },
        "identifiedDateTime": TIMESTAMP,
        "detail": "Example grading rule that evaluated to true during assessment scoring."
    }

    # Add evidence from columns
    evidence = []
    skip_cols = {'id', 'grading_result_id', 'created_at', 'updated_at'}
    for col in columns:
        if col['name'] in skip_cols:
            continue
        if col['name'].endswith('_id'):
            continue
        fhir_type = determine_fhir_type(col['name'], col['type'], col['check_values'])
        value = guess_fhir_value(col['name'], col['type'], col['check_values'], fhir_type)
        if col['name'] == 'rule_id':
            resource["code"]["coding"][0]["code"] = str(value)
        elif col['name'] == 'description':
            resource["detail"] = str(value)
        elif col['name'] == 'severity_level':
            resource["severity"] = str(value)
        elif col['name'] == 'category':
            resource["category"][0]["coding"][0]["display"] = str(value)

    return resource


def build_additional_flag_resource(table_name, columns, form_slug):
    """Build a FHIR R5 DetectedIssue resource from the grading_additional_flag table."""
    flag_id = get_uuid(table_name)
    patient_id = get_uuid("patient")

    resource = {
        "resourceType": "DetectedIssue",
        "id": flag_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/DetectedIssue"
            ],
            "lastUpdated": TIMESTAMP
        },
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": f"urn:medical-forms:{form_slug}",
                        "code": "grading-additional-flag",
                        "display": "Additional Safety Flag"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": f"urn:medical-forms:{form_slug}:flags",
                    "code": "FLAG-001",
                    "display": "Safety flag"
                }
            ]
        },
        "severity": "moderate",
        "subject": {
            "reference": f"Patient/{patient_id}"
        },
        "identifiedDateTime": TIMESTAMP,
        "detail": "Clinical flag detected."
    }

    # Map columns
    skip_cols = {'id', 'grading_result_id', 'created_at', 'updated_at'}
    for col in columns:
        if col['name'] in skip_cols or col['name'].endswith('_id'):
            continue
        fhir_type = determine_fhir_type(col['name'], col['type'], col['check_values'])
        value = guess_fhir_value(col['name'], col['type'], col['check_values'], fhir_type)
        if col['name'] == 'flag_id':
            resource["code"]["coding"][0]["code"] = str(value)
        elif col['name'] == 'message':
            resource["detail"] = str(value)
        elif col['name'] == 'priority':
            severity_map = {'high': 'high', 'medium': 'moderate', 'low': 'low'}
            resource["severity"] = severity_map.get(str(value), 'moderate')
        elif col['name'] == 'category':
            resource["category"][0]["coding"][0]["display"] = str(value)

    return resource


def classify_table(table_name):
    """Classify a SQL table name into a FHIR resource type."""
    if table_name == 'patient':
        return 'patient'
    if table_name == 'assessment':
        return 'encounter'
    if table_name == 'grading_result':
        return 'clinical_impression'
    if table_name == 'grading_fired_rule':
        return 'fired_rule'
    if table_name == 'grading_additional_flag':
        return 'additional_flag'
    return 'observation'


def build_fhir_resource(table_name, columns, form_slug):
    """Build the appropriate FHIR resource for a given table."""
    classification = classify_table(table_name)

    if classification == 'patient':
        return build_patient_resource(table_name, columns)
    elif classification == 'encounter':
        return build_encounter_resource(table_name, columns, form_slug)
    elif classification == 'clinical_impression':
        return build_clinical_impression_resource(table_name, columns, form_slug)
    elif classification == 'fired_rule':
        return build_fired_rule_resource(table_name, columns, form_slug)
    elif classification == 'additional_flag':
        return build_additional_flag_resource(table_name, columns, form_slug)
    else:
        return build_observation_resource(table_name, columns, form_slug)


def process_form(form_dir):
    """Process a single form's SQL migrations and generate FHIR R5 representations."""
    global uuid_counter
    uuid_counter = 0
    table_uuid_map.clear()

    sql_dir = form_dir / "sql-migrations"
    if not sql_dir.is_dir():
        return 0

    fhir_dir = form_dir / "fhir-r5"
    form_slug = form_dir.name

    # Only process numbered migration files; skip the combined schema.sql
    # produced by bin/generate-sql-combined.py.
    sql_files = sorted(f for f in sql_dir.glob("*.sql") if f.name[:1].isdigit())
    if not sql_files:
        return 0

    all_sql = ""
    for sf in sql_files:
        all_sql += sf.read_text(encoding="utf-8") + "\n"

    all_tables = parse_create_table(all_sql)
    if not all_tables:
        return 0

    # Fold every `assessment_<section>` child into the `assessment` parent
    # so the form emits one assessment.json instead of one-per-section.
    all_tables = merge_assessment_tables(all_tables)
    expected_files = {f"{t[0]}.json" for t in all_tables}

    # Pre-assign UUIDs
    for table_name, _ in all_tables:
        get_uuid(table_name)

    fhir_dir.mkdir(exist_ok=True)

    count = 0
    for table_name, columns in all_tables:
        resource = build_fhir_resource(table_name, columns, form_slug)
        output_path = fhir_dir / f"{table_name}.json"
        output_path.write_text(
            json.dumps(resource, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8"
        )
        count += 1

    # Remove stale per-section assessment_*.json files that this run no
    # longer produces (they were generated by an older version that did
    # not merge assessments).
    for f in fhir_dir.glob("assessment_*.json"):
        if f.name not in expected_files:
            f.unlink()

    return count


def main():
    total_forms = 0
    total_files = 0

    form_dirs = sorted([
        d for d in FORMS_DIR.iterdir()
        if d.is_dir() and (d / "sql-migrations").is_dir()
    ])

    for form_dir in form_dirs:
        count = process_form(form_dir)
        if count > 0:
            total_forms += 1
            total_files += count
            print(f"  {form_dir.name}: {count} FHIR R5 resources")

    print(f"\nTotal: {total_forms} forms, {total_files} FHIR R5 JSON files generated")


if __name__ == "__main__":
    main()
