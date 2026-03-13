const API_BASE = 'http://localhost:5150';

/** Post casualty card data to the backend API. */
export async function submitCasualtyCard(data, result) {
  const res = await fetch(API_BASE + '/api/casualty-cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, result })
  });
  if (!res.ok) throw new Error('Failed to submit: ' + res.status);
  return res.json();
}
