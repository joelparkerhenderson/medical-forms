import { patients as samplePatients } from './data.js';
import { fetchPatients } from './api.js';

let patients = [];
let sortColumn = 'patientName';
let sortAsc = true;

// ─── Initialize ────────────────────────────────────────
async function init() {
  try {
    patients = await fetchPatients();
  } catch {
    patients = [...samplePatients];
  }
  renderTable();
  bindEvents();
}

// ─── Filtering ─────────────────────────────────────────
function getFilteredPatients() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const controlFilter = document.getElementById('control-filter').value;
  const typeFilter = document.getElementById('type-filter').value;

  return patients.filter(p => {
    if (search && !(
      p.nhsNumber.toLowerCase().includes(search) ||
      p.patientName.toLowerCase().includes(search)
    )) return false;
    if (controlFilter && p.controlLevel !== controlFilter) return false;
    if (typeFilter && p.diabetesType !== typeFilter) return false;
    return true;
  });
}

// ─── Sorting ───────────────────────────────────────────
function sortPatients(list) {
  return list.sort((a, b) => {
    let va = a[sortColumn];
    let vb = b[sortColumn];
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
}

// ─── Render ────────────────────────────────────────────
function renderTable() {
  const filtered = sortPatients(getFilteredPatients());
  const tbody = document.getElementById('patients-tbody');
  const count = document.getElementById('patient-count');

  // Update sort indicators
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.getAttribute('data-sort') === sortColumn) {
      th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');
    }
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:2rem;">No patients match the current filters.</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(p => {
      const controlClass = 'control-' + p.controlLevel;
      const controlLabel = controlLevelLabel(p.controlLevel);
      const typeLabel = diabetesTypeLabel(p.diabetesType);
      return '<tr>' +
        '<td>' + esc(p.patientName) + '</td>' +
        '<td><span class="badge-type">' + esc(typeLabel) + '</span></td>' +
        '<td>' + p.hba1c + ' mmol/mol</td>' +
        '<td><span class="control-badge ' + controlClass + '">' + esc(controlLabel) + '</span></td>' +
        '<td>' + p.complications + '</td>' +
        '<td>' + esc(p.lastReview) + '</td>' +
        '</tr>';
    }).join('');
  }

  count.textContent = 'Showing ' + filtered.length + ' of ' + patients.length + ' patients';
}

// ─── Event Binding ─────────────────────────────────────
function bindEvents() {
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('control-filter').addEventListener('change', renderTable);
  document.getElementById('type-filter').addEventListener('change', renderTable);
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('control-filter').value = '';
    document.getElementById('type-filter').value = '';
    renderTable();
  });

  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (sortColumn === col) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = col;
        sortAsc = true;
      }
      renderTable();
    });
  });
}

// ─── Utilities ─────────────────────────────────────────
function controlLevelLabel(level) {
  const labels = {
    wellControlled: 'Well Controlled',
    suboptimal: 'Suboptimal',
    poor: 'Poor',
    veryPoor: 'Very Poor',
    draft: 'Draft',
  };
  return labels[level] || 'Unknown';
}

function diabetesTypeLabel(type) {
  const labels = {
    type1: 'Type 1',
    type2: 'Type 2',
    gestational: 'Gestational',
    other: 'Other',
  };
  return labels[type] || type || 'Unknown';
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ─── Start ─────────────────────────────────────────────
init();
