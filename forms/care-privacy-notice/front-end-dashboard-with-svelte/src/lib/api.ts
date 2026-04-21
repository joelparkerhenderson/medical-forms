import type { DashboardResponse, AcknowledgmentRow } from './types.ts';

const API_BASE = 'http://localhost:5150';

/** Fetch acknowledgment list from the backend dashboard endpoint. */
export async function fetchAcknowledgments(): Promise<AcknowledgmentRow[]> {
	const res = await fetch(`${API_BASE}/api/dashboard/acknowledgments`);
	if (!res.ok) {
		throw new Error(`Failed: ${res.status} ${res.statusText}`);
	}
	const data: DashboardResponse = await res.json();
	return data.items;
}
