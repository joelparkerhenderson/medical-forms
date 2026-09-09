---
name: research-and-planning-privacy-notice-maintainer-skill
description: "Implementation workflow for maintaining and extending the Research and Planning Privacy Notice form (forms/research-and-planning-privacy-notice/) — editing its spec, schema, or engine, regenerating derived artefacts, and running its verify gates. Use when implementing a change to this form's spec, SQL schema, front-end, back-end, or personas. For the repo-wide workflow, use form-examples-maintainer-skill instead."
---

# Research and Planning Privacy Notice — Maintainer Skill

Implementation-facing companion to `research-and-planning-privacy-notice-skill` (this form's end-user concepts skill) and to `form-examples-maintainer-skill` (the repo-wide maintainer skill — read that one first for the golden rule, generators, and the full verify-gate catalogue). This skill is the one-form-scoped map.

## Directory layout

`forms/research-and-planning-privacy-notice/` contains:

| Subdirectory | Role |
| --- | --- |
| `sql` | source of truth |
| `xml` | generated |
| `fhir` | generated |
| `protobuf` | generated |
| `openapi` | generated |
| `front-end-with-html` | HTML + Lily (wizard + dashboard) |
| `front-end-with-svelte` | SvelteKit (wizard + dashboard) |
| `back-end-with-loco` | Rust + Loco JSON API |

Generated artefacts (`xml`, `fhir`, `protobuf`, `openapi`, the Loco setup script, `CHANGELOG.md`, `examples/assessment.json`) are never hand-edited — regenerate them instead; see the tool catalogue in [`/AGENTS.md`](../../../../AGENTS.md).

## Scoring system

- **Instrument**: Completeness Validation
- **Range**: Complete / Incomplete
- **Categories**:
  - Complete: All acknowledgement fields filled and opt-out preference recorded
  - Incomplete: One or more missing
- **Engine files**: `types.ts`, `form-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `form-validator.test.ts`

## Verify

```sh
bin/test-form research-and-planning-privacy-notice
bin/test-sql-apply research-and-planning-privacy-notice
bin/test-personas research-and-planning-privacy-notice
bin/test-e2e --html research-and-planning-privacy-notice
```

## See also

- [`../../AGENTS.md`](../../AGENTS.md) — this form's agent instructions.
- [`../../spec/index.md`](../../spec/index.md) — living domain spec.
- [`../../tasks.md`](../../tasks.md) — task tracking.
- [`../../../../AGENTS.md`](../../../../AGENTS.md) — repo-wide tool catalogue and verify gates.
