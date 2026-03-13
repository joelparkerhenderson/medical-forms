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
  const severityFilter = document.getElementById('severity-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  const allergyTypeFilter = document.getElementById('allergy-type-filter').value;

  return patients.filter(p => {
    if (search && !(
      p.nhsNumber.toLowerCase().includes(search) ||
      p.patientName.toLowerCase().includes(search)
    )) return false;
    if (severityFilter && p.severityLevel !== severityFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (allergyTypeFilter && p.primaryAllergyType !== allergyTypeFilter) return false;
    return true;
  });
}

// ─── Sorting ───────────────────────────────────────────
function sortPatients(list) {
  return list.sort((a, b) => {
    let va = a[sortColumn];
    let vb = b[sortColumn];
    if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
    if (typeof va === 'number') { return sortAsc ? va - vb : vb - va; }
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
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#6b7280;padding:2rem;">No patients match the current filters.</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(p => {
      const severityClass = 'severity-' + p.severityLevel;
      const statusClass = 'status-' + p.status;
      const flagBadge = p.flagCount > 0
        ? '<span class="flag-count flag-count-nonzero">' + p.flagCount + ' flag' + (p.flagCount !== 1 ? 's' : '') + '</span>'
        : '<span class="flag-count flag-count-zero">0</span>';
      return '<tr>' +
        '<td>' + esc(p.nhsNumber) + '</td>' +
        '<td>' + esc(p.patientName) + '</td>' +
        '<td><span class="severity-badge ' + severityClass + '">' + capitalize(p.severityLevel) + '</span></td>' +
        '<td>' + p.allergenCount + '</td>' +
        '<td>' + esc(p.primaryAllergyType) + '</td>' +
        '<td>' + (p.hasAnaphylaxis ? '<span class="severity-badge severity-severe">Yes</span>' : 'No') + '</td>' +
        '<td>' + flagBadge + '</td>' +
        '<td><span class="status-badge ' + statusClass + '">' + capitalize(p.status) + '</span></td>' +
        '</tr>';
    }).join('');
  }

  count.textContent = 'Showing ' + filtered.length + ' of ' + patients.length + ' patients';
}

// ─── Event Binding ─────────────────────────────────────
function bindEvents() {
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('severity-filter').addEventListener('change', renderTable);
  document.getElementById('status-filter').addEventListener('change', renderTable);
  document.getElementById('allergy-type-filter').addEventListener('change', renderTable);
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('severity-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('allergy-type-filter').value = '';
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

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

// ─── Start ─────────────────────────────────────────────
init();
