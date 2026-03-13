# Heart Health Check: SQL Migrations

PostgreSQL schema migrations for the Heart Health Check assessment. 15 files creating a normalised relational schema.

## Tables

- **patient** - Demographics and contact details
- **assessment** - Assessment header with status tracking
- **demographics_ethnicity** through **review_calculate** - One-to-one section tables (steps 2–10)
- **grading_result** - Risk category, 10-year risk %, heart age
- **grading_fired_rule** - Individual fired risk rules
- **grading_additional_flag** - Clinical safety flags

## Status

Implemented.
