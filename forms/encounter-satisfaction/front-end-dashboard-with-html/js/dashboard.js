import { patients as samplePatients } from './data.js';
import { fetchPatients } from './api.js';

let patients = [];
let sortColumn = 'visitDate';
let sortAsc = false;

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
  const categoryFilter = document.getElementById('category-filter').value;
  const departmentFilter = document.getElementById('department-filter').value;

  return patients.filter(function(p) {
    if (search && !(
      p.patientName.toLowerCase().includes(search) ||
      p.providerName.toLowerCase().includes(search) ||
      p.department.toLowerCase().includes(search)
    )) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (departmentFilter && p.department !== departmentFilter) return false;
    return true;
  });
}

// ─── Sorting ───────────────────────────────────────────
function sortPatients(list) {
  return list.sort(function(a, b) {
    let va = a[sortColumn];
    let vb = b[sortColumn];
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
  document.querySelectorAll('th[data-sort]').forEach(function(th) {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.getAttribute('data-sort') === sortColumn) {
      th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');
    }
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;padding:2rem;">No patients match the current filters.</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(function(p) {
      const scoreClass = p.compositeScore >= 4.5 ? 'score-excellent'
        : p.compositeScore >= 3.5 ? 'score-good'
        : p.compositeScore >= 2.5 ? 'score-fair'
        : p.compositeScore >= 1.5 ? 'score-poor'
        : 'score-very-poor';
      const flagBadge = p.flagCount > 0
        ? '<span class="flag-count flag-count-nonzero">' + p.flagCount + ' flag' + (p.flagCount !== 1 ? 's' : '') + '</span>'
        : '';
      return '<tr>' +
        '<td>' + esc(p.patientName) + '</td>' +
        '<td>' + esc(p.department) + '</td>' +
        '<td>' + esc(p.providerName) + '</td>' +
        '<td>' + capitalize(esc((p.visitType || '').replace(/-/g, ' '))) + '</td>' +
        '<td><span class="score-badge ' + scoreClass + '">' + p.compositeScore.toFixed(1) + ' - ' + esc(p.category) + '</span> ' + flagBadge + '</td>' +
        '<td>' + esc(p.visitDate) + '</td>' +
        '</tr>';
    }).join('');
  }

  count.textContent = 'Showing ' + filtered.length + ' of ' + patients.length + ' patients';
}

// ─── Event Binding ─────────────────────────────────────
function bindEvents() {
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('category-filter').addEventListener('change', renderTable);
  document.getElementById('department-filter').addEventListener('change', renderTable);
  document.getElementById('clear-filters').addEventListener('click', function() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('department-filter').value = '';
    renderTable();
  });

  document.querySelectorAll('th[data-sort]').forEach(function(th) {
    th.addEventListener('click', function() {
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
