# framingham-risk-score-for-hard-coronary-heart-disease — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `framingham-risk-score-for-hard-coronary-heart-disease` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_patient_information`
- `assessment_demographics`
- `assessment_smoking_history`
- `assessment_blood_pressure`
- `assessment_cholesterol`
- `assessment_medical_history`
- `assessment_family_history`
- `assessment_lifestyle_factors`
- `assessment_current_medications`
- `assessment_review_calculate`
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
