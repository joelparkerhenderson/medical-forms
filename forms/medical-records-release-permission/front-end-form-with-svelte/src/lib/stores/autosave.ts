import type { AssessmentData } from '$lib/engine/types';

const STORAGE_KEY = 'medical-records-release-permission-autosave';

/** Save assessment data to localStorage. */
export function saveToStorage(data: AssessmentData): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Storage full or unavailable — silently ignore
	}
}

/** Load assessment data from localStorage. Returns null if not found or invalid. */
export function loadFromStorage(): AssessmentData | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as AssessmentData;
	} catch {
		return null;
	}
}

/** Clear saved assessment data from localStorage. */
export function clearStorage(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Silently ignore
	}
}
