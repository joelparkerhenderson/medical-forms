// ──────────────────────────────────────────────
// Dashboard: sort, filter, render table
// ──────────────────────────────────────────────

import { patients as samplePatients } from './data.js';
import { fetchPatients } from './api.js';

const asaRoman = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// ─── State ───────────────────────────────────────────────────
let patients = [...samplePatients];
let sortKey = 'patientName';
let sortOrder = 'asc';

// ─── DOM refs ────────────────────────────────────────────────
const tbody = document.getElementById('patient-tbody');
const searchInput = document.getElementById('search');
const asaSelect = document.getElementById('asa-filter');
const allergySelect = document.getElementById('allergy-filter');
const adverseSelect = document.getElementById('adverse-filter');
const clearBtn = document.getElementById('btn-clear');
const summaryEl = document.getElementById('summary');

// ─── Load from backend ──────────────────────────────────────
fetchPatients()
	.then((items) => {
		if (items && items.length > 0) {
			patients = items;
		}
		render();
	})
	.catch(() => {
		// Backend unavailable — use sample data
		render();
	});

// ─── Sorting ─────────────────────────────────────────────────
document.querySelectorAll('thead th[data-sort]').forEach((th) => {
	th.addEventListener('click', () => {
		const key = th.getAttribute('data-sort');
		if (sortKey === key) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortOrder = 'asc';
		}
		render();
	});
});

// ─── Filtering ───────────────────────────────────────────────
searchInput.addEventListener('input', render);
asaSelect.addEventListener('change', render);
allergySelect.addEventListener('change', render);
adverseSelect.addEventListener('change', render);
clearBtn.addEventListener('click', () => {
	searchInput.value = '';
	asaSelect.value = '';
	allergySelect.value = '';
	adverseSelect.value = '';
	render();
});

// ─── Render ──────────────────────────────────────────────────
function render() {
	const term = searchInput.value.toLowerCase();
	const asaFilter = asaSelect.value;
	const allergyFilter = allergySelect.value;
	const adverseFilter = adverseSelect.value;

	// Filter
	let filtered = patients.filter((p) => {
		if (term) {
			const matches =
				p.nhsNumber.toLowerCase().includes(term) ||
				p.patientName.toLowerCase().includes(term) ||
				p.surgeryProcedure.toLowerCase().includes(term);
			if (!matches) return false;
		}
		if (asaFilter && p.asaGrade !== Number(asaFilter)) return false;
		if (allergyFilter === 'yes' && !p.allergyFlag) return false;
		if (allergyFilter === 'no' && p.allergyFlag) return false;
		if (adverseFilter === 'yes' && !p.previousAdverseIncident) return false;
		if (adverseFilter === 'no' && p.previousAdverseIncident) return false;
		return true;
	});

	// Sort
	filtered.sort((a, b) => {
		let av = a[sortKey];
		let bv = b[sortKey];
		if (typeof av === 'string') av = av.toLowerCase();
		if (typeof bv === 'string') bv = bv.toLowerCase();
		if (typeof av === 'boolean') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
		if (av < bv) return sortOrder === 'asc' ? -1 : 1;
		if (av > bv) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	});

	// Update column headers
	document.querySelectorAll('thead th[data-sort]').forEach((th) => {
		const key = th.getAttribute('data-sort');
		th.classList.remove('sorted-asc', 'sorted-desc');
		const arrow = th.querySelector('.sort-arrow');
		if (key === sortKey) {
			th.classList.add(sortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
			if (arrow) arrow.textContent = sortOrder === 'asc' ? '\u25B2' : '\u25BC';
		} else {
			if (arrow) arrow.textContent = '\u25B4';
		}
	});

	// Render rows
	tbody.innerHTML = '';
	for (const p of filtered) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(p.nhsNumber)}</td>
			<td>${escapeHtml(p.patientName)}</td>
			<td><span class="badge badge-asa-${p.asaGrade}">ASA ${asaRoman[p.asaGrade - 1] || p.asaGrade}</span></td>
			<td>${escapeHtml(p.surgeryProcedure)}</td>
			<td><span class="badge ${p.allergyFlag ? 'badge-yes' : 'badge-no'}">${p.allergyFlag ? 'Yes' : 'No'}</span></td>
			<td><span class="badge ${p.previousAdverseIncident ? 'badge-yes' : 'badge-no'}">${p.previousAdverseIncident ? 'Yes' : 'No'}</span></td>
		`;
		tbody.appendChild(tr);
	}

	// Update summary
	summaryEl.textContent = `${filtered.length} of ${patients.length} patients`;

	// Show/hide clear button
	const hasFilters = term || asaFilter || allergyFilter || adverseFilter;
	clearBtn.classList.toggle('hidden', !hasFilters);
}

function escapeHtml(str) {
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

// Initial render
render();
