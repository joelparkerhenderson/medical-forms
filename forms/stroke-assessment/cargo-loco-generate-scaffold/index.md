# stroke-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `stroke-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_symptom_onset`
- `assessment_level_of_consciousness`
- `assessment_best_gaze_visual`
- `assessment_facial_palsy_motor`
- `assessment_limb_ataxia_sensory`
- `assessment_language_dysarthria`
- `assessment_extinction_inattention`
- `assessment_risk_factors`
- `assessment_current_medications`
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
