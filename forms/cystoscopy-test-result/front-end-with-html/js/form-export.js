// Form export — generic JSON / XML / CSV / TSV download of the current
// (in-progress or completed) form state.
//
// Shared, form-agnostic: reads window.__FORM_STATE__ (set by each form's
// own form-app.js, mirroring the existing window.__A11Y_DRAFT_KEY__
// cross-module contract) for the slug and the current state object, and
// self-injects a small toolbar at the top of <main>. No per-form knowledge
// of the state shape is required — export walks whatever object it is
// given. Filenames are `<slug>-<date>.<ext>`, per the monorepo's Import
// and export convention.
(function () {
  'use strict';

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function download(text, mime, filename) {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---- JSON ---------------------------------------------------------

  function toJson(state) {
    return JSON.stringify(state, null, 2) + '\n';
  }

  // ---- XML ------------------------------------------------------------

  function xmlEscape(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // A field/section name is already a JS identifier (camelCase, per this
  // monorepo's convention), so it is already a valid XML element name —
  // no name-mangling needed.
  function valueToXml(name, value, depth) {
    const pad = '  '.repeat(depth);
    if (value === null || value === undefined || value === '') {
      return `${pad}<${name}/>\n`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return `${pad}<${name}/>\n`;
      return value.map((item) => valueToXml(name, item, depth)).join('');
    }
    if (typeof value === 'object') {
      const inner = Object.keys(value)
        .map((k) => valueToXml(k, value[k], depth + 1))
        .join('');
      return `${pad}<${name}>\n${inner}${pad}</${name}>\n`;
    }
    return `${pad}<${name}>${xmlEscape(value)}</${name}>\n`;
  }

  function toXml(rootName, state) {
    const inner = Object.keys(state)
      .map((k) => valueToXml(k, state[k], 1))
      .join('');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${inner}</${rootName}>\n`;
  }

  function slugToXmlName(slug) {
    return slug
      .split('-')
      .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');
  }

  // ---- CSV / TSV --------------------------------------------------------
  //
  // A filled form is a single record, not a row list (unlike the
  // dashboard's js/table-export.js) -- flattened to one header row of
  // dot/bracket field paths and one data row of values.

  function flatten(value, prefix, out) {
    if (value === null || value === undefined) {
      out[prefix] = '';
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        out[prefix] = '';
      } else {
        value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
      }
    } else if (typeof value === 'object') {
      for (const k of Object.keys(value)) {
        flatten(value[k], prefix ? `${prefix}.${k}` : k, out);
      }
    } else {
      out[prefix] = String(value);
    }
  }

  function escapeField(value, sep) {
    if (value.includes('"') || value.includes('\n') || value.includes(sep)) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  function toDelimited(state, sep) {
    const flat = {};
    flatten(state, '', flat);
    const keys = Object.keys(flat);
    const header = keys.map((k) => escapeField(k, sep)).join(sep);
    const row = keys.map((k) => escapeField(flat[k], sep)).join(sep);
    return header + '\r\n' + row + '\r\n';
  }

  // ---- UI -----------------------------------------------------------

  function makeButton(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'button';
    btn.setAttribute('data-variant', 'secondary');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // Shared with js/form-import.js: one toolbar row at the top of <main>,
  // whichever of the two scripts runs first creates it; both append their
  // own controls into it, in <script> tag order.
  function getOrCreateBar(main) {
    let bar = main.querySelector('.form-data-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'form-data-bar no-print';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Export or import this form');
      bar.style.cssText =
        'display:flex;gap:0.5rem;margin:0 0 1rem;flex-wrap:wrap;align-items:center;';
      main.insertBefore(bar, main.firstChild);
    }
    return bar;
  }

  function init() {
    const contract = window.__FORM_STATE__;
    const main = document.querySelector('main');
    if (!contract || !main || main.dataset.exportReady === 'true') return;
    main.dataset.exportReady = 'true';

    const slug = contract.slug;
    const date = todayIso();
    const bar = getOrCreateBar(main);

    bar.appendChild(
      makeButton('Download JSON', function () {
        download(toJson(contract.getState()), 'application/json', `${slug}-${date}.json`);
      })
    );
    bar.appendChild(
      makeButton('Download XML', function () {
        download(
          toXml(slugToXmlName(slug), contract.getState()),
          'application/xml',
          `${slug}-${date}.xml`
        );
      })
    );
    bar.appendChild(
      makeButton('Download CSV', function () {
        download(toDelimited(contract.getState(), ','), 'text/csv', `${slug}-${date}.csv`);
      })
    );
    bar.appendChild(
      makeButton('Download TSV', function () {
        download(
          toDelimited(contract.getState(), '\t'),
          'text/tab-separated-values',
          `${slug}-${date}.tsv`
        );
      })
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
