# pre-operative-assessment-by-clinician — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `pre-operative-assessment-by-clinician` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_clinician`
- `assessment_surgery_plan`
- `assessment_vitals`
- `assessment_airway`
- `assessment_cardiovascular`
- `assessment_respiratory`
- `assessment_neurological`
- `assessment_renal_hepatic`
- `assessment_haematology`
- `assessment_endocrine`
- `assessment_gastrointestinal`
- `assessment_musculoskeletal`
- `assessment_medication`
- `assessment_allergy`
- `assessment_functional_capacity`
- `assessment_anaesthesia_plan`
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
