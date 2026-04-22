# Full-stack with Rust axum Loco HTMX Alpine.js

Server-rendered Rust web application using the Loco framework with Tera
templates, HTMX for dynamic page updates, and Alpine.js for light client-side
interactivity.

Slug: full-stack-with-rust-axum-loco-tera-htmx-alpine

- Search pattern: `forms/*/full-stack-with-rust-axum-loco-tera-htmx-alpine`

## Technology stack

| Component                                           | Version          | Purpose                                          |
| --------------------------------------------------- | ---------------- | ------------------------------------------------ |
| [Rust](https://rust-lang.org/)                      | 1.85+ (ed. 2024) | Systems programming language                     |
| [axum](https://crates.io/crates/axum)               | 0.8              | Web application framework                        |
| [Loco](https://loco.rs/)                            | 0.16             | Rails-like framework on axum                     |
| [Tera](https://keats.github.io/tera/)               | 1.20             | Template engine                                  |
| [SeaORM](https://www.sea-ql.org/SeaORM/)            | 1.1              | Object relational mapper                         |
| [PostgreSQL](https://www.postgresql.org/)           | 18.3             | Database server                                  |
| [serde](https://serde.rs/)                          | 1.x              | Serialization with `rename_all = "camelCase"`    |
| [uuid](https://crates.io/crates/uuid)               | 1.6              | UUIDv4 primary keys                              |
| [tokio](https://tokio.rs/)                          | 1.45             | Async runtime (rt-multi-thread)                  |
| [chrono](https://crates.io/crates/chrono)           | 0.4              | Timestamps with serde support                    |
| [Assertables](https://crates.io/crates/assertables) | 9.8              | Assertion testing macros                         |
| [HTMX](https://htmx.org/)                           | 2.0.8            | AJAX navigation via `hx-boost`, live filtering   |
| [Alpine.js](https://alpinejs.dev/)                  | 3.14.8           | Client-side conditional fields and dynamic lists |

Rust edition 2024 requires Rust 1.85 or newer.

## Crate layout

Each form's full-stack crate is a Cargo workspace with a `migration` sub-crate:

```
full-stack-with-rust-axum-loco-tera-htmx-alpine/
  Cargo.toml                  # Workspace + package manifest
  .gitignore                  # ignore /target, /node_modules, etc.
  src/
    bin/
      main.rs                 # HTTP entrypoint
      cli.rs                  # Loco CLI entrypoint
    app.rs                    # Loco App trait impl
    controllers/              # axum handlers per resource
    models/                   # SeaORM active-model wrappers + domain logic
    tasks/                    # Loco background tasks (optional)
    views/                    # Tera render helpers
    workers/                  # Loco workers (optional)
  templates/                  # Tera templates (.tera)
    base.html.tera            # Base layout — must include HTMX + Alpine script tags
  config/
    development.yaml          # Loco development config
    production.yaml           # Loco production config
  migration/                  # SeaORM migration crate
    src/
      lib.rs
      m*.rs                   # Migration files
```

## HTML script tags

The base Tera template `templates/base.html.tera` must include the HTMX and
Alpine.js CDN scripts exactly as shown (pinned versions, `defer` attribute):

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

The `<body>` tag must use `hx-boost="true"` for HTMX-driven navigation:

```html
<body hx-boost="true">
```

`bin/test-form` asserts all three of these strings are present.

## Backend pattern

- Loco framework with axum routing
- Rust scoring engine mirrors TypeScript types with `serde(rename_all = "camelCase")`
- SeaORM entities target PostgreSQL 18
- Tera templates render server-side; HTMX swaps fragments for navigation
- Alpine.js provides declarative conditional-field logic inside templates

## Commands

```sh
cargo loco start              # Start development server (default port 5150)
cargo build                   # Development build
cargo build --release         # Production build
cargo test                    # Run all tests
cargo clippy                  # Lint checks
cargo fmt                     # Format code

# Migrations (from the crate root)
cargo loco db migrate         # Apply pending migrations
cargo loco db reset           # Reset the database
cargo loco db seed            # Seed sample data
```

## Configuration

Environment variables for production:

- `PORT` — server port (default 5150)
- `HOST` — server host URL
- `DATABASE_URL` — PostgreSQL connection string
- `FRONTEND_URL` — allowed CORS origin

## Verify

```sh
for d in forms/*/full-stack-with-rust-axum-loco-tera-htmx-alpine; do
  (cd "$d" && cargo build && cargo test) || echo "FAIL: $d"
done
```
