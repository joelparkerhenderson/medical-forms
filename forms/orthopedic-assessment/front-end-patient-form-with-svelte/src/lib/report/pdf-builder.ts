import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { dashScoreLabel, calculateAge, sideLabel, onsetTypeLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'ORTHOPEDIC ASSESSMENT REPORT',
			alignment: 'center',
			margin: [0, 20, 0, 0],
			fontSize: 10,
			color: '#6b7280',
			bold: true
		},
		footer: (currentPage: number, pageCount: number) => ({
			text: `Page ${currentPage} of ${pageCount} | Generated ${new Date(result.timestamp).toLocaleString()}`,
			alignment: 'center',
			margin: [0, 20, 0, 0],
			fontSize: 8,
			color: '#9ca3af'
		}),
		content: [
			// Title & DASH Score
			{
				text: result.dashScore !== null ? `DASH Score: ${result.dashScore}/100` : 'DASH Score: Unavailable',
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.dashCategory,
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 20]
			},

			// Patient Details
			sectionHeader('Patient Details'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Name', `${data.demographics.firstName} ${data.demographics.lastName}`),
							field('DOB', `${data.demographics.dateOfBirth}${age ? ` (Age ${age})` : ''}`)
						],
						[
							field('Sex', data.demographics.sex || 'N/A'),
							field('Dominant Hand', data.demographics.dominantHand || 'N/A')
						],
						[
							field('Occupation', data.demographics.occupation || 'N/A'),
							field('Affected Joint', `${data.chiefComplaint.affectedJoint} (${sideLabel(data.chiefComplaint.side)})`)
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Chief Complaint
			sectionHeader('Chief Complaint'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Primary Concern', data.chiefComplaint.primaryConcern || 'N/A'),
							field('Duration', data.chiefComplaint.duration || 'N/A')
						],
						[
							field('Onset Type', onsetTypeLabel(data.chiefComplaint.onsetType) || 'N/A'),
							field('Current Pain', data.painAssessment.currentPainLevel !== null ? `${data.painAssessment.currentPainLevel}/10` : 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Orthopedic Surgeon'),
						{
							ul: result.additionalFlags.map(
								(f) => ({
									text: `[${f.priority.toUpperCase()}] ${f.category}: ${f.message}`,
									color: f.priority === 'high' ? '#dc2626' : f.priority === 'medium' ? '#d97706' : '#4b5563',
									margin: [0, 2, 0, 2] as [number, number, number, number]
								})
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// DASH Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('DASH Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 40],
								body: [
									[
										{ text: 'Question', bold: true, fontSize: 9 },
										{ text: 'Domain', bold: true, fontSize: 9 },
										{ text: 'Item', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.domain, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `${r.score}/5`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...buildMedicationSection(data),

			// Drug Allergies
			...(data.currentTreatment.allergies.length > 0
				? [
						sectionHeader('Drug Allergies'),
						{
							ul: data.currentTreatment.allergies.map(
								(a) =>
									`${a.allergen} - ${a.reaction}${a.severity ? ` (${a.severity})` : ''}`
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: [])
		],
		defaultStyle: {
			fontSize: 10
		}
	};
}

function buildMedicationSection(data: AssessmentData): object[] {
	const sections: object[] = [];
	const allMeds = data.currentTreatment.medications.map(
		(m) => `${m.name} ${m.dose} ${m.frequency}`
	);

	if (allMeds.length > 0) {
		sections.push(sectionHeader('Current Medications'));
		sections.push({
			ul: allMeds,
			margin: [0, 0, 0, 16] as [number, number, number, number]
		});
	}

	return sections;
}

function sectionHeader(text: string) {
	return {
		text,
		fontSize: 14,
		bold: true,
		color: '#1f2937',
		margin: [0, 8, 0, 8] as [number, number, number, number]
	};
}

function field(label: string, value: string) {
	return {
		text: [
			{ text: `${label}: `, bold: true, color: '#6b7280' },
			{ text: value }
		],
		margin: [0, 4, 0, 4] as [number, number, number, number]
	};
}
