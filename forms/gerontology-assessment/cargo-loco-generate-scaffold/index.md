# gerontology-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `gerontology-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_functional_assessment`
- `assessment_cognitive_screen`
- `assessment_mobility_and_falls`
- `assessment_nutrition`
- `assessment_polypharmacy_review`
- `assessment_polypharmacy_review_medication`
- `assessment_comorbidities`
- `assessment_psychosocial`
- `assessment_continence_and_skin`
- `grading_result`
- `grading_fired_rule`
- `grading_additional_flag`

## Usage

```sh
cd ../full-stack-with-rust-axum-loco-tera-htmx-alpine
sh ../cargo-loco-generate-scaffold/generate.sh
```

## Regenerate

```sh
bin/generate-cargo-loco-scaffold.py
```

See [`AGENTS/cargo-loco-generate-scaffold.md`](../../../AGENTS/cargo-loco-generate-scaffold.md)
for the Loco scaffold command reference.
