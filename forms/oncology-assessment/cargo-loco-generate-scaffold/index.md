# oncology-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `oncology-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_cancer_diagnosis`
- `assessment_treatment_history`
- `assessment_current_treatment`
- `assessment_symptom_assessment`
- `assessment_side_effects`
- `assessment_laboratory_results`
- `assessment_current_medications`
- `assessment_medication_item`
- `assessment_psychosocial`
- `assessment_functional_nutritional`
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
