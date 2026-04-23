# hormone-replacement-therapy-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `hormone-replacement-therapy-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_menopause_status`
- `assessment_mrs_symptom_scale`
- `assessment_vasomotor_symptoms`
- `assessment_bone_health`
- `assessment_cardiovascular_risk`
- `assessment_breast_health`
- `assessment_current_medications`
- `assessment_current_medication_item`
- `assessment_contraindications_screen`
- `assessment_treatment_preferences`
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
