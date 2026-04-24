# casualty-card-form — cargo-loco-generate

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `casualty-card-form` form's full-stack Rust backend.

Every `assessment_<section>` child table is folded into a single
flat `assessment` resource, so one `cargo loco generate scaffold
assessment ...` call covers every questionnaire section.

## Files

- `cargo-loco-generate.sh` — one compound shell command (scaffolds
  chained with `&&`), covering the flattened schema.

## Tables

- `patient`
- `clinician`
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
sh ../cargo-loco-generate/cargo-loco-generate.sh
```

## Regenerate

```sh
bin/generate-cargo-loco-scaffold.py
```

See [`AGENTS/cargo-loco-generate-scaffold.md`](../../../AGENTS/cargo-loco-generate-scaffold.md)
for the Loco scaffold command reference.
