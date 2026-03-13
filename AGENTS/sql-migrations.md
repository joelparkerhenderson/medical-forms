# SQL migrations

PostgreSQL 18

Comprehensive comments.

## Schema conventions

- UUID primary keys via `gen_random_uuid()` (pgcrypto)
- `created_at` and `updated_at` timestamps on all tables
- `updated_at` maintained by `set_updated_at()` trigger
- Foreign keys cascade on delete
- CHECK constraints for enum values
- Comments on all tables and columns
