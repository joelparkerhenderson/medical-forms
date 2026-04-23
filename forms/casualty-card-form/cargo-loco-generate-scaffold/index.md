# casualty-card-form — cargo-loco-generate-scaffold

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `casualty-card-form` form's full-stack Rust backend.

## Files

- `generate.sh` — shell script with `cargo loco generate scaffold`
  commands, one per SQL table, in dependency order.

## Tables

- `patient`
- `casualty_card`
- `casualty_card_demographics`
- `casualty_card_next_of_kin`
- `casualty_card_gp`
- `casualty_card_arrival_triage`
- `casualty_card_presenting_complaint`
- `casualty_card_pain_assessment`
- `casualty_card_medical_history`
- `casualty_card_medication`
- `casualty_card_allergy`
- `casualty_card_vital_signs`
- `casualty_card_primary_survey`
- `casualty_card_clinical_examination`
- `casualty_card_investigations`
- `casualty_card_treatment`
- `casualty_card_assessment_plan`
- `casualty_card_disposition`
- `casualty_card_safeguarding_consent`
- `news2_result`
- `flagged_issue`

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
