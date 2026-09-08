// Form import — JSON upload re-populates the current wizard.
//
// Shared, form-agnostic: reads window.__FORM_STATE__ (set by each form's
// own form-app.js) for setState(), which merges the uploaded object onto a
// fresh default state (tolerating a partial or foreign-shaped file, the
// same way localStorage restore does) and re-renders the whole form.
// Self-injects into the same toolbar row js/form-export.js creates (or
// creates it first, if loaded before form-export.js).
(function () {
  'use strict';

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
    if (!contract || !main || main.dataset.importReady === 'true') return;
    main.dataset.importReady = 'true';

    const bar = getOrCreateBar(main);

    const label = document.createElement('label');
    label.className = 'button';
    label.setAttribute('data-variant', 'secondary');
    label.textContent = 'Import JSON';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.className = 'visually-hidden';
    input.id = 'form-import-input';
    label.setAttribute('for', 'form-import-input');
    label.style.cursor = 'pointer';

    const status = document.createElement('span');
    status.id = 'form-import-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'visually-hidden';

    input.addEventListener('change', function () {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      if (
        !confirm(
          'Importing will replace everything currently entered in this form. Continue?'
        )
      ) {
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        let parsed;
        try {
          parsed = JSON.parse(String(reader.result));
        } catch (e) {
          status.textContent = 'Could not read that file: not valid JSON.';
          status.className = '';
          return;
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          status.textContent = 'Could not read that file: expected a JSON object.';
          status.className = '';
          return;
        }
        contract.setState(parsed);
        status.textContent = 'Form imported from ' + file.name + '.';
        status.className = '';
      };
      reader.onerror = function () {
        status.textContent = 'Could not read that file.';
        status.className = '';
      };
      reader.readAsText(file);
    });

    bar.appendChild(label);
    bar.appendChild(input);
    bar.appendChild(status);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
