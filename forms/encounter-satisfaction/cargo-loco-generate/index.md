# encounter-satisfaction — cargo-loco-generate

Generator scripts that produce the Loco (loco.rs) scaffolding for
the `encounter-satisfaction` form's full-stack Rust backend.

Every `assessment_<section>` child table is folded into a single
flat `assessment` resource, so one `cargo loco generate scaffold
assessment ...` call covers every questionnaire section.

## Files

- `cargo-loco-generate.sh` — one compound shell command (scaffolds
  chained with `&&`), covering the flattened schema.

## Tables

- `patient`
- `clinician`
- `encounter_satisfaction`
- `visit_information`
- `access_scheduling`
- `communication`
- `staff_professionalism`
- `care_quality`
- `environment`
- `overall_satisfaction`
- `satisfaction_result`
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
