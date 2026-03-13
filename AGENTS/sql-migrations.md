# SQL migrations

PostgreSQL 18 with Liquibase SQL format for version-controlled database migrations.

Slug: sql-migrations

## Migration file naming

```
sql-migrations/
  00_extensions.sql          # Required PostgreSQL extensions (pgcrypto, etc.)
  01_create_<table>.sql      # Table creation with columns and constraints
  02_create_<table>.sql      # Additional tables
  ...
```

## Schema conventions

- UUID primary keys via `gen_random_uuid()` (pgcrypto)
- `created_at` and `updated_at` timestamps on all tables
- `updated_at` maintained by `set_updated_at()` trigger function
- Foreign keys cascade on delete
- CHECK constraints for enum-style values
- Comprehensive comments on all tables and columns
- Snake_case column names matching Rust/SeaORM entity fields

## Liquibase SQL format

Each migration file uses Liquibase SQL changelog format:

```sql
--liquibase formatted sql

--changeset author:1
CREATE TABLE ...
--rollback DROP TABLE ...
```

## Required extensions

The `00_extensions.sql` file enables required PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## Trigger pattern

Standard `updated_at` trigger applied to every table:

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
