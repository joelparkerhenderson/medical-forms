const API_BASE = 'http://localhost:5150';

export async function submitAssessment(data) {
    try {
        const res = await fetch(API_BASE + '/api/assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to submit: ' + res.status);
        return await res.json();
    } catch (e) {
        console.warn('Backend not available, using client-side only:', e.message);
        return null;
    }
}
