import type { DashboardPrescriptionsResponse, PrescriptionRow } from './types.ts';

const API_BASE = 'http://localhost:5150';

/** Fetch prescription list from the backend dashboard endpoint. */
export async function fetchPrescriptions(): Promise<PrescriptionRow[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/prescriptions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch prescriptions: ${res.status} ${res.statusText}`);
  }
  const data: DashboardPrescriptionsResponse = await res.json();
  return data.items;
}
