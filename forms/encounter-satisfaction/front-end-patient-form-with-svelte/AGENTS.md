# Encounter Satisfaction: Front End Patient Form With Svelte

@../../../AGENTS/front-end-with-sveltekit-tailwind-svar.md

## Status

Implemented. SvelteKit 2.x + Svelte 5 patient satisfaction survey with 8-step wizard, ESS composite scoring (1.0-5.0), flagged issues detection, and PDF report generation.

## Architecture

- 8-step wizard: Demographics, Visit Info, Access & Scheduling, Communication, Staff & Professionalism, Care Quality, Environment, Overall Satisfaction
- 19 Likert-scale questions across 6 domains
- Pure scoring engine (`satisfaction-grader.ts`) with composite mean calculation
- Flagged issues detection (`flagged-issues.ts`) with high/medium/low priority
- PDF report via `/report/pdf` server endpoint
- Vitest unit tests for grading and flag detection
