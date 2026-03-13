# Full-stack with Rust axum Loco HTMX Alpine.js

Server-rendered Rust web application using Loco framework with Tera templates, HTMX JavaScript for Apine.js JavaScript for interactivity.

Slug: full-stack-with-rust-axum-loco-tera-htmx-alpine

## Technology Stack

| Component                                                                               | Version          | Description                                      |
| --------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------ |
| [Rust](https://rust-lang.org/)                                                          | 1.9 Edition 2024 | Programming language edition 2024                |
| [axum](https://crates.io/crates/axum)                                                   | 0.8              | Web application framework                        |
| [Loco](https://loco.rs/) 1                                                              | 0.16             | Web application framework                        |
| [Tera](https://keats.github.io/tera/)                                                   | 1.20             | Template engine                                  |
| [SeaORM](https://www.sea-ql.org/SeaORM/)                                                | 1.1              | Object relational mapper                         |
| [PostgreSQL](https://www.postgresql.org/)                                               | 18.3             | Database server                                  |
| [Assertables](https://crates.io/crates/assertables)                                     | 9.8              | Rust assert testing                              |
| [Liquibase SQL](https://docs.liquibase.com/secure/reference-guide-5-1/change-types/sql) | 5.1              | Database SQL migrations                          |
| uuid                                                                                    | 1.6.x            | UUIDv4 primary keys                              |
| serde                                                                                   | 1.x              | Serialization/deserialization                    |
| [HTMX](https://htmx.org/)                                                               | 2.0.8            | AJAX navigation via hx-boost, live filtering     |
| [Alpine.js](http://alpinejs.dev/)                                                       | 3.14.8           | Client-side conditional fields and dynamic lists |

## HTML tags

HTML load HTMX JavaScript:

```HTML
<script
    defer
    src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js">
</script>
```

HTML load Alpine.js JavaScript:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
></script>
```

## Commands

```bash
cargo loco start              # Start development server (port 5150)
cargo build                   # Development build
cargo build --release         # Production build
cargo test                    # Run all tests (12 engine tests)
cargo clippy                  # Lint checks
```

### Configuration

Environment variables for production:

- `PORT` - Server port
- `HOST` - Server host URL
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Allowed CORS origin

### Testing

- Run with `cargo test`
