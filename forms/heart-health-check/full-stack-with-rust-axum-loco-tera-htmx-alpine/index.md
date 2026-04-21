# Heart Health Check: Full Stack With Rust Axum Loco Tera

Server-rendered web application for conducting NHS Heart Health Checks using QRISK3-based cardiovascular risk assessment with 10-year CVD risk estimation and heart age calculation.

## Stack

- Rust edition 2024 with Loco 0.16 framework
- axum 0.8 web framework
- SeaORM 1.1 with PostgreSQL
- Tera HTML templates
- HTMX for dynamic interactions
- Alpine.js for client-side state

## Features

- 10-step assessment wizard with server-side form handling
- Risk scoring engine (20 HHC rules, 13 clinical flags)
- Heart age calculation
- Risk report with colour-coded results
- Dashboard with search and filtering
- 18 unit tests for scoring engine

## Status

Implemented.
