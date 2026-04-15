const API_BASE = 'http://localhost:5150';

/** Fetch privacy notice acknowledgments from the backend API. */
export async function fetchPatients() {
  const res = await fetch(API_BASE + '/api/dashboard/acknowledgments');
  if (!res.ok) throw new Error('Failed to fetch acknowledgments: ' + res.status);
  const data = await res.json();
  return data.items;
}
