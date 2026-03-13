import { patients as samplePatients } from './data.js';
import { fetchPatients } from './api.js';

let patients = [];
let sortColumn = 'specimenDate';
let sortAsc = false;

// ─── Abnormality Level Labels ─────────────────────────────
function abnormalityLevelLabel(level) {
  switch (level) {
    case 'normal': return 'Normal';
    case 'mildAbnormality': return 'Mild';
    case 'moderateAbnormality': return 'Moderate';
    case 'severeAbnormality': return 'Severe';
    case 'critical': return 'Critical';
    case 'draft': return 'Draft';
    default: return level || 'Unknown';
  }
}

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
  const levelFilter = document.getElementById('level-filter').value;

  return patients.filter(function(p) {
    if (search && !(
      p.patientName.toLowerCase().includes(search) ||
      p.mrn.toLowerCase().includes(search) ||
      p.referringPhysician.toLowerCase().includes(search) ||
      (p.diagnosis || '').toLowerCase().includes(search)
    )) return false;
    if (levelFilter && p.abnormalityLevel !== levelFilter) return false;
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
      const scoreClass = 'score-' + p.abnormalityLevel;
      const label = abnormalityLevelLabel(p.abnormalityLevel);
      const flagBadge = p.flagCount > 0
        ? '<span class="flag-count flag-count-nonzero">' + p.flagCount + ' flag' + (p.flagCount !== 1 ? 's' : '') + '</span>'
        : '';
      return '<tr>' +
        '<td>' + esc(p.patientName) + '</td>' +
        '<td>' + esc(p.mrn) + '</td>' +
        '<td>' + esc(p.specimenDate) + '</td>' +
        '<td>' + esc(p.referringPhysician) + '</td>' +
        '<td><span class="score-badge ' + scoreClass + '">' + label + '</span> ' + flagBadge + '</td>' +
        '<td>' + p.abnormalityScore + '%</td>' +
        '<td>' + esc(p.diagnosis) + '</td>' +
        '</tr>';
    }).join('');
  }

  count.textContent = 'Showing ' + filtered.length + ' of ' + patients.length + ' patients';
}

// ─── Event Binding ─────────────────────────────────────
function bindEvents() {
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('level-filter').addEventListener('change', renderTable);
  document.getElementById('clear-filters').addEventListener('click', function() {
    document.getElementById('search-input').value = '';
    document.getElementById('level-filter').value = '';
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

// ─── Start ─────────────────────────────────────────────
init();
