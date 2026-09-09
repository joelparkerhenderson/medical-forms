---
name: respirology-assessment-maintainer-skill
description: "Implementation workflow for maintaining and extending the Respirology Assessment form (forms/respirology-assessment/) — editing its spec, schema, or engine, regenerating derived artefacts, and running its verify gates. Use when implementing a change to this form's spec, SQL schema, front-end, back-end, or personas. For the repo-wide workflow, use form-examples-maintainer-skill instead."
---

# Respirology Assessment — Maintainer Skill

Implementation-facing companion to `respirology-assessment-skill` (this form's end-user concepts skill) and to `form-examples-maintainer-skill` (the repo-wide maintainer skill — read that one first for the golden rule, generators, and the full verify-gate catalogue). This skill is the one-form-scoped map.

## Directory layout

`forms/respirology-assessment/` contains:

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

- **Instrument**: MRC Dyspnoea Scale
- **Range**: 1-5
- **Categories**: 1 = Breathless only with strenuous exercise, 2 = Short of breath hurrying, 3 = Walks slower than peers, 4 = Stops after 100m, 5 = Too breathless to leave house
- **Engine files**: `types.ts`, `mrc-grader.ts`, `mrc-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mrc-grader.test.ts`

## Verify

```sh
bin/test-form respirology-assessment
bin/test-sql-apply respirology-assessment
bin/test-personas respirology-assessment
bin/test-e2e --html respirology-assessment
```

## See also

- [`../../AGENTS.md`](../../AGENTS.md) — this form's agent instructions.
- [`../../spec/index.md`](../../spec/index.md) — living domain spec.
- [`../../tasks.md`](../../tasks.md) — task tracking.
- [`../../../../AGENTS.md`](../../../../AGENTS.md) — repo-wide tool catalogue and verify gates.
