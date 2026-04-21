import type { DashboardPatientsResponse, PatientRow } from './types.ts';

const API_BASE = 'http://localhost:5210';

/** Fetch patient list from the backend dashboard endpoint. */
export async function fetchPatients(): Promise<PatientRow[]> {
	const res = await fetch(`${API_BASE}/api/dashboard/patients`);
	if (!res.ok) {
		throw new Error(`Failed to fetch patients: ${res.status} ${res.statusText}`);
	}
	const data: DashboardPatientsResponse = await res.json();
	return data.items;
}
