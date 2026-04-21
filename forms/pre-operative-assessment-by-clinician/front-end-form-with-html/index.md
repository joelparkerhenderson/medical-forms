# Pre-operative Assessment by Clinician — static HTML wizard

Single-page static HTML implementation of the clinician data-entry wizard,
built with Alpine.js for reactivity and Tailwind (CDN). No build step
required; can be deployed to any static host. Produces an in-browser report
and, via the browser's Print function, a printable PDF.

## Stack

- HTML + CSS + vanilla JS
- Alpine.js 3 for reactivity
- Tailwind CSS via CDN
- No server, no database — ideal for an air-gapped clinic workstation.

## Running

```sh
# From this directory:
python3 -m http.server 8080
```

Open <http://localhost:8080>.

## Files

- `index.html` — single-page wizard
- `css/style.css` — small overrides on top of Tailwind
- `js/assessment.js` — Alpine component with all 16 steps and engine
