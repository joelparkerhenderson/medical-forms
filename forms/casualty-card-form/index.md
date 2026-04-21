# Casualty Card Form

A clinical document used in Emergency Departments (ED) and Minor Injury Units (MIU). Captures patient information from arrival through triage, assessment, treatment, and disposition.

## Components

- 14-step questionnaire wizard
- NEWS2 auto-calculation (National Early Warning Score 2)
- Safety flag detection (11 clinical alerts)
- Report generation

## Directory Structure

```
casualty-card-form/
├── front-end-form-with-svelte/            # SvelteKit form
├── front-end-dashboard-with-svelte/       # Dashboard
├── front-end-form-with-html/              # HTML form (scaffold)
├── full-stack-with-rust-axum-loco-tera/   # Rust backend
├── db/                                    # SQL migrations
└── doc/                                   # Documentation
```
