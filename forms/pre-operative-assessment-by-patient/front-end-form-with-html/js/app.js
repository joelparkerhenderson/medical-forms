// ──────────────────────────────────────────────
// Wizard controller: navigation, data binding, conditional fields
// ──────────────────────────────────────────────

import { createDefaultAssessment } from './data-model.js';
import { calculateBMI, bmiCategory, estimateMETs } from './utils.js';
import { calculateASA } from './asa-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';

// ─── State ───────────────────────────────────────────────────
let assessmentData = createDefaultAssessment();

// ─── Data binding ────────────────────────────────────────────

function getNestedValue(obj, path) {
	return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

function setNestedValue(obj, path, value) {
	const keys = path.split('.');
	const last = keys.pop();
	const target = keys.reduce((o, k) => o[k], obj);
	if (target) target[last] = value;
}

// Listen for changes on all data-field elements
document.addEventListener('change', (e) => {
	const el = e.target;
	const field = el.getAttribute('data-field');
	if (!field) return;

	let value;
	if (el.type === 'number' || el.getAttribute('data-type') === 'number') {
		value = el.value === '' ? null : Number(el.value);
	} else {
		value = el.value;
	}

	setNestedValue(assessmentData, field, value);
	updateConditionals();
	updateComputedFields();
});

// Also listen for input events on text/number fields for immediate feedback
document.addEventListener('input', (e) => {
	const el = e.target;
	const field = el.getAttribute('data-field');
	if (!field) return;
	if (el.type === 'radio') return; // radios handled by change

	let value;
	if (el.type === 'number' || el.getAttribute('data-type') === 'number') {
		value = el.value === '' ? null : Number(el.value);
	} else {
		value = el.value;
	}

	setNestedValue(assessmentData, field, value);
	updateComputedFields();
});

// ─── Conditional visibility ──────────────────────────────────

function updateConditionals() {
	document.querySelectorAll('[data-show-if]').forEach((el) => {
		const condition = el.getAttribute('data-show-if');
		const [fieldPath, values] = condition.split('=');
		const currentValue = getNestedValue(assessmentData, fieldPath);
		const allowedValues = values.split('|');
		const shouldShow = allowedValues.includes(currentValue);
		el.classList.toggle('hidden', !shouldShow);
	});
}

// ─── Computed fields ─────────────────────────────────────────

function updateComputedFields() {
	// BMI
	const bmi = calculateBMI(assessmentData.demographics.weight, assessmentData.demographics.height);
	assessmentData.demographics.bmi = bmi;
	const bmiDisplay = document.getElementById('bmi-display');
	if (bmiDisplay) {
		if (bmi !== null) {
			const cat = bmiCategory(bmi);
			bmiDisplay.textContent = `${bmi} (${cat})`;
			bmiDisplay.className = 'computed-value ' + (bmi < 18.5 || bmi >= 30 ? 'warn' : 'good');
		} else {
			bmiDisplay.textContent = '—';
			bmiDisplay.className = 'computed-value';
		}
	}

	// METs
	const mets = estimateMETs(assessmentData.functionalCapacity.exerciseTolerance);
	assessmentData.functionalCapacity.estimatedMETs = mets;
	const metsDisplay = document.getElementById('mets-display');
	if (metsDisplay) {
		if (mets !== null) {
			const label = mets < 4 ? 'Poor functional capacity' : 'Adequate functional capacity';
			metsDisplay.textContent = `${mets} METs (${label})`;
			metsDisplay.className = 'computed-value ' + (mets < 4 ? 'warn' : 'good');
		} else {
			metsDisplay.textContent = '—';
			metsDisplay.className = 'computed-value';
		}
	}
}

// ─── Dynamic arrays: Medications ─────────────────────────────

document.getElementById('btn-add-medication').addEventListener('click', () => {
	assessmentData.medications.push({ name: '', dose: '', frequency: '' });
	renderMedications();
});

function renderMedications() {
	const list = document.getElementById('medications-list');
	const empty = document.getElementById('meds-empty');
	if (assessmentData.medications.length === 0) {
		list.innerHTML = '';
		list.appendChild(empty);
		empty.classList.remove('hidden');
		return;
	}
	list.innerHTML = '';
	assessmentData.medications.forEach((med, i) => {
		const div = document.createElement('div');
		div.className = 'array-item';
		div.innerHTML = `
			<button class="remove-btn" data-remove-med="${i}" title="Remove">&times;</button>
			<div class="form-row">
				<div class="form-group">
					<label>Medication name</label>
					<input type="text" data-med-field="name" data-med-index="${i}" value="${escapeHtml(med.name)}">
				</div>
				<div class="form-group">
					<label>Dose</label>
					<input type="text" data-med-field="dose" data-med-index="${i}" value="${escapeHtml(med.dose)}">
				</div>
			</div>
			<div class="form-group">
				<label>Frequency</label>
				<input type="text" data-med-field="frequency" data-med-index="${i}" value="${escapeHtml(med.frequency)}">
			</div>
		`;
		list.appendChild(div);
	});
}

document.addEventListener('click', (e) => {
	const idx = e.target.getAttribute('data-remove-med');
	if (idx !== null) {
		assessmentData.medications.splice(Number(idx), 1);
		renderMedications();
	}
});

document.addEventListener('input', (e) => {
	const field = e.target.getAttribute('data-med-field');
	const idx = e.target.getAttribute('data-med-index');
	if (field && idx !== null) {
		assessmentData.medications[Number(idx)][field] = e.target.value;
	}
});

// ─── Dynamic arrays: Allergies ───────────────────────────────

document.getElementById('btn-add-allergy').addEventListener('click', () => {
	assessmentData.allergies.push({ allergen: '', reaction: '', severity: '' });
	renderAllergies();
});

function renderAllergies() {
	const list = document.getElementById('allergies-list');
	const empty = document.getElementById('allergies-empty');
	if (assessmentData.allergies.length === 0) {
		list.innerHTML = '';
		list.appendChild(empty);
		empty.classList.remove('hidden');
		return;
	}
	list.innerHTML = '';
	assessmentData.allergies.forEach((allergy, i) => {
		const div = document.createElement('div');
		div.className = 'array-item';
		div.innerHTML = `
			<button class="remove-btn" data-remove-allergy="${i}" title="Remove">&times;</button>
			<div class="form-row">
				<div class="form-group">
					<label>Allergen</label>
					<input type="text" data-allergy-field="allergen" data-allergy-index="${i}" value="${escapeHtml(allergy.allergen)}">
				</div>
				<div class="form-group">
					<label>Reaction</label>
					<input type="text" data-allergy-field="reaction" data-allergy-index="${i}" value="${escapeHtml(allergy.reaction)}">
				</div>
			</div>
			<div class="form-group">
				<label>Severity</label>
				<select data-allergy-field="severity" data-allergy-index="${i}">
					<option value="" ${allergy.severity === '' ? 'selected' : ''}>Select...</option>
					<option value="mild" ${allergy.severity === 'mild' ? 'selected' : ''}>Mild</option>
					<option value="moderate" ${allergy.severity === 'moderate' ? 'selected' : ''}>Moderate</option>
					<option value="anaphylaxis" ${allergy.severity === 'anaphylaxis' ? 'selected' : ''}>Anaphylaxis</option>
				</select>
			</div>
		`;
		list.appendChild(div);
	});
}

document.addEventListener('click', (e) => {
	const idx = e.target.getAttribute('data-remove-allergy');
	if (idx !== null) {
		assessmentData.allergies.splice(Number(idx), 1);
		renderAllergies();
	}
});

document.addEventListener('input', (e) => {
	const field = e.target.getAttribute('data-allergy-field');
	const idx = e.target.getAttribute('data-allergy-index');
	if (field && idx !== null) {
		assessmentData.allergies[Number(idx)][field] = e.target.value;
	}
});

document.addEventListener('change', (e) => {
	const field = e.target.getAttribute('data-allergy-field');
	const idx = e.target.getAttribute('data-allergy-index');
	if (field && idx !== null) {
		assessmentData.allergies[Number(idx)][field] = e.target.value;
	}
});

// ─── Submit ──────────────────────────────────────────────────

function submitAssessment() {
	// Run grading engine
	const { asaGrade, firedRules } = calculateASA(assessmentData);
	const additionalFlags = detectAdditionalFlags(assessmentData);
	const result = {
		asaGrade,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};

	// Store in sessionStorage for report page
	sessionStorage.setItem('assessmentData', JSON.stringify(assessmentData));
	sessionStorage.setItem('gradingResult', JSON.stringify(result));

	// Navigate to report
	window.location.href = 'report.html';
}

// ─── Helpers ─────────────────────────────────────────────────

function escapeHtml(str) {
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

// ─── Wire Submit ─────────────────────────────────────────────
document.getElementById('btn-submit').addEventListener('click', submitAssessment);
