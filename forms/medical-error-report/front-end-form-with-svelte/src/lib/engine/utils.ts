import type { WHOSeverity, NCCMERPCategory, RiskLevel } from './types';

/** WHO Severity Scale label. */
export function whoSeverityLabel(severity: WHOSeverity): string {
	switch (severity) {
		case 'near-miss':
			return 'Near Miss - No harm reached patient';
		case 'mild':
			return 'Mild - Temporary minor harm';
		case 'moderate':
			return 'Moderate - Temporary significant harm';
		case 'severe':
			return 'Severe - Permanent harm';
		case 'critical':
			return 'Critical - Death or life-threatening';
		default:
			return 'Not classified';
	}
}

/** NCC MERP Category label. */
export function nccMerpLabel(category: NCCMERPCategory): string {
	switch (category) {
		case 'A':
			return 'Category A - Capacity to cause error';
		case 'B':
			return 'Category B - Error did not reach patient';
		case 'C':
			return 'Category C - Reached patient, no harm';
		case 'D':
			return 'Category D - Required monitoring, no harm';
		case 'E':
			return 'Category E - Temporary harm, intervention required';
		case 'F':
			return 'Category F - Temporary harm, hospitalisation';
		case 'G':
			return 'Category G - Permanent harm';
		case 'H':
			return 'Category H - Intervention to sustain life';
		case 'I':
			return 'Category I - Patient death';
		default:
			return 'Not classified';
	}
}

/** Overall risk level label. */
export function riskLevelLabel(risk: RiskLevel): string {
	switch (risk) {
		case 'low':
			return 'Low Risk';
		case 'moderate':
			return 'Moderate Risk';
		case 'high':
			return 'High Risk';
		case 'critical':
			return 'Critical Risk';
	}
}

/** WHO Severity numeric grade (for Badge component). */
export function whoSeverityGrade(severity: WHOSeverity): number {
	switch (severity) {
		case 'near-miss':
			return 1;
		case 'mild':
			return 2;
		case 'moderate':
			return 3;
		case 'severe':
			return 4;
		case 'critical':
			return 5;
		default:
			return 0;
	}
}

/** Grade label (used by Badge component). */
export function gradeLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Grade 1 - Minimal';
		case 2:
			return 'Grade 2 - Mild';
		case 3:
			return 'Grade 3 - Moderate';
		case 4:
			return 'Grade 4 - Severe';
		case 5:
			return 'Grade 5 - Critical';
		default:
			return `Grade ${grade}`;
	}
}

/** Grade colour class (used by Badge component). */
export function gradeColor(grade: number): string {
	switch (grade) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 3:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 4:
			return 'bg-red-100 text-red-800 border-red-300';
		case 5:
			return 'bg-red-200 text-red-900 border-red-500';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Risk level colour class. */
export function riskLevelColor(risk: RiskLevel): string {
	switch (risk) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'critical':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

/** Count contributing factors that are 'yes'. */
export function countContributingFactors(data: {
	staffFatigue: string;
	inadequateTraining: string;
	communicationFailure: string;
	handoverFailure: string;
	equipmentFailure: string;
	environmentalFactors: string;
	policyNotFollowed: string;
	workloadPressure: string;
	patientFactors: string;
}): number {
	const fields = [
		data.staffFatigue,
		data.inadequateTraining,
		data.communicationFailure,
		data.handoverFailure,
		data.equipmentFailure,
		data.environmentalFactors,
		data.policyNotFollowed,
		data.workloadPressure,
		data.patientFactors
	];
	return fields.filter((f) => f === 'yes').length;
}

/** Error type display label. */
export function errorTypeLabel(errorType: string): string {
	const labels: Record<string, string> = {
		medication: 'Medication Error',
		surgical: 'Surgical Error',
		diagnostic: 'Diagnostic Error',
		treatment: 'Treatment Error',
		communication: 'Communication Error',
		equipment: 'Equipment Error',
		fall: 'Fall',
		infection: 'Healthcare-Associated Infection',
		transfusion: 'Transfusion Error',
		other: 'Other'
	};
	return labels[errorType] || errorType || 'Not specified';
}
