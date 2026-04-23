# advance-decision-to-refuse-treatment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `advance-decision-to-refuse-treatment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_personal_information`
- `assessment_capacity_declaration`
- `assessment_circumstances`
- `assessment_treatments_refused_general`
- `assessment_treatments_refused_life_sustaining`
- `assessment_exceptions_conditions`
- `assessment_other_wishes`
- `assessment_lasting_power_of_attorney`
- `assessment_healthcare_professional_review`
- `assessment_legal_signatures`
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
