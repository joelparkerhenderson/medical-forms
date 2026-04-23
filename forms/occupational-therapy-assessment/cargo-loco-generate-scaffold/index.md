# occupational-therapy-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `occupational-therapy-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_demographics`
- `assessment_referral_information`
- `assessment_self_care_activities`
- `assessment_productivity_activities`
- `assessment_leisure_activities`
- `assessment_performance_ratings`
- `assessment_performance_rating_item`
- `assessment_satisfaction_ratings`
- `assessment_satisfaction_rating_item`
- `assessment_environmental_factors`
- `assessment_physical_cognitive_status`
- `assessment_goals_priorities`
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
