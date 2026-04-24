#!/usr/bin/env python3
"""Full forward migration of every form's sql-migrations/ to the canonical
filename convention used by bin/test-form.

Canonical filename layout per form:

    00_extensions.sql                        -- CREATE EXTENSION pgcrypto
    01_create_function_set_updated_at.sql    -- trigger function
    02_create_table_patient.sql              -- canonical patient
    03_create_table_clinician.sql            -- canonical clinician
    04_create_table_<slug>.sql               -- per-form main assessment
    05_create_table_grading_result.sql
    06_create_table_grading_fired_rule.sql
    07_create_table_grading_additional_flag.sql
    (and any additional CREATE TABLE statements renumbered sequentially)

Actions per form:

- Overwrite the four canonical files with corrected content (the existing
  copies distributed across all 114 forms contain known syntax errors:
  the patient file is missing a comma, has a duplicate UPDATE comment, and
  a COMMENT refers to a renamed column; the clinician file has a trailing
  comma before `)` and references a non-existent `clinician_role` in its
  CHECK constraint).
- Delete the legacy `01_patient.sql` (conflicts numerically and
  semantically with the canonical `02_create_table_patient.sql`).
- Rename every remaining legacy `NN_<name>.sql` file that has a
  `CREATE TABLE` inside to `MM_create_table_<table>.sql`, where MM is
  sequential starting at 04, preserving the file order.
- Add the `.sql` extension to any `NN_create_table_*` files that are
  missing it.
- If `04_main.sql` exists (a consolidated copy of an older schema-flat.sql
  containing duplicated patient + assessment + grading blocks), split it
  on its `-- === <filename> === --` section markers, keep only the
  assessment + assessment_<section> blocks as individual per-table files,
  and discard the duplicated extensions / patient / grading blocks. Then
  delete `04_main.sql` and continue with the normal rename pass.

Idempotent. Safe to re-run.
"""

import re
import sys
from pathlib import Path

TOP = Path(__file__).resolve().parent.parent
FORMS_DIR = TOP / "forms"

CANONICAL_FILES = {
    "00_extensions.sql",
    "01_create_function_set_updated_at.sql",
    "02_create_table_patient.sql",
    "03_create_table_clinician.sql",
}


PATIENT_SQL = """-- Patient demographic information.

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    name VARCHAR(255) NOT NULL DEFAULT '',
    birth_date DATE,
    united_kingdom_nhs_number VARCHAR(20) UNIQUE,
    waist_as_cm NUMERIC(5,1),
    height_as_cm NUMERIC(5,1),
    weight_as_kg NUMERIC(5,1),
    body_mass_index NUMERIC(4,1),
    waist_height_ratio NUMERIC(4,1),
    vo2_max NUMERIC(4,1)
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient demographic information.';
COMMENT ON COLUMN patient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN patient.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN patient.deleted_at IS
    'Soft-delete timestamp; NULL when the row is live.';
COMMENT ON COLUMN patient.name IS
    'Patient name.';
COMMENT ON COLUMN patient.birth_date IS
    'Patient date of birth.';
COMMENT ON COLUMN patient.united_kingdom_nhs_number IS
    'Patient UK NHS number, unique per patient.';
COMMENT ON COLUMN patient.waist_as_cm IS
    'Patient waist circumference in cm (for waist-height ratio).';
COMMENT ON COLUMN patient.height_as_cm IS
    'Patient height in cm.';
COMMENT ON COLUMN patient.weight_as_kg IS
    'Patient weight in kg.';
COMMENT ON COLUMN patient.body_mass_index IS
    'Patient body mass index (BMI), kg/m^2.';
COMMENT ON COLUMN patient.waist_height_ratio IS
    'Patient waist-to-height ratio (WHR).';
COMMENT ON COLUMN patient.vo2_max IS
    'Patient VO2 max (cardiorespiratory fitness proxy).';
"""


CLINICIAN_SQL = """-- Clinician information.

CREATE TABLE clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT ''
        CHECK (role IN (
            'anaesthetist', 'surgeon', 'preop-nurse',
            'perioperative-physician', 'geriatrician', 'pharmacist',
            'gp', 'nurse', 'physiotherapist', 'other', ''
        )),
    registration_body TEXT NOT NULL DEFAULT ''
        CHECK (registration_body IN ('GMC', 'NMC', 'HCPC', 'GPhC', 'other', '')),
    registration_number TEXT NOT NULL DEFAULT '',
    united_kingdom_nhs_number CHAR(12) UNIQUE
);

CREATE TRIGGER trg_clinician_updated_at
    BEFORE UPDATE ON clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinician IS
    'Clinician who operated or authored this record.';
COMMENT ON COLUMN clinician.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinician.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN clinician.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN clinician.deleted_at IS
    'Soft-delete timestamp; NULL when the row is live.';
COMMENT ON COLUMN clinician.name IS
    'Clinician name.';
COMMENT ON COLUMN clinician.role IS
    'Clinician role.';
COMMENT ON COLUMN clinician.registration_body IS
    'Professional registration body.';
COMMENT ON COLUMN clinician.registration_number IS
    'Registration number with the regulator.';
COMMENT ON COLUMN clinician.united_kingdom_nhs_number IS
    'Clinician UK NHS number, unique per person.';
"""


def first_create_table(text: str) -> str | None:
    m = re.search(
        r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(",
        text,
        re.IGNORECASE,
    )
    return m.group(1) if m else None


SECTION_HEADER = re.compile(
    r"^-- ={60,}\s*\n-- ([^\n]+?)\s*\n-- ={60,}\s*$",
    re.MULTILINE,
)


def split_main_sql_sections(text: str):
    """Split a 04_main.sql into [(section_filename, section_body)] pairs.

    Sections are delimited by a three-line header:
        -- ====...====
        -- <filename>
        -- ====...====
    """
    sections = []
    positions = [(m.start(), m.end(), m.group(1)) for m in SECTION_HEADER.finditer(text)]
    for i, (_, end, name) in enumerate(positions):
        body_start = end
        body_end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        body = text[body_start:body_end].strip("\n")
        sections.append((name, body))
    return sections


def split_by_create_table(text: str):
    """Split text into per-table blocks. Each block starts with a
    `CREATE TABLE` and continues up to just before the next CREATE TABLE
    (so its TRIGGER and COMMENT statements stay attached). Text before the
    first CREATE TABLE is discarded.
    """
    matches = list(re.finditer(
        r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)",
        text,
        re.IGNORECASE,
    ))
    blocks = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        blocks.append((m.group(1), text[start:end]))
    return blocks


def explode_main_sql(sql_dir: Path):
    """If 04_main.sql exists, split it into per-CREATE-TABLE temp files
    (40_create_table_<name>.sql, …) and delete the original. Duplicated
    patient/extensions/grading blocks are discarded — the canonical +
    legacy files already cover them. The subsequent renumber pass will
    reorder these into the final NN_create_table_<name>.sql sequence.
    """
    main_path = sql_dir / "04_main.sql"
    if not main_path.exists():
        return []

    text = main_path.read_text(encoding="utf-8")
    blocks = split_by_create_table(text)

    new_files = []
    for table, block in blocks:
        if table == "patient":
            continue
        if table in ("grading_result", "grading_fired_rule", "grading_additional_flag"):
            continue
        tmp_index = 40 + len(new_files)
        out = sql_dir / f"{tmp_index:02d}_create_table_{table}.sql"
        out.write_text(block.rstrip() + "\n", encoding="utf-8")
        new_files.append(out)

    main_path.unlink()
    return new_files


def fix_canonical_files(sql_dir: Path):
    (sql_dir / "02_create_table_patient.sql").write_text(PATIENT_SQL, encoding="utf-8")
    (sql_dir / "03_create_table_clinician.sql").write_text(CLINICIAN_SQL, encoding="utf-8")


def legacy_candidates(sql_dir: Path):
    """Return numbered sql-migrations files that are not in the canonical four
    and don't already match the `NN_create_table_*.sql` target convention.

    Also includes files without `.sql` extension that start with
    `NN_create_table_` (so we can add the suffix).
    """
    out = []
    for f in sorted(sql_dir.iterdir()):
        if not f.is_file():
            continue
        name = f.name
        if name in CANONICAL_FILES:
            continue
        if name.startswith("schema"):
            continue
        # File missing .sql extension but matching the target naming pattern.
        if re.match(r"^\d+_create_table_[a-z0-9_]+$", name):
            out.append(f)
            continue
        if not name.endswith(".sql"):
            continue
        if not name[:1].isdigit():
            continue
        if re.match(r"^\d+_create_table_[a-z0-9_]+\.sql$", name):
            # Already in canonical per-table form, skip.
            continue
        out.append(f)
    return out


def target_name_for(path: Path, index: int) -> str | None:
    text = path.read_text(encoding="utf-8")
    table = first_create_table(text)
    if not table:
        # No CREATE TABLE → keep original name, but add .sql suffix if missing.
        if not path.name.endswith(".sql"):
            return path.name + ".sql"
        return None
    return f"{index:02d}_create_table_{table}.sql"


def looks_broken_patient(block: str) -> bool:
    """Detect the broken canonical patient template distributed to every
    form: missing comma between `united_kingdom_nhs_number` and
    `waist_as_cm`, and duplicate COMMENTs.
    """
    return (
        "united_kingdom_nhs_number VARCHAR(20) UNIQUE\n    waist_as_cm" in block
        or block.count("COMMENT ON COLUMN patient.updated_at") >= 2
        or block.count("COMMENT ON COLUMN patient.united_kingdom_nhs_number") >= 2
    )


def looks_broken_clinician(block: str) -> bool:
    """Detect the broken canonical clinician template: trailing comma before
    `);` and a CHECK referring to `clinician_role` instead of `role`.
    """
    return (
        "CHECK (clinician_role IN" in block
        or re.search(r",\s*\n\s*\)\s*;", block) is not None
    )


def process_form(form_dir: Path):
    if form_dir.name.startswith("."):
        return "skip-hidden"
    sql_dir = form_dir / "sql-migrations"
    if not sql_dir.is_dir():
        return "skip"

    # Split 04_main.sql first so its blocks become eligible for renumbering.
    exploded = explode_main_sql(sql_dir)

    # Delete legacy 01_patient.sql (has legacy schema; we rebuild patient
    # from any `CREATE TABLE patient` block found in the form — or from the
    # canonical template if the form does not define its own).
    legacy_01 = sql_dir / "01_patient.sql"
    if legacy_01.exists():
        legacy_01.unlink()

    # Delete derived schema files so they get regenerated after migration.
    for stale in ("schema.sql", "schema-flat.sql", "schema_flat.sql"):
        p = sql_dir / stale
        if p.exists():
            p.unlink()

    # Gather every non-canonical numbered .sql file (positions 02+, since
    # 00 and 01 are extensions/function and are left alone).
    KEEP_AS_IS = {"00_extensions.sql", "01_create_function_set_updated_at.sql"}
    others = [
        f for f in sorted(sql_dir.iterdir())
        if f.is_file()
        and f.name.endswith(".sql")
        and f.name[:1].isdigit()
        and f.name not in KEEP_AS_IS
    ]

    # Parse every file into one block per CREATE TABLE.
    all_blocks = []  # list of (prefix_num, src_name, block_idx, src, table, block)
    for f in others:
        body = f.read_text(encoding="utf-8")
        num_match = re.match(r"^(\d+)", f.name)
        prefix_num = int(num_match.group(1)) if num_match else 9999
        for i, (table, block) in enumerate(split_by_create_table(body)):
            all_blocks.append((prefix_num, f.name, i, f, table, block))

    # Extract the patient + clinician blocks (keep the first of each) and
    # fall back to the canonical templates if the form doesn't define them.
    def pluck(table_name):
        for idx, entry in enumerate(all_blocks):
            if entry[4] == table_name:
                all_blocks.pop(idx)
                return entry[5]
        return None

    patient_block = pluck("patient")
    if patient_block is None or looks_broken_patient(patient_block):
        patient_block = PATIENT_SQL

    clinician_block = pluck("clinician")
    if clinician_block is None or looks_broken_clinician(clinician_block):
        clinician_block = CLINICIAN_SQL

    # Dedupe remaining blocks by table — keep the first occurrence.
    seen = set()
    unique = []
    for entry in all_blocks:
        table = entry[4]
        if table in seen:
            continue
        seen.add(table)
        unique.append(entry)

    # Semantic ordering so FK targets exist before referencing tables.
    def bucket(table):
        if table == "assessment":
            return 0
        if table.startswith("assessment_"):
            return 1
        if table == "grading_result":
            return 3
        if table in ("grading_fired_rule", "grading_additional_flag"):
            return 4
        return 2  # other form-specific tables

    unique.sort(key=lambda t: (bucket(t[4]), t[0], t[1], t[2]))

    # Delete every source file we consumed; then write out the new layout.
    src_paths = {entry[3] for entry in all_blocks + unique}
    # all_blocks was mutated by pluck(); re-derive from the files we read.
    for f in others:
        if f.exists():
            f.unlink()

    # Write canonical patient + clinician at 02 / 03.
    (sql_dir / "02_create_table_patient.sql").write_text(
        patient_block.rstrip() + "\n", encoding="utf-8"
    )
    (sql_dir / "03_create_table_clinician.sql").write_text(
        clinician_block.rstrip() + "\n", encoding="utf-8"
    )

    # Write the rest starting at position 04.
    written = 0
    final_tables = ["patient", "clinician"]
    for i, (_, _, _, _, table, block) in enumerate(unique):
        final_path = sql_dir / f"{(i + 4):02d}_create_table_{table}.sql"
        final_path.write_text(block.rstrip() + "\n", encoding="utf-8")
        written += 1
        final_tables.append(table)

    # Write or refresh sql-migrations/index.md (test-form requires it).
    write_index_md(sql_dir, form_dir.name, final_tables)

    # xml-representations/index.md is also required by test-form; ensure it
    # exists. The file is narrow-purpose, so a short stub is sufficient.
    xml_dir = form_dir / "xml-representations"
    if xml_dir.is_dir():
        xml_index = xml_dir / "index.md"
        if not xml_index.exists() or xml_index.stat().st_size == 0:
            xml_index.write_text(
                f"# {form_dir.name} — XML representations\n\n"
                "One XML file plus its DTD is generated per SQL table by\n"
                "`bin/generate-xml-representations.py`.\n",
                encoding="utf-8",
            )

    return f"ok:{written}-written,{len(exploded)}-exploded"


def write_index_md(sql_dir: Path, form_slug: str, tables: list):
    lines = [
        f"# {form_slug} — sql-migrations",
        "",
        "PostgreSQL migrations for this form. See",
        "`AGENTS/sql-migrations.md` for conventions.",
        "",
        "## Canonical files",
        "",
        "- `00_extensions.sql` — required extensions (pgcrypto).",
        "- `01_create_function_set_updated_at.sql` — trigger function used by every `updated_at` column.",
        "- `02_create_table_patient.sql` — patient table.",
        "- `03_create_table_clinician.sql` — clinician table.",
        "",
        "## Form-specific tables",
        "",
    ]
    for i, t in enumerate(tables):
        if t in ("patient", "clinician"):
            continue
        idx = i + 2  # patient at 02, clinician at 03, others start at 04
        # idx isn't meaningful since we list tables including patient/clinician;
        # just list the table names for reference.
        lines.append(f"- `{t}`")
    lines += [
        "",
        "## Derived artefacts",
        "",
        "- `schema.sql` — every migration concatenated (generated).",
        "",
    ]
    (sql_dir / "index.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    results = {}
    form_dirs = sorted(d for d in FORMS_DIR.iterdir() if d.is_dir())
    for form_dir in form_dirs:
        status = process_form(form_dir)
        results.setdefault(status.split(":")[0], []).append(form_dir.name)
        print(f"  {form_dir.name}: {status}")

    print()
    for k, v in sorted(results.items()):
        print(f"  {k}: {len(v)} forms")


if __name__ == "__main__":
    main()
