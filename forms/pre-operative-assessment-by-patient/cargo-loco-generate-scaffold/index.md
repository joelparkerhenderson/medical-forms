# pre-operative-assessment-by-patient — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `pre-operative-assessment-by-patient` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_cardiovascular`
- `assessment_respiratory`
- `assessment_renal`
- `assessment_hepatic`
- `assessment_endocrine`
- `assessment_neurological`
- `assessment_haematological`
- `assessment_musculoskeletal_airway`
- `assessment_gastrointestinal`
- `assessment_medication`
- `assessment_allergy`
- `assessment_previous_anaesthesia`
- `assessment_social_history`
- `assessment_functional_capacity`
- `assessment_pregnancy`
- `asa_rule`
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
