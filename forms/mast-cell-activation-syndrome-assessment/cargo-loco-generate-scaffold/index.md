# mast-cell-activation-syndrome-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `mast-cell-activation-syndrome-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_symptom_overview`
- `assessment_dermatological_symptoms`
- `assessment_gastrointestinal_symptoms`
- `assessment_cardiovascular_symptoms`
- `assessment_respiratory_symptoms`
- `assessment_neurological_symptoms`
- `assessment_triggers_and_patterns`
- `assessment_laboratory_results`
- `assessment_current_treatment`
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
