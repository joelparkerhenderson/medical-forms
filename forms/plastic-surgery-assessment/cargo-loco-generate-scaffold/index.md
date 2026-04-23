# plastic-surgery-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `plastic-surgery-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_reason_for_referral`
- `assessment_medical_surgical_history`
- `assessment_current_condition`
- `assessment_wound_tissue`
- `assessment_psychological`
- `assessment_anaesthetic_risk`
- `assessment_photography_documentation`
- `assessment_medications_allergies`
- `assessment_procedure_planning`
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
