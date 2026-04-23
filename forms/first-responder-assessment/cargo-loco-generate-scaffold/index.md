# first-responder-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `first-responder-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_role_qualifications`
- `assessment_physical_fitness`
- `assessment_clinical_skills`
- `assessment_equipment_vehicle`
- `assessment_communication_skills`
- `assessment_psychological_readiness`
- `assessment_occupational_health`
- `assessment_cpd_training`
- `assessment_fitness_decision`
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
