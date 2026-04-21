# HTML clinician wizard — Agent Instructions

Single-page static HTML + Alpine.js implementation of the 16-step clinician
wizard.

## Stack

- HTML, CSS, Alpine.js 3, Tailwind CDN.
- No build step, no node_modules, no server.

## Files

- `index.html` — wizard shell and all 16 step templates.
- `js/assessment.js` — Alpine component with state, engine, and report logic.
- `css/style.css` — minor overrides.

## Engine

Implements a simplified, in-browser copy of the ASA composite grader with
the same rule IDs as the SvelteKit version. It is intentionally smaller —
only the most load-bearing rules are encoded. Production deployments should
use the SvelteKit version; this HTML copy is for demo / offline use.
