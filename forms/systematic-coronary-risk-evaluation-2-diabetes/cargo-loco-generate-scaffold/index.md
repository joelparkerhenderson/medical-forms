# systematic-coronary-risk-evaluation-2-diabetes — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `systematic-coronary-risk-evaluation-2-diabetes` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_diabetes_history`
- `assessment_cardiovascular_history`
- `assessment_blood_pressure`
- `assessment_lipid_profile`
- `assessment_renal_function`
- `assessment_lifestyle_factors`
- `assessment_current_medications`
- `assessment_complications_screening`
- `assessment_risk_summary`
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
