# Full-stack with Rust axum Loco HTMX Alpine.js

Ultrathink.

Server-rendered Rust web application using Loco framework with Tera templates, HTMX for dynamic page updates, and Alpine.js for client-side interactivity.

Slug: full-stack-with-rust-axum-loco-tera-htmx-alpine

- Search pattern: "forms/\*/full-stack-with-rust-axum-loco-tera-htmx-alpine"

## Technology stack

| Component                                           | Version            | Purpose                                          |
| --------------------------------------------------- | ------------------ | ------------------------------------------------ |
| [Rust](https://rust-lang.org/)                      | 1.9.x Edition 2024 | Systems programming language                     |
| [axum](https://crates.io/crates/axum)               | 0.8                | Web application framework                        |
| [Loco](https://loco.rs/)                            | 0.16               | Rails-like framework on axum                     |
| [Tera](https://keats.github.io/tera/)               | 1.20               | Template engine                                  |
| [SeaORM](https://www.sea-ql.org/SeaORM/)            | 1.1                | Object relational mapper                         |
| [PostgreSQL](https://www.postgresql.org/)           | 18.3               | Database server                                  |
| [serde](https://serde.rs/)                          | 1.x                | Serialization with `rename_all = "camelCase"`    |
| [uuid](https://crates.io/crates/uuid)               | 1.6                | UUIDv4 primary keys                              |
| [Assertables](https://crates.io/crates/assertables) | 9.8                | Assertion testing macros                         |
| [HTMX](https://htmx.org/)                           | 2.0.8              | AJAX navigation via hx-boost, live filtering     |
| [Alpine.js](https://alpinejs.dev/)                  | 3.14.8             | Client-side conditional fields and dynamic lists |

## HTML script tags

HTMX:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"
></script>
```

Alpine.js:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"
></script>
```

## Backend pattern

- Loco framework with axum routing
- Rust scoring engine mirrors TypeScript types with `serde(rename_all = "camelCase")`
- SeaORM entities with PostgreSQL
- Tera templates with `<body hx-boost="true">` for SPA-like navigation

## Commands

```sh
cargo loco start              # Start development server (port 5150)
cargo build                   # Development build
cargo build --release         # Production build
cargo test                    # Run all tests
cargo clippy                  # Lint checks
```

## Configuration

Environment variables for production:

- `PORT` — server port
- `HOST` — server host URL
- `DATABASE_URL` — PostgreSQL connection string
- `FRONTEND_URL` — allowed CORS origin
