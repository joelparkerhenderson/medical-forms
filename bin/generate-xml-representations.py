#!/usr/bin/env python3
"""Generate XML and DTD representations from SQL migration files.

For each form's sql-migrations/ directory, parses CREATE TABLE statements
and generates corresponding .xml and .dtd files in xml-representations/.
"""

import os
import re
import sys
from pathlib import Path

FORMS_DIR = Path(__file__).resolve().parent.parent / "forms"

# Standard UUID patterns for example data
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

TIMESTAMP = "2026-04-09T10:00:00Z"

# Map table names to UUID indices for consistent FK references
table_uuid_map = {}
uuid_counter = 0


def get_uuid(table_name):
    """Get a consistent UUID for a table name."""
    global uuid_counter
    if table_name not in table_uuid_map:
        table_uuid_map[table_name] = UUIDS[uuid_counter % len(UUIDS)]
        uuid_counter += 1
    return table_uuid_map[table_name]


def parse_check_values(check_str):
    """Extract allowed values from a CHECK constraint."""
    match = re.findall(r"'([^']*)'", check_str)
    return match


def guess_example_value(col_name, col_type, check_values, col_def, all_tables):
    """Generate a plausible example value for an XML element."""
    col_type_upper = col_type.upper()
    col_name_lower = col_name.lower()

    # ID fields
    if col_name_lower == "id":
        return None  # handled separately
    if col_name_lower.endswith("_id"):
        # FK reference - find the referenced table
        ref_table = col_name_lower.replace("_id", "")
        if ref_table in table_uuid_map:
            return table_uuid_map[ref_table]
        return UUIDS[1]  # default FK

    # CHECK constraint values - pick the first non-empty value
    if check_values:
        non_empty = [v for v in check_values if v]
        if non_empty:
            return non_empty[0]
        return ""

    # Timestamps
    if "TIMESTAMPTZ" in col_type_upper or "TIMESTAMP" in col_type_upper:
        return TIMESTAMP
    if col_name_lower in ("created_at", "updated_at"):
        return TIMESTAMP

    # Date
    if col_name_lower == "date_of_birth":
        return "1965-06-15"
    if "DATE" in col_type_upper or "date" in col_name_lower:
        return "2026-01-15"

    # Boolean-like
    if "BOOLEAN" in col_type_upper:
        return "true"

    # Numeric types
    if "INTEGER" in col_type_upper or "INT" in col_type_upper:
        if "score" in col_name_lower:
            return "5"
        if "sort_order" in col_name_lower:
            return "0"
        if "age" in col_name_lower:
            return "45"
        if "number" in col_name_lower or "count" in col_name_lower or "episodes" in col_name_lower:
            return "2"
        if "year" in col_name_lower:
            return "2026"
        return "1"
    if "NUMERIC" in col_type_upper or "DECIMAL" in col_type_upper or "REAL" in col_type_upper or "FLOAT" in col_type_upper:
        if "weight" in col_name_lower:
            return "70.0"
        if "height" in col_name_lower:
            return "170.0"
        if "bmi" in col_name_lower:
            return "24.2"
        if "score" in col_name_lower:
            return "5.0"
        if "percentage" in col_name_lower or "percent" in col_name_lower:
            return "50.0"
        if "dose" in col_name_lower:
            return "10.0"
        if "rate" in col_name_lower:
            return "72.0"
        if "pressure" in col_name_lower:
            return "120.0"
        if "level" in col_name_lower:
            return "5.0"
        if "ratio" in col_name_lower:
            return "1.5"
        if "value" in col_name_lower or "result" in col_name_lower:
            return "5.0"
        return "0.0"

    # Text/VARCHAR fields
    if col_name_lower == "first_name":
        return "Jane"
    if col_name_lower == "last_name":
        return "Doe"
    if col_name_lower == "nhs_number":
        return "9434765919"
    if col_name_lower == "sex" or col_name_lower == "gender":
        return "female"
    if col_name_lower == "email":
        return "jane.doe@example.com"
    if col_name_lower == "phone" or col_name_lower == "telephone":
        return "07700900000"
    if col_name_lower == "address":
        return "123 Example Street"
    if col_name_lower == "postcode":
        return "SW1A 1AA"

    # Name-like fields
    if "name" in col_name_lower:
        return "Example"

    # Details/notes/description text
    if any(kw in col_name_lower for kw in ("details", "notes", "description", "comment", "remarks", "text", "summary", "explanation", "reason", "narrative", "history", "plan", "recommendation", "instruction", "finding", "observation", "impression", "conclusion")):
        return "Example text."

    # Specific medical fields
    if "medication" in col_name_lower or "drug" in col_name_lower:
        return "Paracetamol"
    if "dose" in col_name_lower or "dosage" in col_name_lower:
        return "500mg"
    if "frequency" in col_name_lower:
        return "twice daily"
    if "route" in col_name_lower:
        return "oral"
    if "allergen" in col_name_lower:
        return "Peanuts"
    if "reaction" in col_name_lower:
        return "Urticaria"
    if "symptom" in col_name_lower:
        return "Fatigue"
    if "diagnosis" in col_name_lower:
        return "Under investigation"
    if "procedure" in col_name_lower or "surgery" in col_name_lower:
        return "Example procedure"
    if "treatment" in col_name_lower or "therapy" in col_name_lower:
        return "Example treatment"
    if "result" in col_name_lower:
        return "Normal"
    if "type" in col_name_lower:
        return "standard"
    if "category" in col_name_lower:
        return "General"
    if "status" in col_name_lower:
        return "active"
    if "unit" in col_name_lower:
        return "mg/dL"
    if "site" in col_name_lower or "location" in col_name_lower:
        return "Example location"
    if "provider" in col_name_lower or "clinician" in col_name_lower or "doctor" in col_name_lower or "physician" in col_name_lower:
        return "Dr Smith"
    if "hospital" in col_name_lower or "facility" in col_name_lower or "clinic" in col_name_lower:
        return "Example Hospital"
    if "code" in col_name_lower:
        return "ABC123"
    if "title" in col_name_lower:
        return "Example Title"
    if "occupation" in col_name_lower:
        return "Teacher"
    if "ethnicity" in col_name_lower:
        return "White British"
    if "language" in col_name_lower:
        return "English"
    if "relationship" in col_name_lower:
        return "Spouse"
    if "contact" in col_name_lower:
        return "07700900001"

    # Rule/flag IDs
    if "rule_id" in col_name_lower:
        return "RULE-001"
    if "flag_id" in col_name_lower:
        return "FLAG-001"

    # Generic text fallback
    if "TEXT" in col_type_upper or "VARCHAR" in col_type_upper or "CHAR" in col_type_upper:
        return ""

    return ""


def parse_create_table(sql_text):
    """Parse CREATE TABLE statements from SQL text. Returns list of (table_name, columns)."""
    tables = []

    # Match CREATE TABLE statements
    pattern = r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\((.*?)\);'
    matches = re.findall(pattern, sql_text, re.DOTALL | re.IGNORECASE)

    for table_name, body in matches:
        columns = []
        # Strip SQL line comments to avoid commas in comments causing bad splits
        body = re.sub(r'--[^\n]*', '', body)
        # Split by top-level commas (not inside parentheses)
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

            # Skip constraints that aren't columns
            if re.match(r'^(CREATE\b|CONSTRAINT\b|PRIMARY\s+KEY\b|UNIQUE\b|FOREIGN\s+KEY\b|CHECK\b|INDEX\b|EXCLUDE\b)', col_def, re.IGNORECASE):
                continue

            # Parse column: name type [constraints...]
            col_match = re.match(r'^(\w+)\s+([\w(),.]+(?:\s*\([^)]*\))?)', col_def, re.IGNORECASE)
            if col_match:
                col_name = col_match.group(1)
                col_type = col_match.group(2)

                # Skip if it looks like a keyword not a column
                if col_name.upper() in ('PRIMARY', 'UNIQUE', 'FOREIGN', 'CHECK', 'CONSTRAINT', 'INDEX', 'EXCLUDE', 'CREATE'):
                    continue

                # Extract CHECK values
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


def generate_dtd(table_name, columns):
    """Generate DTD content for a table (external DTD format)."""
    col_names = [c['name'] for c in columns]
    elements = ",".join(col_names)

    lines = [
        f"<!ELEMENT {table_name} ({elements})>",
    ]
    for col in columns:
        lines.append(f"<!ELEMENT {col['name']} (#PCDATA)>")

    return "\n".join(lines) + "\n"


def generate_xml(table_name, columns, all_tables):
    """Generate example XML content for a table."""
    # Assign UUID for this table
    table_uuid = get_uuid(table_name)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<!DOCTYPE {table_name} SYSTEM "{table_name}.dtd">',
        f"<{table_name}>",
    ]

    for col in columns:
        name = col['name']
        if name == 'id':
            value = table_uuid
        else:
            value = guess_example_value(
                name, col['type'], col['check_values'], col['definition'], all_tables
            )
            if value is None:
                value = table_uuid

        lines.append(f"<{name}>{value}</{name}>")

    lines.append(f"</{table_name}>")

    return "\n".join(lines) + "\n"


def process_form(form_dir):
    """Process a single form's SQL migrations and generate XML representations."""
    global uuid_counter
    uuid_counter = 0
    table_uuid_map.clear()

    sql_dir = form_dir / "sql-migrations"
    if not sql_dir.is_dir():
        return 0

    xml_dir = form_dir / "xml-representations"

    # Read all SQL files in order
    # Only process numbered migration files; skip the combined schema.sql
    # produced by bin/generate-sql-combined.py.
    sql_files = sorted(f for f in sql_dir.glob("*.sql") if f.name[:1].isdigit())
    if not sql_files:
        return 0

    all_sql = ""
    for sf in sql_files:
        all_sql += sf.read_text(encoding="utf-8") + "\n"

    # Parse all tables
    all_tables = parse_create_table(all_sql)
    if not all_tables:
        return 0

    # Pre-assign UUIDs for all tables so FK references work
    for table_name, _ in all_tables:
        get_uuid(table_name)

    # Create output directory
    xml_dir.mkdir(exist_ok=True)

    count = 0
    for table_name, columns in all_tables:
        dtd_content = generate_dtd(table_name, columns)
        xml_content = generate_xml(table_name, columns, all_tables)

        dtd_path = xml_dir / f"{table_name}.dtd"
        xml_path = xml_dir / f"{table_name}.xml"

        dtd_path.write_text(dtd_content, encoding="utf-8")
        xml_path.write_text(xml_content, encoding="utf-8")
        count += 1

    return count


def main():
    total_forms = 0
    total_files = 0

    # Get all form directories
    form_dirs = sorted([
        d for d in FORMS_DIR.iterdir()
        if d.is_dir() and (d / "sql-migrations").is_dir()
    ])

    for form_dir in form_dirs:
        count = process_form(form_dir)
        if count > 0:
            total_forms += 1
            total_files += count * 2  # xml + dtd per table
            print(f"  {form_dir.name}: {count} tables -> {count * 2} files")

    print(f"\nTotal: {total_forms} forms, {total_files} files generated")


if __name__ == "__main__":
    main()
