const API_BASE = 'http://localhost:5200';

export async function submitAssessment(data) {
  try {
    const res = await fetch(`${API_BASE}/api/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}
