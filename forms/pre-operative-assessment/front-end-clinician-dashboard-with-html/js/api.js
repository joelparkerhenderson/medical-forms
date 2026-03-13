// ──────────────────────────────────────────────
// Backend API client
// ──────────────────────────────────────────────

const API_BASE = 'http://localhost:5150';

/** Fetch patient list from the backend dashboard endpoint. */
export async function fetchPatients() {
	const res = await fetch(`${API_BASE}/api/dashboard/patients`);
	if (!res.ok) {
		throw new Error(`Failed to fetch patients: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();
	return data.items;
}
