import type { DashboardResponse } from './types';
import { sampleData } from './data';

const API_BASE = '/api';

export async function fetchAcknowledgments(): Promise<DashboardResponse> {
	try {
		const response = await fetch(`${API_BASE}/acknowledgments`);
		if (!response.ok) throw new Error('API unavailable');
		return await response.json();
	} catch {
		return { items: sampleData, total: sampleData.length };
	}
}
