# employee-onboarding-checklist — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `employee-onboarding-checklist` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `employee`
- `assessment`
- `assessment_demographics`
- `assessment_pre_employment_checks`
- `assessment_occupational_health`
- `assessment_mandatory_training`
- `assessment_professional_registration`
- `assessment_it_systems_access`
- `assessment_uniform_id_badge`
- `assessment_induction_programme`
- `assessment_probation_supervision`
- `assessment_sign_off_compliance`
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
