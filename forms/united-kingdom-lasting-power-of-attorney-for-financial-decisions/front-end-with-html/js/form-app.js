import { validateLpa } from './grader.js';
import { bandLabel, compositeRiskLabel, createEmptyCertificateProvider, createEmptyPerson, decisionModeLabel, emptyLpa, whenAttorneysCanActLabel } from './types.js';

// UK Lasting Power of Attorney for Financial Decisions (LP1F) — 15-step wizard.
//
// Single-page continuous wizard: every LP1F section (1–15) is rendered into the
// page in document order. The user scrolls through them; a sticky top-of-page
// progress summary and clickable step list reflect completion. Submission runs
// the pure validation engine (validateLpa) and renders an inline validation
// report with the composite-risk banner, fired statutory blockers, additional
// flags, and an LPA summary. State is persisted to localStorage so a partial
// fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'united-kingdom-lasting-power-of-attorney-for-financial-decisions.front-end-with-html.v1';

const STEPS = [
  { step: 1,  section: 'donor',            title: 'Donor',        heading: 'Donor', lp1f: 1 },
  { step: 2,  section: 'attorneys',        title: 'Attorneys',    heading: 'Attorneys', lp1f: 2 },
  { step: 3,  section: 'decision-mode',    title: 'Decisions',    heading: 'How attorneys make decisions', lp1f: 3 },
  { step: 4,  section: 'replacements',     title: 'Replacements', heading: 'Replacement attorneys', lp1f: 4 },
  { step: 5,  section: 'when',             title: 'When',         heading: 'When attorneys can act', lp1f: 5 },
  { step: 6,  section: 'notify',           title: 'Notify',       heading: 'People to notify', lp1f: 6 },
  { step: 7,  section: 'preferences',      title: 'Preferences',  heading: 'Preferences and instructions', lp1f: 7 },
  { step: 8,  section: 'legal',            title: 'Legal',        heading: 'Legal rights', lp1f: 8 },
  { step: 9,  section: 'donor-sig',        title: 'Donor sig',    heading: 'Donor signature', lp1f: 9 },
  { step: 10, section: 'certificate',      title: 'Certificate',  heading: 'Certificate-provider signature', lp1f: 10 },
  { step: 11, section: 'attorney-sigs',    title: 'Attorney sigs',heading: 'Attorney signatures', lp1f: 11 },
  { step: 12, section: 'applicant',        title: 'Applicant',    heading: 'Applicant', lp1f: 12 },
  { step: 13, section: 'recipient',        title: 'Recipient',    heading: 'Who receives the LPA', lp1f: 13 },
  { step: 14, section: 'fee',              title: 'Fee',          heading: 'Application fee', lp1f: 14 },
  { step: 15, section: 'register-sig',     title: 'Register',     heading: 'Registration signature', lp1f: 15 }
];
const TOTAL_STEPS = STEPS.length;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyLpa();

  // Shallow-merge top-level keys; nested objects merged one level deep so
  // additive future fields keep their fresh defaults.
  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v === undefined || v === null) continue;
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : fresh[key];
    } else if (typeof fresh[key] === 'object') {
      fresh[key] = { ...fresh[key], ...v };
    } else {
      fresh[key] = v;
    }
  }
  // certificateProvider may be null in a fresh LPA but an object in storage.
  if (parsed && parsed.certificateProvider && typeof parsed.certificateProvider === 'object') {
    fresh.certificateProvider = parsed.certificateProvider;
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyLpa();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved LPA; starting fresh.', e);
    return emptyLpa();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save LPA to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored LPA.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'united-kingdom-lasting-power-of-attorney-for-financial-decisions',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the validation report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function titleCase(s) {
  return String(s || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// After a structural change (add/remove list item, conditional toggle) rebuild
// the whole form, preserving scroll position.
function rerender() {
  const y = window.scrollY;
  saveState();
  renderForm();
  updateProgress();
  window.scrollTo({ top: y });
}

// After a plain value edit (text/date/number) persist + refresh progress only,
// so the focused input keeps focus.
function touch() {
  saveState();
  updateProgress();
}

// ----------------------------------------------------------------------
// Field builders (bind directly to a live object reference)
// ----------------------------------------------------------------------

function lilyInputClass(type) {
  switch (type) {
    case 'email':  return 'email-input';
    case 'number': return 'number-input';
    case 'date':   return 'date-input';
    case 'time':   return 'time-input';
    case 'tel':    return 'tel-input';
    case 'url':    return 'url-input';
    case 'search': return 'search-input';
    default:       return 'text-input';
  }
}

function textField(obj, key, opts) {
  opts = opts || {};
  const id = opts.id || `f-${Math.random().toString(36).slice(2, 9)}`;
  const type = opts.type || 'text';
  const value = obj[key];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value ?? '')}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')} aria-describedby="${id}-error">
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
    obj[key] = v;
    clearFieldError(id);
    touch();
  });
  return wrapper;
}

function textAreaField(obj, key, opts) {
  opts = opts || {};
  const id = opts.id || `f-${Math.random().toString(36).slice(2, 9)}`;
  const value = obj[key] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.maxlength ? `maxlength="${opts.maxlength}"` : ''}
      ${opts.required ? 'data-required' : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    obj[key] = ta.value;
    clearFieldError(id);
    touch();
  });
  return wrapper;
}

function selectField(obj, key, opts) {
  opts = opts || {};
  const id = opts.id || `f-${Math.random().toString(36).slice(2, 9)}`;
  const current = obj[key] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    obj[key] = sel.value;
    clearFieldError(id);
    if (opts.rerender) rerender(); else touch();
  });
  return wrapper;
}

/** Single boolean checkbox bound to a boolean field. */
function checkboxField(obj, key, opts) {
  opts = opts || {};
  const id = opts.id || `c-${Math.random().toString(36).slice(2, 9)}`;
  const checked = obj[key] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'bool-field';
  wrapper.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <label for="${id}">${esc(opts.label)}</label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    obj[key] = input.checked;
    if (opts.rerender) rerender(); else touch();
  });
  return wrapper;
}

/** Radio group bound to an enum field. Selecting a value re-renders (many
 *  choices reveal conditional fields). */
function radioGroupField(obj, key, opts) {
  const id = opts.id || `r-${Math.random().toString(36).slice(2, 9)}`;
  const current = obj[key] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const groupName = `${id}-group`;
  const items = opts.options.map((o, i) => {
    const oid = `${id}-${i}`;
    return `
      <label>
        <input type="radio" class="radio-input" name="${groupName}" id="${oid}"
          value="${esc(o.value)}"${o.value === current ? ' checked' : ''}>
        <span>${esc(o.label)}</span>
      </label>`;
  }).join('');
  wrapper.innerHTML = `
    ${opts.label ? `<span class="label">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</span>` : ''}
    <div class="radio-group radio-group-stacked" role="radiogroup" aria-label="${esc(opts.label || key)}"${opts.required ? ' data-required-group' : ''} id="${id}">
      ${items}
    </div>
    <span class="error-message" id="${id}-error"></span>
  `;
  wrapper.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) {
        obj[key] = input.value;
        rerender();
      }
    });
  });
  return wrapper;
}

function addressInput(address) {
  const wrap = document.createElement('div');
  wrap.className = 'field-grid';
  wrap.appendChild(textField(address, 'addressLine1', { label: 'Address line 1', placeholder: 'House number and street' }));
  wrap.appendChild(textField(address, 'addressLine2', { label: 'Address line 2', placeholder: 'Locality' }));
  wrap.appendChild(textField(address, 'addressLine3', { label: 'Address line 3', placeholder: 'Town / city' }));
  wrap.appendChild(textField(address, 'postcode', { label: 'Postcode', placeholder: 'e.g. SW1A 1AA' }));
  wrap.appendChild(textField(address, 'countryAsIso3166_1Alpha2', { label: 'Country', placeholder: 'GB' }));
  return wrap;
}

/** Full person card. opts: showTrustCorporation, showBankruptcyFlags,
 *  showEmail (default true), idPrefix (for error anchoring). */
function personCard(person, opts) {
  opts = opts || {};
  const card = document.createElement('div');
  card.className = 'person-card';

  const grid = document.createElement('div');
  grid.className = 'field-grid';
  grid.appendChild(textField(person, 'title', { label: 'Title', placeholder: 'Mr / Mrs / Mx / Dr' }));
  grid.appendChild(textField(person, 'firstNames', { label: 'First names' }));
  grid.appendChild(textField(person, 'lastName', {
    label: 'Last name',
    id: opts.idPrefix ? `${opts.idPrefix}-lastName` : undefined
  }));
  grid.appendChild(textField(person, 'otherNames', { label: 'Other names known by' }));
  grid.appendChild(textField(person, 'dateOfBirth', {
    label: 'Date of birth', type: 'date',
    id: opts.idPrefix ? `${opts.idPrefix}-dateOfBirth` : undefined
  }));
  if (opts.showEmail !== false) {
    grid.appendChild(textField(person, 'email', { label: 'Email', type: 'email' }));
  }
  grid.appendChild(textField(person, 'phone', { label: 'Phone', type: 'tel' }));
  card.appendChild(grid);

  card.appendChild(addressInput(person.address));

  if (opts.showTrustCorporation) {
    card.appendChild(checkboxField(person, 'isTrustCorporation', {
      label: 'This attorney is a trust corporation', rerender: true
    }));
    if (person.isTrustCorporation) {
      card.appendChild(textField(person, 'trustCorporationNumber', { label: 'Trust corporation number' }));
    }
  }
  if (opts.showBankruptcyFlags) {
    card.appendChild(checkboxField(person, 'isBankrupt', { label: 'Currently bankrupt' }));
    card.appendChild(checkboxField(person, 'hasDebtReliefOrder', { label: 'Subject to a debt relief order' }));
  }
  return card;
}

// ----------------------------------------------------------------------
// Section scaffolding
// ----------------------------------------------------------------------

function sectionCard(def) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(def.step);
  card.id = `step-${def.step}`;
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML = `
    <span class="section-step">Step ${def.step} of ${TOTAL_STEPS} · LP1F section ${def.lp1f}</span>
    <h2 class="section-title">${esc(def.heading)}</h2>
    ${def.description ? `<span class="section-description">${esc(def.description)}</span>` : ''}
  `;
  card.appendChild(legend);
  return card;
}

function subHead(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function note(text) {
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;
  return p;
}

function addButton(label, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'button';
  b.dataset.variant = 'add';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function removeButton(onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'button';
  b.dataset.variant = 'icon';
  b.setAttribute('aria-label', 'Remove');
  b.textContent = '✕';
  b.addEventListener('click', onClick);
  return b;
}

// ----------------------------------------------------------------------
// List helpers (attorneys / replacements / people-to-notify)
// ----------------------------------------------------------------------

function reindex(list) {
  list.forEach((item, i) => { item.ordinal = i + 1; });
}

function addAttorney() {
  state.attorneys.push({ person: createEmptyPerson(), ordinal: state.attorneys.length + 1 });
  rerender();
}
function removeAttorney(i) {
  state.attorneys.splice(i, 1);
  reindex(state.attorneys);
  rerender();
}
function addReplacement() {
  state.replacementAttorneys.push({
    person: createEmptyPerson(),
    ordinal: state.replacementAttorneys.length + 1,
    replacementStepInCondition: ''
  });
  rerender();
}
function removeReplacement(i) {
  state.replacementAttorneys.splice(i, 1);
  reindex(state.replacementAttorneys);
  rerender();
}
function addPersonToNotify() {
  if (state.peopleToNotify.length >= 5) return;
  state.peopleToNotify.push({ person: createEmptyPerson(), ordinal: state.peopleToNotify.length + 1 });
  rerender();
}
function removePersonToNotify(i) {
  state.peopleToNotify.splice(i, 1);
  reindex(state.peopleToNotify);
  rerender();
}

// ----------------------------------------------------------------------
// Signature helpers (mirror the SvelteKit step components' ensure logic)
// ----------------------------------------------------------------------

function newWitness() {
  return { person: createEmptyPerson(), witnessSignatureBlobPath: '', witnessedOn: '' };
}

function ensureDonorSignature() {
  let sig = state.signatures.find((s) => s.role === 'donor' && s.lp1fSection === 9);
  if (!sig) {
    sig = {
      id: `sig-donor-${state.donor.id}`,
      signatoryPersonId: state.donor.id,
      role: 'donor',
      lp1fSection: 9,
      signatureBlobPath: '',
      signedOn: '',
      signedOnBehalfFullName: '',
      isWitnessed: true,
      witness: newWitness()
    };
    state.signatures.push(sig);
  }
  return sig;
}

function ensureCpSignature(cp) {
  let sig = state.signatures.find((s) => s.role === 'certificate_provider' && s.lp1fSection === 10);
  if (!sig) {
    sig = {
      id: `sig-cp-${cp.person.id}`,
      signatoryPersonId: cp.person.id,
      role: 'certificate_provider',
      lp1fSection: 10,
      signatureBlobPath: '',
      signedOn: '',
      signedOnBehalfFullName: '',
      isWitnessed: false,
      witness: null
    };
    state.signatures.push(sig);
  }
  return sig;
}

function ensureAttorneySignature(personId, role) {
  let sig = state.signatures.find((s) => s.lp1fSection === 11 && s.signatoryPersonId === personId);
  if (!sig) {
    sig = {
      id: `sig-${role}-${personId}`,
      signatoryPersonId: personId,
      role,
      lp1fSection: 11,
      signatureBlobPath: '',
      signedOn: '',
      signedOnBehalfFullName: '',
      isWitnessed: true,
      witness: newWitness()
    };
    state.signatures.push(sig);
  }
  return sig;
}

function applicantSig(personId) {
  return {
    id: `sig-applicant-${personId}`,
    signatoryPersonId: personId,
    role: 'applicant',
    lp1fSection: 15,
    signatureBlobPath: '',
    signedOn: '',
    signedOnBehalfFullName: '',
    isWitnessed: false,
    witness: null
  };
}

function hasApplicantSig(personId) {
  return state.signatures.some(
    (s) => s.role === 'applicant' && s.lp1fSection === 15 && s.signatoryPersonId === personId
  );
}

/** Keep section-15 applicant signatures consistent with the applicant kind. */
function syncApplicantSignatures() {
  const kind = state.registrationApplication.applicantKind;
  if (kind === 'donor') {
    // Remove any attorney applicant sigs; ensure a donor applicant sig.
    state.signatures = state.signatures.filter(
      (s) => !(s.role === 'applicant' && s.lp1fSection === 15 && s.signatoryPersonId !== state.donor.id)
    );
    if (!hasApplicantSig(state.donor.id)) {
      state.signatures.push(applicantSig(state.donor.id));
    }
  } else if (kind === '') {
    state.signatures = state.signatures.filter(
      (s) => !(s.role === 'applicant' && s.lp1fSection === 15)
    );
  } else {
    // attorneys: prune donor applicant sig and any for removed attorneys.
    const attorneyIds = new Set(state.attorneys.map((a) => a.person.id));
    state.signatures = state.signatures.filter(
      (s) =>
        !(s.role === 'applicant' && s.lp1fSection === 15) ||
        attorneyIds.has(s.signatoryPersonId)
    );
  }
}

function toggleApplicantAttorney(personId, checked) {
  if (checked) {
    if (!hasApplicantSig(personId)) state.signatures.push(applicantSig(personId));
  } else {
    state.signatures = state.signatures.filter(
      (s) => !(s.role === 'applicant' && s.lp1fSection === 15 && s.signatoryPersonId === personId)
    );
  }
  rerender();
}

function witnessBlock(sig) {
  const wrap = document.createElement('div');
  wrap.className = 'witness-block';
  wrap.appendChild(subHead('Witness'));
  const grid = document.createElement('div');
  grid.className = 'field-grid';
  grid.appendChild(textField(sig.witness.person, 'firstNames', { label: 'Witness first names' }));
  grid.appendChild(textField(sig.witness.person, 'lastName', { label: 'Witness last name' }));
  wrap.appendChild(grid);
  wrap.appendChild(addressInput(sig.witness.person.address));
  wrap.appendChild(textField(sig.witness, 'witnessedOn', { label: 'Witness date', type: 'date' }));
  return wrap;
}

// ----------------------------------------------------------------------
// Step renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    step: 1, lp1f: 1, heading: 'Donor',
    description: 'The person making the LPA. Must be 18 or older and have mental capacity at the time of signing.'
  });
  card.appendChild(personCard(state.donor, { idPrefix: 'donor' }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    step: 2, lp1f: 2, heading: 'Attorneys',
    description: 'One or more people (or a single trust corporation) who will make financial decisions for the donor. Each must be 18+, not bankrupt, and not subject to a debt relief order. More than 4 attorneys requires LPC continuation sheet 1.'
  });
  if (state.attorneys.length === 0) {
    card.appendChild(note('No attorneys added yet. Add at least one attorney.'));
  }
  state.attorneys.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const head = document.createElement('div');
    head.className = 'list-item-head';
    head.innerHTML = `<h3>Attorney #${a.ordinal}</h3>`;
    head.appendChild(removeButton(() => removeAttorney(i)));
    row.appendChild(head);
    row.appendChild(personCard(a.person, { showTrustCorporation: true, showBankruptcyFlags: true }));
    card.appendChild(row);
  });
  card.appendChild(addButton('Add attorney', addAttorney));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    step: 3, lp1f: 3, heading: 'How attorneys make decisions',
    description: '“Jointly” means the LPA fails if any attorney drops out unless you have a replacement. “Mixed” requires LPC continuation sheet 2 listing which decisions are joint.'
  });
  card.appendChild(radioGroupField(state, 'decisionMode', {
    label: 'Decision mode',
    options: [
      { value: 'single_attorney', label: 'Single attorney (only one attorney appointed)' },
      { value: 'jointly_and_severally', label: 'Jointly and severally (attorneys can act together or independently)' },
      { value: 'jointly', label: 'Jointly (attorneys must always act together)' },
      { value: 'mixed', label: 'Jointly for some decisions, jointly and severally for others (mixed)' }
    ]
  }));
  if (state.decisionMode === 'mixed') {
    card.appendChild(textAreaField(state, 'decisionModeMixedText', {
      label: 'Which decisions are joint?',
      hint: 'Brief summary; long lists continue on LPC sheet 2.',
      rows: 4, maxlength: 2000
    }));
  }
  return card;
}

function renderStep4() {
  const card = sectionCard({
    step: 4, lp1f: 4, heading: 'Replacement attorneys',
    description: 'Zero or more people who step in if an original attorney can no longer act. Strongly recommended when attorneys are appointed jointly.'
  });
  if (state.replacementAttorneys.length === 0) {
    card.appendChild(note('No replacement attorneys added.'));
  }
  state.replacementAttorneys.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const head = document.createElement('div');
    head.className = 'list-item-head';
    head.innerHTML = `<h3>Replacement #${r.ordinal}</h3>`;
    head.appendChild(removeButton(() => removeReplacement(i)));
    row.appendChild(head);
    row.appendChild(personCard(r.person, { showBankruptcyFlags: true }));
    row.appendChild(textAreaField(r, 'replacementStepInCondition', {
      label: 'Step-in condition (optional)',
      hint: 'When and how this replacement takes over.',
      rows: 2, maxlength: 500
    }));
    card.appendChild(row);
  });
  card.appendChild(addButton('Add replacement attorney', addReplacement));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    step: 5, lp1f: 5, heading: 'When attorneys can act',
    description: 'Decide when the attorneys can begin using the LPA. The “only when no capacity” option significantly restricts day-to-day usefulness.'
  });
  card.appendChild(radioGroupField(state, 'whenAttorneysCanAct', {
    label: 'When can attorneys act',
    options: [
      { value: 'as_soon_as_registered', label: 'As soon as the LPA is registered (recommended) — attorneys may help with finances while the donor still has capacity, with the donor’s consent.' },
      { value: 'only_when_no_capacity', label: 'Only when the donor does not have mental capacity — attorneys cannot act until evidence of incapacity is provided.' }
    ]
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    step: 6, lp1f: 6, heading: 'People to notify',
    description: 'Up to 5 people who will be notified when the OPG is asked to register the LPA. They can object if they have concerns. People-to-notify cannot also be attorneys.'
  });
  if (state.peopleToNotify.length === 0) {
    card.appendChild(note('No people to notify added.'));
  }
  state.peopleToNotify.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const head = document.createElement('div');
    head.className = 'list-item-head';
    head.innerHTML = `<h3>Person to notify #${p.ordinal}</h3>`;
    head.appendChild(removeButton(() => removePersonToNotify(i)));
    row.appendChild(head);
    row.appendChild(personCard(p.person, { showEmail: false }));
    card.appendChild(row);
  });
  if (state.peopleToNotify.length < 5) {
    card.appendChild(addButton('Add person to notify', addPersonToNotify));
  } else {
    card.appendChild(note('Maximum of 5 people to notify reached.'));
  }
  return card;
}

function renderStep7() {
  const card = sectionCard({
    step: 7, lp1f: 7, heading: 'Preferences and instructions',
    description: 'Preferences are non-binding guidance. Instructions are legally binding on the attorneys. Long or complex instructions risk OPG rejection — keep them clear and concrete.'
  });
  card.appendChild(textAreaField(state, 'preferencesText', {
    label: 'Preferences (optional, non-binding)', rows: 5, maxlength: 2000
  }));
  card.appendChild(textAreaField(state, 'instructionsText', {
    label: 'Instructions (legally binding)', rows: 5, maxlength: 2000
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    step: 8, lp1f: 8, heading: 'Legal rights',
    description: 'The donor must read and understand the legal-rights statement printed on the LP1F.'
  });
  const statement = document.createElement('div');
  statement.className = 'alert';
  statement.dataset.type = 'info';
  statement.setAttribute('role', 'note');
  statement.innerHTML = `<p>As donor, I understand: my attorneys will act in my best interests under the Mental Capacity Act 2005; the LPA must be registered with the OPG before it can be used; I can cancel the LPA at any time while I have mental capacity; I am giving my attorneys legal authority to manage my property and financial affairs.</p>`;
  card.appendChild(statement);
  card.appendChild(checkboxField(state, 'legalRightsAcknowledged', {
    label: 'I have read and understood the legal rights statement.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    step: 9, lp1f: 9, heading: 'Donor signature',
    description: 'The donor signs in the presence of an adult witness. The witness must not be the donor or one of the attorneys. If the donor cannot physically sign, attach LPC continuation sheet 3.'
  });
  const sig = ensureDonorSignature();
  card.appendChild(textField(sig, 'signedOn', { label: 'Date signed', type: 'date' }));
  card.appendChild(textField(sig, 'signedOnBehalfFullName', {
    label: 'Signed on behalf (full name, optional)',
    hint: 'Only complete if the donor cannot sign and another adult signs at the donor’s direction; requires LPC sheet 3.'
  }));
  card.appendChild(witnessBlock(sig));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    step: 10, lp1f: 10, heading: 'Certificate-provider signature',
    description: 'The certificate provider confirms the donor understands the LPA and is not under pressure to make it. They must be independent of the donor and attorneys.'
  });
  if (!state.certificateProvider) state.certificateProvider = createEmptyCertificateProvider();
  const cp = state.certificateProvider;

  const grid = document.createElement('div');
  grid.className = 'field-grid';
  grid.appendChild(textField(cp.person, 'title', { label: 'Title', placeholder: 'Mr / Mrs / Mx / Dr' }));
  grid.appendChild(textField(cp.person, 'firstNames', { label: 'First names' }));
  grid.appendChild(textField(cp.person, 'lastName', { label: 'Last name' }));
  grid.appendChild(textField(cp.person, 'dateOfBirth', { label: 'Date of birth', type: 'date' }));
  card.appendChild(grid);
  card.appendChild(addressInput(cp.person.address));

  card.appendChild(radioGroupField(cp, 'knowsDonorAs', {
    label: 'How the certificate provider knows the donor',
    options: [
      { value: 'friend', label: 'A friend who has known the donor personally for at least 2 years' },
      { value: 'professional', label: 'A professional (GP, solicitor, registered social worker, etc.)' }
    ]
  }));

  card.appendChild(subHead('Eligibility confirmations'));
  card.appendChild(checkboxField(cp, 'isOverEighteen', { label: 'I am 18 or older.' }));
  card.appendChild(checkboxField(cp, 'readLpa', { label: 'I have read this LPA (or had it read to me) and discussed it with the donor.' }));
  card.appendChild(checkboxField(cp, 'noRestrictionsOnActing', { label: 'No one is forcing or pressuring the donor to make this LPA.' }));
  card.appendChild(checkboxField(cp, 'isRelatedToDonorOrAttorney', { label: 'I am a family member of the donor or of one of the attorneys.' }));
  card.appendChild(checkboxField(cp, 'isCareHomeOwnerOrEmployee', { label: 'I own, manage, or am employed by the donor’s care home.' }));

  const sig = ensureCpSignature(cp);
  card.appendChild(textField(sig, 'signedOn', { label: 'Date signed', type: 'date' }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    step: 11, lp1f: 11, heading: 'Attorney signatures',
    description: 'Each attorney and each replacement attorney signs in turn, with their own witness. The witness must not be the donor. Attorneys sign after the certificate provider.'
  });
  if (state.attorneys.length === 0 && state.replacementAttorneys.length === 0) {
    const p = document.createElement('p');
    p.className = 'error-message';
    p.style.display = 'block';
    p.textContent = 'No attorneys have been added in section 2 or section 4. Return to step 2 to add at least one attorney before collecting signatures.';
    card.appendChild(p);
    return card;
  }
  state.attorneys.forEach((a) => {
    const sig = ensureAttorneySignature(a.person.id, 'attorney');
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<h3>Attorney #${a.ordinal} — ${esc([a.person.firstNames, a.person.lastName].filter(Boolean).join(' ')) || '(unnamed)'}</h3>`;
    row.appendChild(textField(sig, 'signedOn', { label: 'Date signed', type: 'date' }));
    row.appendChild(witnessBlock(sig));
    card.appendChild(row);
  });
  state.replacementAttorneys.forEach((r) => {
    const sig = ensureAttorneySignature(r.person.id, 'replacement_attorney');
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<h3>Replacement #${r.ordinal} — ${esc([r.person.firstNames, r.person.lastName].filter(Boolean).join(' ')) || '(unnamed)'}</h3>`;
    row.appendChild(textField(sig, 'signedOn', { label: 'Date signed', type: 'date' }));
    row.appendChild(witnessBlock(sig));
    card.appendChild(row);
  });
  return card;
}

function renderStep12() {
  const card = sectionCard({
    step: 12, lp1f: 12, heading: 'Applicant',
    description: 'Only the donor or one or more attorneys may apply to register the LPA. When attorneys are appointed jointly, every joint attorney must apply (and sign section 15).'
  });
  syncApplicantSignatures();
  card.appendChild(radioGroupField(state.registrationApplication, 'applicantKind', {
    label: 'Who is applying to register?',
    options: [
      { value: 'donor', label: 'The donor is applying to register the LPA' },
      { value: 'attorneys', label: 'One or more attorneys are applying to register the LPA' }
    ]
  }));
  if (state.registrationApplication.applicantKind === 'attorneys') {
    card.appendChild(subHead('Which attorneys are applying?'));
    if (state.attorneys.length === 0) {
      const p = document.createElement('p');
      p.className = 'error-message';
      p.style.display = 'block';
      p.textContent = 'No attorneys have been added yet. Go back to step 2 to add at least one.';
      card.appendChild(p);
    }
    state.attorneys.forEach((a) => {
      const wrap = document.createElement('div');
      wrap.className = 'bool-field';
      const cid = `applicant-att-${a.person.id}`;
      const checked = hasApplicantSig(a.person.id);
      wrap.innerHTML = `
        <input type="checkbox" class="checkbox-input" id="${cid}"${checked ? ' checked' : ''}>
        <label for="${cid}">Attorney #${a.ordinal} — ${esc([a.person.firstNames, a.person.lastName].filter(Boolean).join(' ')) || '(unnamed)'}</label>
      `;
      wrap.querySelector('input').addEventListener('change', (e) => {
        toggleApplicantAttorney(a.person.id, e.currentTarget.checked);
      });
      card.appendChild(wrap);
    });
  }
  return card;
}

function renderStep13() {
  const card = sectionCard({
    step: 13, lp1f: 13, heading: 'Who receives the LPA',
    description: 'Choose who the OPG should send the registered LPA to, and how they would like to be contacted about the application.'
  });
  const r = state.registrationRecipient;
  card.appendChild(radioGroupField(r, 'recipientKind', {
    label: 'Recipient',
    options: [
      { value: 'donor', label: 'Send to the donor' },
      { value: 'attorney', label: 'Send to one of the attorneys' },
      { value: 'other', label: 'Send to someone else (e.g. solicitor)' }
    ]
  }));
  if (r.recipientKind === 'other') {
    const grid = document.createElement('div');
    grid.className = 'field-grid';
    grid.appendChild(textField(r, 'otherFirstNames', { label: 'Recipient first names' }));
    grid.appendChild(textField(r, 'otherLastName', { label: 'Recipient last name' }));
    card.appendChild(grid);
    card.appendChild(textField(r, 'companyName', { label: 'Company / firm (optional)' }));
    card.appendChild(textField(r, 'otherAddressLine1', { label: 'Address line 1' }));
    card.appendChild(textField(r, 'otherAddressLine2', { label: 'Address line 2' }));
    card.appendChild(textField(r, 'otherAddressLine3', { label: 'Address line 3' }));
    card.appendChild(textField(r, 'otherPostcode', { label: 'Postcode' }));
  }
  card.appendChild(subHead('Contact preferences'));
  card.appendChild(checkboxField(r, 'prefersPost', { label: 'Prefer to be contacted by post' }));
  card.appendChild(checkboxField(r, 'prefersPhone', { label: 'Prefer to be contacted by phone', rerender: true }));
  card.appendChild(checkboxField(r, 'prefersEmail', { label: 'Prefer to be contacted by email', rerender: true }));
  card.appendChild(checkboxField(r, 'prefersWelsh', { label: 'Prefer correspondence in Welsh' }));
  if (r.prefersPhone) {
    card.appendChild(textField(r, 'contactPhone', { label: 'Contact phone', type: 'tel' }));
  }
  if (r.prefersEmail) {
    card.appendChild(textField(r, 'contactEmail', { label: 'Contact email', type: 'email' }));
  }
  return card;
}

function renderStep14() {
  const card = sectionCard({
    step: 14, lp1f: 14, heading: 'Application fee',
    description: 'The standard LPA registration fee is £82. If the donor is on a low income or means-tested benefits, a reduction or exemption may apply (use LPA120A).'
  });
  const app = state.registrationApplication;
  card.appendChild(radioGroupField(app, 'paymentMethod', {
    label: 'Payment method',
    options: [
      { value: 'card', label: 'Pay by debit or credit card (the OPG will phone for details)' },
      { value: 'cheque', label: 'Pay by cheque (make payable to "Office of the Public Guardian")' }
    ]
  }));
  if (app.paymentMethod === 'card') {
    card.appendChild(textField(app, 'cardPaymentPhone', {
      label: 'Phone number for card payment', type: 'tel',
      hint: 'The OPG will call this number to take card details.'
    }));
  }
  card.appendChild(checkboxField(app, 'reducedFeeRequested', {
    label: 'Apply for a reduced or no fee (requires LPA120A evidence)', rerender: true
  }));
  if (app.reducedFeeRequested) {
    card.appendChild(note('Download form LPA120A from the OPG and attach evidence of low income or benefits.'));
    card.appendChild(checkboxField(app, 'hasLpa120aEvidence', { label: 'LPA120A evidence is attached' }));
  }
  card.appendChild(checkboxField(app, 'isRepeatApplication', {
    label: 'This is a repeat application after a previous LPA was rejected', rerender: true
  }));
  if (app.isRepeatApplication) {
    card.appendChild(textField(app, 'repeatCaseNumber', { label: 'Previous OPG case number' }));
  }
  return card;
}

function renderStep15() {
  const card = sectionCard({
    step: 15, lp1f: 15, heading: 'Registration signature',
    description: 'Each applicant signs the registration request. If attorneys are appointed jointly, every joint attorney must sign here.'
  });
  syncApplicantSignatures();
  const kind = state.registrationApplication.applicantKind;
  if (!kind) {
    const p = document.createElement('p');
    p.className = 'error-message';
    p.style.display = 'block';
    p.textContent = 'Choose an applicant kind in step 12 first.';
    card.appendChild(p);
    return card;
  }
  const applicantSigs = state.signatures.filter(
    (s) => s.role === 'applicant' && s.lp1fSection === 15
  );
  if (applicantSigs.length === 0) {
    card.appendChild(note('No applicants selected. Select the applying attorney(s) in step 12.'));
  }
  applicantSigs.forEach((sig) => {
    let label;
    if (sig.signatoryPersonId === state.donor.id) {
      label = `Donor — ${[state.donor.firstNames, state.donor.lastName].filter(Boolean).join(' ')}`.trim();
    } else {
      const a = state.attorneys.find((x) => x.person.id === sig.signatoryPersonId);
      label = a
        ? `Attorney #${a.ordinal} — ${[a.person.firstNames, a.person.lastName].filter(Boolean).join(' ')}`.trim()
        : 'Applicant';
    }
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<h3>${esc(label)}</h3>`;
    row.appendChild(textField(sig, 'signedOn', { label: 'Date signed', type: 'date' }));
    card.appendChild(row);
  });
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  renderStep11, renderStep12, renderStep13, renderStep14, renderStep15
];

// ----------------------------------------------------------------------
// Progress + step list
// ----------------------------------------------------------------------

const STEP_FIELDS = {
  1: [(d) => !!d.donor.firstNames, (d) => !!d.donor.lastName, (d) => !!d.donor.dateOfBirth],
  2: [(d) => d.attorneys.length > 0],
  3: [(d) => !!d.decisionMode],
  4: [],
  5: [(d) => !!d.whenAttorneysCanAct],
  6: [],
  7: [],
  8: [(d) => d.legalRightsAcknowledged === true],
  9: [(d) => d.signatures.some((s) => s.role === 'donor' && s.lp1fSection === 9 && !!s.signedOn)],
  10: [
    (d) => !!(d.certificateProvider && d.certificateProvider.person.lastName),
    (d) => !!(d.certificateProvider && d.certificateProvider.knowsDonorAs)
  ],
  11: [(d) =>
    d.attorneys.length > 0 &&
    d.attorneys.every((a) =>
      d.signatures.some((s) => s.lp1fSection === 11 && s.signatoryPersonId === a.person.id && !!s.signedOn)
    )],
  12: [(d) => !!d.registrationApplication.applicantKind],
  13: [(d) => !!d.registrationRecipient.recipientKind],
  14: [(d) => !!d.registrationApplication.paymentMethod],
  15: [(d) => d.signatures.some((s) => s.role === 'applicant' && s.lp1fSection === 15 && !!s.signedOn)]
};

function updateProgress() {
  let answered = 0;
  let total = 0;
  const perStep = {};
  for (const def of STEPS) {
    const preds = STEP_FIELDS[def.step] || [];
    let a = 0;
    for (const p of preds) { if (p(state)) a++; }
    perStep[def.step] = { a, t: preds.length };
    answered += a;
    total += preds.length;
  }
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} key fields answered (${percent}%)`;
  updateStepListStatuses(perStep);
}

function renderStepList() {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  ol.innerHTML = '';
  for (const def of STEPS) {
    const li = document.createElement('li');
    li.className = 'step-list-item';
    li.dataset.status = 'waiting';
    li.dataset.step = String(def.step);
    li.setAttribute('aria-label', `Step ${def.step}: ${def.title}`);
    li.innerHTML = `<span>${esc(def.title)}</span>`;
    li.addEventListener('click', () => {
      const target = document.getElementById(`step-${def.step}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    ol.appendChild(li);
  }
}

function updateStepListStatuses(perStep) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEPS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const { a, t } = perStep[def.step] || { a: 0, t: 0 };
    if (t > 0 && a === t) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (a > 0) {
      li.dataset.status = 'in-progress';
      if (firstUnfinished === -1) firstUnfinished = def.step;
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
    }
  }
  if (firstUnfinished === -1) firstUnfinished = STEPS[0].step;
  const current = ol.querySelector(`[data-step="${firstUnfinished}"]`);
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

// ----------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

// The LPA form has no strictly-required text inputs at data-entry stage (the
// statutory engine reports what is missing). We validate the minimum needed to
// produce a meaningful report: a donor name and at least one attorney.
function validateForm() {
  const errors = [];
  if (!String(state.donor.firstNames || '').trim() && !String(state.donor.lastName || '').trim()) {
    errors.push({ id: 'donor-lastName', message: 'Enter the donor’s name (section 1).' });
    setFieldError('donor-lastName', 'Enter the donor’s name.');
  }
  if (state.attorneys.length === 0) {
    errors.push({ id: 'step-2', message: 'Add at least one attorney (section 2).' });
  }
  renderErrorSummary(errors);
  return errors;
}

function renderErrorSummary(errors) {
  const summary = document.getElementById('error-summary');
  if (!summary) return;
  if (errors.length === 0) {
    summary.hidden = true;
    summary.innerHTML = '';
    return;
  }
  summary.hidden = false;
  summary.innerHTML = `
    <strong>Please correct the following before generating the report:</strong>
    <ul>
      ${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus({ preventScroll: true });
}

// ----------------------------------------------------------------------
// Report
// ----------------------------------------------------------------------

function ruleCard(r) {
  return `
    <div class="rule-card priority-${esc(r.priority)}">
      <span class="priority-badge priority-${esc(r.priority)}">${esc(r.priority.toUpperCase())}</span>
      <div class="rule-body">
        <div class="rule-message">${esc(r.message)}</div>
        <div class="rule-remediation">${esc(r.remediation)}</div>
        <div class="rule-meta">${esc(r.ruleId)}${r.citation ? ` · ${esc(r.citation)}` : ''}</div>
      </div>
    </div>`;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { validityBand, compositeRisk, firedRules, additionalFlags, timestamp } = lastResult;

  const donorName =
    [state.donor.title, state.donor.firstNames, state.donor.lastName]
      .filter((s) => s && s.length > 0).join(' ').trim() || '(unnamed donor)';

  const blockersHtml = firedRules.length === 0
    ? `<div class="alert" data-type="success" role="status"><strong>No statutory blockers.</strong> No Mental Capacity Act 2005 or LPA Regulations 2007 blocker rules fired against this deed.</div>`
    : `<div class="rule-list">${firedRules.map(ruleCard).join('')}</div>`;

  const flagsHtml = additionalFlags.length === 0
    ? `<p class="muted">No additional flags.</p>`
    : `<div class="rule-list">${additionalFlags.map(ruleCard).join('')}</div>`;

  const attorneysHtml = state.attorneys.length === 0
    ? `<p class="muted">No attorneys listed.</p>`
    : `<ul class="summary-list">${state.attorneys.map((a) => {
        const nm = [a.person.title, a.person.firstNames, a.person.lastName].filter(Boolean).join(' ') || '(unnamed)';
        const trust = a.person.isTrustCorporation ? ' <span class="tag">trust corporation</span>' : '';
        const dob = a.person.dateOfBirth ? ` — born ${esc(a.person.dateOfBirth)}` : '';
        return `<li><strong>${esc(nm)}</strong>${trust}<span class="muted-inline">${dob}</span></li>`;
      }).join('')}</ul>`;

  out.innerHTML = `
    <h2>LPA validation report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Donor: ${esc(donorName)}</p>

    <div class="risk-banner risk-${esc(compositeRisk)}">
      <span class="risk-value">${esc(compositeRiskLabel(compositeRisk))} risk</span>
      <span class="risk-sub">Validity: ${esc(bandLabel(validityBand))} · OPG status: ${esc(bandLabel(state.status))}</span>
    </div>

    <h3>Statutory blockers</h3>
    ${blockersHtml}

    <h3>Additional flags</h3>
    ${flagsHtml}

    <h3>LPA summary</h3>
    <div class="summary-grid">
      <div><span class="summary-key">Donor</span> ${esc(donorName)}</div>
      <div><span class="summary-key">Donor DOB</span> ${esc(state.donor.dateOfBirth || '—')}</div>
      <div><span class="summary-key">Decision mode</span> ${esc(decisionModeLabel(state.decisionMode))}</div>
      <div><span class="summary-key">When attorneys can act</span> ${esc(whenAttorneysCanActLabel(state.whenAttorneysCanAct))}</div>
      <div><span class="summary-key">Attorneys</span> ${state.attorneys.length}</div>
      <div><span class="summary-key">Replacement attorneys</span> ${state.replacementAttorneys.length}</div>
      <div><span class="summary-key">People to notify</span> ${state.peopleToNotify.length}</div>
      <div><span class="summary-key">OPG reference</span> ${esc(state.opgReferenceNumber || '—')}</div>
    </div>

    <h3>Attorneys</h3>
    ${attorneysHtml}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = validateLpa(state);
  lastResult = { ...result, timestamp: new Date().toISOString() };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh LPA?')) return;
  clearState();
  state = emptyLpa();
  lastResult = null;
  const report = document.getElementById('report');
  if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the validation report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  host.innerHTML = '';
  for (const r of STEP_RENDERERS) host.appendChild(r());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
