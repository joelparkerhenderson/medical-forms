# allergy-assessment — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `allergy-assessment` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `assessment`
- `assessment_allergy_history`
- `assessment_drug_allergies`
- `assessment_drug_allergy_item`
- `assessment_food_allergies`
- `assessment_food_allergy_item`
- `assessment_environmental_allergies`
- `assessment_anaphylaxis_history`
- `assessment_anaphylaxis_episode`
- `assessment_testing_results`
- `assessment_test_result_item`
- `assessment_current_management`
- `assessment_other_medication`
- `assessment_comorbidities`
- `assessment_impact_action_plan`
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
