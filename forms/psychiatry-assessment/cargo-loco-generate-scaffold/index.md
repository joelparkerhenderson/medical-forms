# psychiatry-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `psychiatry-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_presenting_complaint`
- `assessment_psychiatric_history`
- `assessment_mental_status_exam`
- `assessment_risk_assessment`
- `assessment_mood_and_anxiety`
- `assessment_substance_use`
- `assessment_current_medications`
- `assessment_medication_item`
- `assessment_medical_history`
- `assessment_social_history`
- `assessment_capacity_and_consent`
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
