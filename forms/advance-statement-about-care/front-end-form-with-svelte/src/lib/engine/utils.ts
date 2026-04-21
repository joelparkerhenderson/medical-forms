/** Completeness level label. */
export function completenessLevelLabel(level: string): string {
	switch (level) {
		case 'incomplete':
			return 'Incomplete';
		case 'partial':
			return 'Partial';
		case 'complete':
			return 'Complete';
		case 'verified':
			return 'Verified';
		default:
			return level;
	}
}

/** Completeness level colour class. */
export function completenessLevelColor(level: string): string {
	switch (level) {
		case 'incomplete':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'partial':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'complete':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'verified':
			return 'bg-blue-100 text-blue-800 border-blue-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Calculate age from date of birth string. */
export function calculateAge(dob: string): number | null {
	if (!dob) return null;
	const birth = new Date(dob);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}

/** Format date for display (DD/MM/YYYY). */
export function formatDate(dateStr: string): string {
	if (!dateStr) return 'Not specified';
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return dateStr;
	return date.toLocaleDateString('en-GB');
}

/** Get priority colour class. */
export function priorityColor(priority: string): string {
	switch (priority) {
		case 'high':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'medium':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'low':
			return 'bg-gray-100 text-gray-700 border-gray-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Place of care/death label. */
export function placeLabel(place: string): string {
	switch (place) {
		case 'home':
			return 'Home';
		case 'hospital':
			return 'Hospital';
		case 'hospice':
			return 'Hospice';
		case 'care-home':
			return 'Care Home';
		case 'no-preference':
			return 'No Preference';
		default:
			return place || 'Not specified';
	}
}
