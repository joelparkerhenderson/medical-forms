# hematology-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `hematology-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_patient_information`
- `assessment_blood_count_analysis`
- `assessment_coagulation_studies`
- `assessment_peripheral_blood_film`
- `assessment_iron_studies`
- `assessment_hemoglobinopathy_screening`
- `assessment_bone_marrow_assessment`
- `assessment_transfusion_history`
- `assessment_treatment_medications`
- `assessment_clinical_review`
- `hem_rule`
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
