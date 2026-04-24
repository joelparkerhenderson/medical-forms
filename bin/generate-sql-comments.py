#!/usr/bin/env python3
"""Add missing COMMENT ON TABLE and COMMENT ON COLUMN statements to every
numbered SQL migration file.

For each form's sql-migrations/NN-*.sql file, this generator:

- Parses every CREATE TABLE statement and its column definitions.
- Detects existing `COMMENT ON TABLE <name>` and
  `COMMENT ON COLUMN <table>.<column>` entries already present anywhere in
  the same file.
- Appends a `COMMENT ON TABLE` for every table that lacks one, and a
  `COMMENT ON COLUMN` for every column that lacks one, to the end of the
  file.
- Leaves existing comments untouched; re-running is idempotent.

Comment text is produced by a simple heuristic (well-known columns like
`id`, `created_at`, `updated_at`, FK columns, CHECK-constrained enum
columns) with a humanized column name as a fallback. The intent is
correctness-by-presence, not clinical precision; domain experts can later
edit individual comments where the heuristic is too generic.
"""

import re
import sys
from pathlib import Path

TOP = Path(__file__).resolve().parent.parent
FORMS_DIR = TOP / "forms"

# Preserve these tokens verbatim when humanizing column names; everything
# else is lowercase.
ACRONYMS = {
    "id", "nhs", "gp", "url", "uri", "bmi", "bp", "hr", "rr", "ecg", "echo",
    "gcs", "ihd", "chf", "mi", "icd", "ef", "copd", "cxr", "pft", "fev1",
    "fvc", "tsh", "ng", "iv", "im", "sc", "pr", "rsi", "cpet", "vo2",
    "asa", "rcri", "bmi", "uti", "dvt", "vte", "mets", "dasi", "ecog",
    "cfs", "tia", "covid", "icu", "hdu", "api", "pdf", "dicom", "fhir",
    "sms", "smtp", "xml", "json", "uuid", "hba1c", "ldl", "hdl", "alt",
    "ast", "alp", "mcv", "aptt", "inr", "ckd", "cns", "pns", "eeg", "emg",
    "jvp", "rom", "stopbang", "spo2", "faa", "who",
}

# Columns we always comment with a known boilerplate string.
KNOWN_COLUMNS = {
    "id": "Primary key UUID, auto-generated.",
    "created_at": "Timestamp when this row was created.",
    "updated_at": "Timestamp when this row was updated.",
    "deleted_at": "Soft-delete timestamp; NULL when the row is live.",
    "status": "Lifecycle status of this row.",
}


def humanize(name: str) -> str:
    """Turn snake_case into a short human phrase, preserving known acronyms."""
    parts = name.split("_")
    out = []
    for i, p in enumerate(parts):
        if p.lower() in ACRONYMS:
            out.append(p.upper())
        elif i == 0:
            out.append(p.capitalize())
        else:
            out.append(p.lower())
    return " ".join(out)


def sql_escape(s: str) -> str:
    """Escape single quotes for a SQL string literal."""
    return s.replace("'", "''")


# --- SQL parsing --------------------------------------------------------------

def split_top_level_commas(body: str):
    body = re.sub(r"--[^\n]*", "", body)
    parts, depth, cur = [], 0, ""
    for ch in body:
        if ch == "(":
            depth += 1
            cur += ch
        elif ch == ")":
            depth -= 1
            cur += ch
        elif ch == "," and depth == 0:
            parts.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur.strip())
    return parts


def parse_create_tables(sql_text: str):
    """Return [(table_name, [column_dict])] in source order."""
    tables = []
    for m in re.finditer(
        r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\((.*?)\)\s*;",
        sql_text,
        re.DOTALL | re.IGNORECASE,
    ):
        name = m.group(1)
        body = m.group(2)
        cols = []
        for piece in split_top_level_commas(body):
            if not piece:
                continue
            head = piece.split(None, 1)[0].upper()
            if head in (
                "PRIMARY", "UNIQUE", "FOREIGN", "CHECK", "CONSTRAINT",
                "INDEX", "EXCLUDE", "CREATE",
            ):
                continue
            col_match = re.match(
                r"^(\w+)\s+([A-Za-z]+(?:\s*\([^)]*\))?)",
                piece,
            )
            if not col_match:
                continue
            col_name = col_match.group(1)
            col_type = col_match.group(2).strip()

            fk_target = None
            fk_match = re.search(
                r"REFERENCES\s+(\w+)\s*\(\s*\w+\s*\)",
                piece,
                re.IGNORECASE,
            )
            if fk_match:
                fk_target = fk_match.group(1)

            check_values = []
            check_match = re.search(
                r"CHECK\s*\([^)]*IN\s*\(([^)]+)\)",
                piece,
                re.IGNORECASE,
            )
            if check_match:
                check_values = re.findall(r"'([^']*)'", check_match.group(1))

            cols.append({
                "name": col_name,
                "type": col_type,
                "fk_target": fk_target,
                "check_values": check_values,
            })
        tables.append((name, cols))
    return tables


def find_existing_comments(sql_text: str):
    tables = set()
    cols = set()
    for m in re.finditer(
        r"COMMENT\s+ON\s+TABLE\s+(\w+)",
        sql_text,
        re.IGNORECASE,
    ):
        tables.add(m.group(1).lower())
    for m in re.finditer(
        r"COMMENT\s+ON\s+COLUMN\s+(\w+)\.(\w+)",
        sql_text,
        re.IGNORECASE,
    ):
        cols.add((m.group(1).lower(), m.group(2).lower()))
    return tables, cols


# --- Comment generation -------------------------------------------------------

def comment_for_table(name: str) -> str:
    return humanize(name) + "."


def comment_for_column(col) -> str:
    name = col["name"]
    if name in KNOWN_COLUMNS:
        return KNOWN_COLUMNS[name]
    if col["fk_target"]:
        return f"Foreign key to the {col['fk_target']} table."
    if col["check_values"]:
        non_empty = [v for v in col["check_values"] if v]
        if non_empty:
            # Show up to 8 values so the comment stays short.
            shown = non_empty[:8]
            suffix = ", …" if len(non_empty) > 8 else ""
            values = ", ".join(shown) + suffix
            return f"{humanize(name)}. One of: {values}."
    # Humanized fallback.
    return humanize(name) + "."


# --- File processing ----------------------------------------------------------

def render_missing_comments(tables, existing_tables, existing_cols):
    out_lines = []
    for table_name, cols in tables:
        if table_name.lower() not in existing_tables:
            out_lines.append(
                f"COMMENT ON TABLE {table_name} IS\n"
                f"    '{sql_escape(comment_for_table(table_name))}';"
            )
        for col in cols:
            key = (table_name.lower(), col["name"].lower())
            if key in existing_cols:
                continue
            out_lines.append(
                f"COMMENT ON COLUMN {table_name}.{col['name']} IS\n"
                f"    '{sql_escape(comment_for_column(col))}';"
            )
    return out_lines


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    tables = parse_create_tables(text)
    if not tables:
        return 0

    existing_tables, existing_cols = find_existing_comments(text)
    new_lines = render_missing_comments(tables, existing_tables, existing_cols)
    if not new_lines:
        return 0

    appended = "\n".join(new_lines)
    new_text = text.rstrip() + "\n\n" + appended + "\n"
    path.write_text(new_text, encoding="utf-8")
    return len(new_lines)


def numbered_sql_files(sql_dir: Path):
    return sorted(f for f in sql_dir.glob("*.sql") if f.name[:1].isdigit())


def main():
    total_forms = 0
    total_files = 0
    total_stmts = 0
    form_dirs = sorted(d for d in FORMS_DIR.iterdir() if d.is_dir())
    for form_dir in form_dirs:
        sql_dir = form_dir / "sql-migrations"
        if not sql_dir.is_dir():
            continue
        form_stmts = 0
        form_files_touched = 0
        for f in numbered_sql_files(sql_dir):
            added = process_file(f)
            if added:
                form_stmts += added
                form_files_touched += 1
        if form_stmts:
            print(
                f"  {form_dir.name}: +{form_stmts} COMMENT statements "
                f"across {form_files_touched} files"
            )
            total_forms += 1
            total_files += form_files_touched
            total_stmts += form_stmts

    print(
        f"\nTotal: {total_forms} forms touched, {total_files} files updated, "
        f"{total_stmts} COMMENT statements added"
    )


if __name__ == "__main__":
    main()
