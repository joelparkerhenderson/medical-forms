---
name: provider-transfer-request-maintainer-skill
description: "Implementation workflow for maintaining and extending the Provider Transfer Request form (forms/provider-transfer-request/) — editing its spec, schema, or engine, regenerating derived artefacts, and running its verify gates. Use when implementing a change to this form's spec, SQL schema, front-end, back-end, or personas. For the repo-wide workflow, use form-examples-maintainer-skill instead."
---

# Provider Transfer Request — Maintainer Skill

Implementation-facing companion to `provider-transfer-request-skill` (this form's end-user concepts skill) and to `form-examples-maintainer-skill` (the repo-wide maintainer skill — read that one first for the golden rule, generators, and the full verify-gate catalogue). This skill is the one-form-scoped map.

## Directory layout

`forms/provider-transfer-request/` contains:

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

- **Instrument**: Provider Transfer Completeness Validation (SBAR-aligned)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory SBAR and logistics fields supplied
  - Partial: Non-mandatory fields outstanding
  - Incomplete: Mandatory fields missing
- **Engine files**: `types.ts`, `transfer-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `transfer-validator.test.ts`

## Verify

```sh
bin/test-form provider-transfer-request
bin/test-sql-apply provider-transfer-request
bin/test-personas provider-transfer-request
bin/test-e2e --html provider-transfer-request
```

## See also

- [`../../AGENTS.md`](../../AGENTS.md) — this form's agent instructions.
- [`../../spec/index.md`](../../spec/index.md) — living domain spec.
- [`../../tasks.md`](../../tasks.md) — task tracking.
- [`../../../../AGENTS.md`](../../../../AGENTS.md) — repo-wide tool catalogue and verify gates.
