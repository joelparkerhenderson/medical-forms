# genetic-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `genetic-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_referral_information`
- `assessment_personal_medical_history`
- `assessment_cancer_history`
- `assessment_cancer_history_item`
- `assessment_family_pedigree`
- `assessment_family_pedigree_member`
- `assessment_cardiovascular_genetics`
- `assessment_neurogenetics`
- `assessment_reproductive_genetics`
- `assessment_ethnic_background_and_consanguinity`
- `assessment_genetic_testing_history`
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
