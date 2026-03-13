// ──────────────────────────────────────────────
// Optional backend API client
// ──────────────────────────────────────────────

const API_BASE = 'http://localhost:5150';

/** Submit assessment data to backend. Returns the created assessment. */
export async function submitAssessment(data) {
	const res = await fetch(`${API_BASE}/api/assessments`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data })
	});
	if (!res.ok) {
		throw new Error(`Failed to submit assessment: ${res.status} ${res.statusText}`);
	}
	return res.json();
}

/** Request the backend to grade an assessment. */
export async function gradeAssessment(id) {
	const res = await fetch(`${API_BASE}/api/assessments/${id}/grade`, {
		method: 'POST'
	});
	if (!res.ok) {
		throw new Error(`Failed to grade assessment: ${res.status} ${res.statusText}`);
	}
	return res.json();
}
