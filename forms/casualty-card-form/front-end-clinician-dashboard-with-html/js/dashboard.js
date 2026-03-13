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
  const news2Filter = document.getElementById('news2-filter').value;
  const mtsFilter = document.getElementById('mts-filter').value;
  const allergyFilter = document.getElementById('allergy-filter').value;

  return patients.filter(p => {
    if (search && !(
      p.nhsNumber.toLowerCase().includes(search) ||
      p.patientName.toLowerCase().includes(search) ||
      p.chiefComplaint.toLowerCase().includes(search)
    )) return false;
    if (news2Filter && p.news2Response !== news2Filter) return false;
    if (mtsFilter && p.mtsCategory !== mtsFilter) return false;
    if (allergyFilter === 'yes' && !p.allergyFlag) return false;
    if (allergyFilter === 'no' && p.allergyFlag) return false;
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
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:2rem;">No patients match the current filters.</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(p => {
      const news2Class = 'news2-' + p.news2Response;
      const mtsClass = 'mts-' + p.mtsCategory;
      const mtsBadge = mtsCategoryShort(p.mtsCategory);
      const allergyBadge = p.allergyFlag
        ? '<span class="badge-yes">Yes</span>'
        : '<span class="badge-no">No</span>';
      return '<tr>' +
        '<td>' + esc(p.nhsNumber) + '</td>' +
        '<td>' + esc(p.patientName) + '</td>' +
        '<td><span class="news2-badge ' + news2Class + '">' + p.news2Score + ' (' + capitalize(p.news2Response) + ')</span></td>' +
        '<td><span class="mts-badge ' + mtsClass + '">' + esc(mtsBadge) + '</span></td>' +
        '<td>' + esc(p.chiefComplaint) + '</td>' +
        '<td>' + allergyBadge + '</td>' +
        '</tr>';
    }).join('');
  }

  count.textContent = 'Showing ' + filtered.length + ' of ' + patients.length + ' patients';
}

// ─── Event Binding ─────────────────────────────────────
function bindEvents() {
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('news2-filter').addEventListener('change', renderTable);
  document.getElementById('mts-filter').addEventListener('change', renderTable);
  document.getElementById('allergy-filter').addEventListener('change', renderTable);
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('news2-filter').value = '';
    document.getElementById('mts-filter').value = '';
    document.getElementById('allergy-filter').value = '';
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
  if (!s) return '';
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}

function mtsCategoryShort(cat) {
  switch (cat) {
    case '1-immediate': return '1 Immediate';
    case '2-very-urgent': return '2 Very Urgent';
    case '3-urgent': return '3 Urgent';
    case '4-standard': return '4 Standard';
    case '5-non-urgent': return '5 Non-Urgent';
    default: return cat || '';
  }
}

// ─── Start ─────────────────────────────────────────────
init();
