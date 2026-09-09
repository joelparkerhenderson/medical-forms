# Back-end with Rust axum Loco

Server-side Rust JSON API using the Loco framework. There is **no HTML
rendering layer** — no Tera templates, no HTMX, no Alpine.js, no Lily
Design System, no CSS, no static assets. The crate is a pure back-end
that exposes JSON endpoints consumed by the separate `front-end-*-with-html/`
and `front-end-*-with-svelte/` subprojects. The contract each form's
back-end must satisfy is documented in the per-form
`forms/<slug>/spec/index.md`; the system-wide back-end rules live in
[`../spec.md`](../spec.md) §6.

Slug: back-end-with-loco

- Search pattern: `forms/*/back-end-with-loco`

## Technology stack

| Component                                           | Version          | Purpose                                          |
| --------------------------------------------------- | ---------------- | ------------------------------------------------ |
| [Rust](https://rust-lang.org/)                      | 1.96+ (ed. 2024) | Systems programming language                     |
| [axum](https://crates.io/crates/axum)               | 0.8              | Web application framework                        |
| [Loco](https://loco.rs/)                            | 1.0.1            | Rails-like framework on axum                     |
| [SeaORM](https://www.sea-ql.org/SeaORM/)            | 2.0              | Object relational mapper                         |
| [PostgreSQL](https://www.postgresql.org/)           | 18.3             | Database server                                  |
| [serde](https://serde.rs/)                          | 1.x              | Serialization with `rename_all = "camelCase"`    |
| [uuid](https://crates.io/crates/uuid)               | 1.24             | UUIDv4 primary keys                              |
| [tokio](https://tokio.rs/)                          | 1.53             | Async runtime (rt-multi-thread)                  |
| [chrono](https://crates.io/crates/chrono)           | 0.4              | Timestamps with serde support                    |
| [Assertables](https://crates.io/crates/assertables) | 9.8              | Assertion testing macros                         |
| [Criterion](https://crates.io/crates/criterion)     | 0.8.2            | Benchmarks                                       |
| [Tantivy](https://crates.io/crates/tantivy)         | 0.26.1           | Full-text search engine                          |
| [opentelemetry](https://crates.io/crates/opentelemetry)             | 0.27 | Vendor-neutral observability API           |
| [opentelemetry_sdk](https://crates.io/crates/opentelemetry_sdk)     | 0.27 | OpenTelemetry SDK (metrics + tracing)      |
| [opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp)   | 0.27 | OTLP gRPC/HTTP exporter to a collector     |
| [tracing-opentelemetry](https://crates.io/crates/tracing-opentelemetry) | 0.28 | Bridge `tracing` spans → OpenTelemetry  |
| [axum-prometheus](https://crates.io/crates/axum-prometheus)         | 0.7  | Prometheus `/metrics` endpoint for axum    |

Removed (no longer in the stack):

- [Tera](https://keats.github.io/tera/) — server-side template engine
- [HTMX](https://htmx.org/) — AJAX navigation via `hx-boost`
- [Alpine.js](https://alpinejs.dev/) — client-side conditional fields
- [Lily Design System](https://github.com/joelparkerhenderson/lily-design-system) — class vocabulary
- Static CSS / asset bundle

## Loco

Create app (note `--assets none` — no static asset bundle):

```sh
loco new --name [form] --db postgres --bg pg --assets none
```

The `--bg pg` flag selects the **Postgres-backed background queue**. Loco's
SQLite-backed (`bg_sqlt`) and Redis-backed (`bg_redis`) queues are
**not** used in this monorepo — every back-end runs on Postgres, so we keep
exactly one queue backend and drop the others (see [Background queue](#background-queue)).

Create cargo dependencies:

```sh
cargo add loco@0
cargo add axum@0
cargo add SeaORM@1.1
cargo add PostgreSQL@18
cargo add serde@1
cargo add uuid@1
cargo add tokio@1
cargo add chrono@0
cargo add assertables@10
cargo add criterion@0
cargo add tantivy@0
```

Create scaffold:

```sh
cargo loco generate scaffold [model] [field]:[type] [field]:[type] [field]:[type]
```

## Crate layout

Each form's back-end crate is a Cargo workspace with a `migration` sub-crate:

Route layout: all crate source lives under `src/<form_snake_case>/`; the crate
root (Cargo.toml, config/, migration/, tests/) stays at `back-end-with-loco/`.

```txt
back-end-with-loco/
  Cargo.toml                  # Workspace + package manifest; [lib] path + [[bin]] path point into src/<form_snake_case>/
  .gitignore                  # ignore /target, /node_modules, etc.
  src/
    <form_snake_case>/        # All crate source nested here (route layout)
      bin/
        main.rs               # Single binary — runs both the HTTP server and the Loco management CLI
      lib.rs                  # Crate root ([lib] path = src/<form_snake_case>/lib.rs)
      app.rs                  # Loco App trait impl
      controllers/            # axum handlers per resource (JSON in, JSON out)
      engine/                 # Pure scoring / grading engine
      models/                 # SeaORM active-model wrappers + domain logic
      tasks/                  # Loco background tasks (optional)
      workers/                # Loco workers (optional)
  config/
    development.yaml          # Loco development config
    test.yaml                 # Loco test config
    production.yaml           # Loco production config
  migration/                  # SeaORM migration crate
    src/
      lib.rs
      m*.rs                   # Migration files
  tests/                      # Integration tests for the engine and JSON API
```

Note: `include_dir!("src/...")` / `include_str!` literals in the source are
crate-root-relative, so they must reference `src/<form_snake_case>/...`.

There is no `templates/` and no `assets/`. (Loco's `src/views/` holds JSON
response shapers only — never HTML.)

## Back-end pattern

- Loco framework with axum routing.
- Rust scoring engine mirrors the spec's algorithm; structs shared with
  the front-end use `serde(rename_all = "camelCase")`.
- SeaORM entities target PostgreSQL 18.
- Every response carries `Content-Type: application/json; charset=utf-8`.
- 4xx responses are JSON error envelopes (`{"error": "...", "details": ...}`).
- No HTML, no Tera context building, no template rendering, no CDN scripts.

## JSON API contract

Every form's controller exposes the same canonical resource at `/api/assessments`:

| Method | Route                          | Handler              | Purpose                                                  |
| ------ | ------------------------------ | -------------------- | -------------------------------------------------------- |
| GET    | `/api/assessments`             | `list_assessments`   | List assessments (filterable via query params)           |
| POST   | `/api/assessments`             | `create_assessment`  | Create a new draft assessment, return `{id, data}`       |
| GET    | `/api/assessments/{id}`        | `show_assessment`    | Return the assessment record as JSON                     |
| PATCH  | `/api/assessments/{id}`        | `update_assessment`  | Merge a partial body into the JSONB `data` column        |
| POST   | `/api/assessments/{id}/submit` | `submit_assessment`  | Run the grading engine, persist the result, return JSON  |
| GET    | `/api/assessments/{id}/result` | `show_result`        | Return the stored grading result as JSON                 |

Request and response bodies are `application/json`. The on-the-wire shape
uses camelCase keys via `serde(rename_all = "camelCase")`. There is no
form-encoded body parsing, no redirect responses, no Tera context building.

Every crate also serves `GET /api/openapi.yaml` — this form's combined
`OpenAPI` 3.1 spec (`openapi/combined/openapi.yaml`, generated by
`bin/openapi/generate-openapi-combined.py`), embedded at compile time via
`include_str!` and returned through Loco's own `format::yaml()` helper.
Rolled out mechanically by `bin/loco-serve-openapi-refactor`
(`--check` is its CI drift detector); 349/355 crates done as of
2026-09-09.

Every domain controller `Params` struct and domain entity `Model` struct
carries `#[serde(rename_all = "camelCase")]` — the `cargo loco generate
scaffold` output never adds this on its own, so a form built straight from
the scaffold serves/accepts snake_case until this attribute is added.
Rolled out mechanically by `bin/loco-camel-case-json-refactor`
(`--check` is its CI drift detector); 346/355 crates changed 2026-09-09 (9
already had full coverage). Never applied to the Loco-scaffolded
`auth.rs`/`users.rs`, which stay on Loco's own default shape.

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
- `OTEL_EXPORTER_OTLP_ENDPOINT` — OTLP collector endpoint (e.g. `http://otel-collector:4317`)
- `OTEL_SERVICE_NAME` — overrides the default service name (defaults to the form slug)

## Background queue

Every Loco crate uses the **Postgres-backed** background queue and **only**
the Postgres-backed queue. The SQLite-backed (`bg_sqlt`) and Redis-backed
(`bg_redis`) backends are disabled to keep the runtime footprint identical
to the primary datastore (no extra service to operate, no second source of
truth for job state).

### Cargo.toml

In every form's Loco crate `Cargo.toml`, declare `loco-rs` with
`default-features = false` and enable only the features actually used. The
`bg_pg` feature is required; `bg_sqlt` and `bg_redis` MUST NOT appear:

```toml
loco-rs = { version = "0.16", default-features = false, features = [
  "auth_jwt",
  "bg_pg",        # Postgres-backed background queue (REQUIRED)
  "cache_inmem",
  "cli",
  "with-db",
] }
```

Forbidden features (drift detector flags these):

- `bg_sqlt` — SQLite-backed queue (not used)
- `bg_redis` — Redis-backed queue (not used)

### YAML config

`config/development.yaml`, `config/test.yaml`, and `config/production.yaml`
all carry a `workers:` block (`BackgroundQueue` in development/production,
`ForegroundBlocking` in test) and a `queue:` block
pointing at Postgres. Reuse the same Postgres URI as the main `database:`
block — Loco creates its own `loco_jobs` table on first start.

`config/development.yaml`:

```yaml
workers:
  mode: BackgroundQueue

queue:
  kind: Postgres
  uri: postgres://postgres:postgres@localhost:5432/[form]_development
  dangerously_flush: false
  num_workers: 2
```

`config/test.yaml` (note **ForegroundBlocking** — the test environment runs
queued jobs inline so the starter's mailer tests execute synchronously and
stay green):

```yaml
workers:
  mode: ForegroundBlocking

queue:
  kind: Postgres
  uri: postgres://postgres:postgres@localhost:5432/[form]_test
  dangerously_flush: true
  num_workers: 1
```

`config/production.yaml`:

```yaml
workers:
  mode: BackgroundQueue

queue:
  kind: Postgres
  uri: '{{ get_env(name="DATABASE_URL") }}'
  dangerously_flush: false
  num_workers: 4
```

## Observability

Every Loco crate emits **OpenTelemetry metrics + traces over OTLP** and
exposes a **Prometheus `/metrics` endpoint** on the same axum router. The
two are complementary:

- **OTLP exporter** → ships metrics + traces to an external OpenTelemetry
  collector for centralised aggregation (Tempo, Jaeger, Mimir, …).
- **`/metrics` endpoint** → in-process Prometheus scrape target for local
  development and Prometheus-native deployments.

### Cargo.toml

```toml
opentelemetry            = "0.27"
opentelemetry_sdk        = { version = "0.27", features = ["rt-tokio", "metrics"] }
opentelemetry-otlp       = { version = "0.27", features = ["grpc-tonic", "metrics", "trace"] }
tracing-opentelemetry    = "0.28"
axum-prometheus          = "0.7"
```

### Initializer

Each crate wires a `src/initializers/observability.rs` Loco `Initializer`
that:

1. Builds an OTLP `SpanExporter` and `MetricExporter` from
   `OTEL_EXPORTER_OTLP_ENDPOINT` (defaults to `http://localhost:4317`).
2. Sets the global `TracerProvider` and `MeterProvider`, tagged with
   `service.name = OTEL_SERVICE_NAME` (defaulting to the form slug).
3. Layers the `tracing-opentelemetry` `OpenTelemetryLayer` onto the
   existing `tracing-subscriber` so every Loco/axum span is exported.
4. Mounts `axum-prometheus`'s `PrometheusMetricLayer` and registers a
   `GET /metrics` route that returns the Prometheus text format.

### `/metrics` endpoint

- Path: `/metrics`
- Method: `GET`
- Format: Prometheus text (`text/plain; version=0.0.4`)
- Unauthenticated by default; production deployments restrict access at
  the ingress / network-policy level.
- Excluded from the standard CORS allow-list.

`bin/loco-config-refactor` is the drift detector for the background-queue
and observability conventions — it edits `Cargo.toml` and `config/*.yaml`
in place and exits non-zero in `--check` mode if anything is missing.

## Database

### Development database

Development database name is [form]\_development snake case; example patient_intake_development

File `config/development.yaml`:

```yaml
database:
  uri: postgres://postgres:postgres@localhost:5432/[form]_development
```

### Test database

- Test database name is [form]\_test snake case; example patient_intake_test

File `config/test.yaml`:

```yaml
database:
  uri: postgres://postgres:postgres@localhost:5432/[form]_test
```

### Production database

- Production database name is [form]\_production snake case; example patient_intake_production
- Connection string is supplied via `DATABASE_URL`; never hard-code credentials

File `config/production.yaml`:

```yaml
database:
  uri: '{{ get_env(name="DATABASE_URL") }}'
```

### Database naming

For database naming, always use the full form name, never use an abbreviation or truncation.

## Supply-chain policy (cargo-deny)

Every crate carries a `deny.toml` — advisories, license allow-list, banned
crates, and source registries — generated by
`bin/generate-loco-deny-config.py` (`--check` is the CI drift detector for
the file's own content). Because every crate shares the same `loco-rs` 0.16
pin, one policy applies verbatim across the whole corpus; a documented
`[[advisories.ignore]]` entry with a reason covers each unfixable transitive
advisory (unmaintained crates, or a vulnerability class this crate's code
path never reaches). Run with `--all-features` so features gated behind
Cargo feature flags are included in the graph that's checked:

```sh
cd back-end-with-loco && cargo deny --all-features check
```

This runs in CI as part of the sharded Rust job, per crate, alongside
`cargo check` / `cargo clippy` / `cargo test` (see
[Verification](../docs/verification.md)).

## Cargo.lock is tracked

Every crate's `Cargo.lock` is committed — it's a binary crate (the Loco
app + management CLI), not a published library, so the standard "commit
the lockfile for binaries" guidance applies. This also makes the
supply-chain policy above reproducible: an untracked lockfile would let
CI resolve different transitive versions than a contributor's machine,
making an advisory or license finding appear or vanish with no code
change. `.gitignore` must carry `!Cargo.lock` (or no `Cargo.lock` rule at
all), never a bare `Cargo.lock` ignore line. See
[`../spec/cargo-lock-tracking.md`](../spec/cargo-lock-tracking.md).
`bin/loco-config-refactor [--all|<slug>] [--check]` fixes `.gitignore`
mechanically alongside its background-queue and observability conventions
(above).

## Verify

```sh
for d in forms/*/back-end-with-loco; do
  (cd "$d" && cargo build && cargo test) || echo "FAIL: $d"
done
```
