import type { SeverityCategory } from './types';

export function categoryColor(category: SeverityCategory): string {
	switch (category) {
		case 'Minimal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'Mild':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'Moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'Severe':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

export function categoryDescription(category: SeverityCategory): string {
	switch (category) {
		case 'Minimal':
			return 'Below clinical concern';
		case 'Mild':
			return 'Sub-threshold symptoms; monitor and offer support';
		case 'Moderate':
			return 'Probable PTSD (≥ 33 is the recommended provisional cut-off); diagnostic interview recommended';
		case 'Severe':
			return 'Clinically significant PTSD; trauma-focused therapy indicated';
	}
}
