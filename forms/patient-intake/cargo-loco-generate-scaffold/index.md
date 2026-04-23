# patient-intake — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `patient-intake` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_personal_information`
- `assessment_insurance_and_id`
- `assessment_reason_for_visit`
- `assessment_medical_history`
- `assessment_medications`
- `assessment_medication_item`
- `assessment_allergies`
- `assessment_allergy_item`
- `assessment_family_history`
- `assessment_social_history`
- `assessment_review_of_systems`
- `assessment_consent_preferences`
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
