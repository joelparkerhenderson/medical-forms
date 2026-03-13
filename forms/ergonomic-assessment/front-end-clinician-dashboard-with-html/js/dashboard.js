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
  const riskFilter = document.getElementById('risk-filter').value;

  return patients.filter(p => {
    if (search && !(
      p.nhsNumber.toLowerCase().includes(search) ||
      p.patientName.toLowerCase().includes(search) ||
      p.occupation.toLowerCase().includes(search) ||
      p.keyFinding.toLowerCase().includes(search)
    )) return false;
    if (riskFilter && p.riskLevel !== riskFilter) return false;
    return true;
  });
}

// ─── Sorting ───────────────────────────────────────────
function sortPatients(list) {
  return list.sort((a, b) => {
    let va = a[sortColumn];
    let vb = b[sortColumn];
    if (typeof va === 'number') {
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    }
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
      const riskClass = riskColorClass(p.riskLevel);
      const painBadge = painBadgeHtml(p.painSeverity);
      return '<tr>' +
        '<td>' + esc(p.nhsNumber) + '</td>' +
        '<td>' + esc(p.patientName) + '</td>' +
        '<td><span class="risk-badge ' + riskClass + '">REBA ' + p.rebaScore + '</span></td>' +
        '<td><span class="risk-badge ' + riskClass + '">' + esc(p.riskLevel) + '</span></td>' +
        '<td>' + painBadge + '</td>' +
        '<td>' + esc(p.keyFinding) + '</td>' +
        '</tr>';
    }).join('');
  }

  count.textContent = 'Showing ' + filtered.length + ' of ' + patients.length + ' assessments';
}

// ─── Event Binding ─────────────────────────────────────
function bindEvents() {
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('risk-filter').addEventListener('change', renderTable);
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('risk-filter').value = '';
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
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function riskColorClass(riskLevel) {
  if (riskLevel.includes('Negligible')) return 'risk-negligible';
  if (riskLevel.includes('Low')) return 'risk-low';
  if (riskLevel.includes('Medium')) return 'risk-medium';
  if (riskLevel.includes('High') && !riskLevel.includes('Very')) return 'risk-high';
  if (riskLevel.includes('Very high')) return 'risk-very-high';
  return 'risk-low';
}

function painBadgeHtml(severity) {
  if (severity === null || severity === 0) return '<span class="badge-none">0</span>';
  if (severity >= 8) return '<span class="badge-high">' + severity + '/10</span>';
  if (severity >= 5) return '<span class="badge-moderate">' + severity + '/10</span>';
  return '<span class="badge-low">' + severity + '/10</span>';
}

// ─── Start ─────────────────────────────────────────────
init();
