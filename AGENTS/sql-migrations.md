# SQL migrations

PostgreSQL 18 with Liquibase SQL format for version-controlled database
migrations. Each form owns its own schema under `forms/<slug>/sql-migrations/`.

Slug: sql-migrations

- Search pattern: `forms/*/sql-migrations/*.sql`

## Migration file naming

Two-digit, zero-padded sequence numbers with hyphen-separated descriptions:

```
sql-migrations/
  00-extensions.sql          # Required PostgreSQL extensions (pgcrypto, etc.)
  01-patient.sql             # Shared patient table
  02-assessment.sql          # Assessment header / encounter
  03-assessment-<section>.sql # One table per questionnaire section
  ...
  NN-grading-result.sql      # Computed scoring / grading result
  NN-grading-fired-rule.sql  # Rules that fired during grading
  NN-grading-additional-flag.sql # Safety-critical flags
```

Each form must have `00-extensions.sql` as the first migration so that
`pgcrypto` (for `gen_random_uuid()`) is available before any table is created.
`bin/test-form` asserts that `00-extensions.sql` exists.

## Schema conventions

- UUIDv4 primary keys via `gen_random_uuid()` (from `pgcrypto`)
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, maintained by the `set_updated_at()` trigger
- Foreign keys cascade on delete (`ON DELETE CASCADE`) within a form's own schema; foreign keys to shared tables use `ON DELETE RESTRICT`
- `CHECK` constraints for enum-style values
- Comprehensive `COMMENT ON TABLE` and `COMMENT ON COLUMN` for every table and column
- snake_case column names, matching the Rust/SeaORM entity fields
- Strings use `TEXT`; avoid `VARCHAR(n)` unless a hard length constraint is enforced
- Monetary values use `NUMERIC`, never `FLOAT`

## Liquibase SQL format

Each migration file uses Liquibase SQL changelog format with a `--changeset`
line and a matching `--rollback` for every change:

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE example (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
--rollback DROP TABLE example;
```

## Required extensions

The `00_extensions.sql` file enables every extension the form's schema depends
on. The default minimum is `pgcrypto`:

```sql
--liquibase formatted sql

--changeset author:1
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--rollback DROP EXTENSION IF EXISTS "pgcrypto";
```

## Trigger pattern

Define the trigger function once in an early migration and apply a trigger
per table:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON <table_name>
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
```


## Comments

Parse every CREATE TABLE and its columns.

Scan the same file for existing COMMENT ON TABLE <name> and COMMENT ON COLUMN <name>.<col> entries.
 
Appends only the missing comments at end of file — hand-crafted comments (e.g. framingham's clinically-accurate patient comments) are preserved exactly.

Comment text comes from a heuristic, ordered by specificity:

1. Known columns: id → "Primary key UUID, auto-generated.", created_at / updated_at / deleted_at / status → stock phrasing.
2. FK columns: "Foreign key to the <target> table."
3. CHECK IN (…) columns: humanized name + "One of: v1, v2, …."
4. Fallback: humanized snake_case (with ~50 acronyms like NHS, GCS, ECG, COPD, SpO2 preserved in caps).

## Verify

Syntax-check every form's SQL migrations (dry-run against a PostgreSQL
instance):

```sh
for f in forms/*/sql-migrations/*.sql; do
  psql -f "$f" --set ON_ERROR_STOP=1
done
```

For a per-form apply-and-rollback smoke test (requires a fresh database):

```sh
for d in forms/*/sql-migrations; do
  createdb test_migrations_$$
  for f in "$d"/*.sql; do
    psql -d test_migrations_$$ -f "$f" --set ON_ERROR_STOP=1 || echo "FAIL: $f"
  done
  dropdb test_migrations_$$
done
```
