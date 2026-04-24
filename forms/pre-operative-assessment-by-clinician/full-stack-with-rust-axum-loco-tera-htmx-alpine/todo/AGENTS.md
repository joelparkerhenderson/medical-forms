# Rust Full-Stack — Agent Instructions

## Stack

- Rust edition 2024
- Loco 0.16 framework (axum 0.8)
- SeaORM 1.1 with PostgreSQL
- Tera + HTMX 2.0.8 + Alpine.js 3.14.8

## Conventions

- `#[serde(rename_all = "camelCase")]` on every struct shared with the
  front-end, so that fields match the TypeScript engine.
- Composite grader ported to Rust in `src/grader.rs` (deferred); rule IDs
  must match the TypeScript engine exactly for audit parity.
- Templates in `templates/` use `base.html.tera` which loads HTMX and
  Alpine from jsdelivr CDN and sets `<body hx-boost="true">`.

## Schema

The PostgreSQL schema is authored in `../sql-migrations/` using Liquibase.
SeaORM entities mirror the tables 1:1 with snake_case field names, but
serialize as camelCase.

## Running

```sh
cargo run
```
