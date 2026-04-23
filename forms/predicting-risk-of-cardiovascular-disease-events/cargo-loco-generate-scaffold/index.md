# predicting-risk-of-cardiovascular-disease-events — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `predicting-risk-of-cardiovascular-disease-events` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_blood_pressure`
- `assessment_cholesterol_lipids`
- `assessment_metabolic_health`
- `assessment_renal_function`
- `assessment_smoking_history`
- `assessment_medical_history`
- `assessment_current_medications`
- `assessment_review_calculate`
- `pvt_rule`
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
