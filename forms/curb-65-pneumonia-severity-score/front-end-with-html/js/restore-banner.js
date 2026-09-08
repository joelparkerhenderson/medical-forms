// Restore banner — tells the user a previous draft of this wizard was
// restored from localStorage, rather than silently repopulating fields
// with no explanation.
//
// Shared, form-agnostic: reads window.__FORM_STATE__.hadDraftAtLoad (set by
// each form's own form-app.js, mirroring the window.__A11Y_DRAFT_KEY__ /
// window.__FORM_STATE__ pattern used by js/form-export.js and
// js/form-import.js) and self-injects a dismissible Lily `.alert` banner at
// the top of <main> when it's true. "Dismiss" just hides the banner (the
// draft stays); "Discard and start over" delegates to the wizard's own
// existing reset control (#reset-btn) rather than reimplementing clearing
// logic here.
(function () {
  'use strict';

  function init() {
    const contract = window.__FORM_STATE__;
    const main = document.querySelector('main');
    if (!contract || !contract.hadDraftAtLoad || !main) return;
    if (main.dataset.restoreBannerReady === 'true') return;
    main.dataset.restoreBannerReady = 'true';

    const banner = document.createElement('div');
    banner.className = 'alert restore-banner';
    banner.setAttribute('data-type', 'info');
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:0 0 1rem;';

    const message = document.createElement('span');
    message.textContent = 'Your previous progress on this form was restored.';

    const actions = document.createElement('span');
    actions.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;';

    const discardBtn = document.createElement('button');
    discardBtn.type = 'button';
    discardBtn.className = 'button';
    discardBtn.setAttribute('data-variant', 'secondary');
    discardBtn.textContent = 'Discard and start over';
    discardBtn.addEventListener('click', function () {
      const resetBtn = document.getElementById('reset-btn');
      if (resetBtn) resetBtn.click();
      // Optimistic: #reset-btn's own confirm() is synchronous, but nothing
      // here observes whether the user accepted or cancelled it. Hiding the
      // banner unconditionally means a cancelled confirm leaves it hidden
      // even though the draft is still there -- an acceptable trade-off
      // against the alternative (the banner staying visible and describing
      // a draft that, in the far more common case, the user just discarded).
      banner.remove();
    });

    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'button';
    dismissBtn.setAttribute('data-variant', 'secondary');
    dismissBtn.textContent = 'Dismiss';
    dismissBtn.setAttribute('aria-label', 'Dismiss this notice');
    dismissBtn.addEventListener('click', function () {
      banner.remove();
    });

    actions.appendChild(discardBtn);
    actions.appendChild(dismissBtn);
    banner.appendChild(message);
    banner.appendChild(actions);

    main.insertBefore(banner, main.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
