import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { nihssSeverityLabel, mrsLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'NEUROLOGY ASSESSMENT REPORT',
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
			// Title & NIHSS Score
			{
				text: `NIHSS Score: ${result.nihssScore}`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: nihssSeverityLabel(result.nihssScore),
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
							field('mRS', data.functionalSocial.mrsScore !== null ? mrsLabel(data.functionalSocial.mrsScore) : 'N/A')
						],
						[
							field('Chief Complaint', data.chiefComplaint.primarySymptom || 'N/A'),
							field('Onset', data.chiefComplaint.onsetType || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Neurologist'),
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

			// NIHSS Item Scores
			...(result.firedRules.length > 0
				? [
						sectionHeader('NIHSS Item Scores'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 40],
								body: [
									[
										{ text: 'Item', bold: true, fontSize: 9 },
										{ text: 'Category', bold: true, fontSize: 9 },
										{ text: 'Description', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.category, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: String(r.score), fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...(data.currentMedications.medications.length > 0
				? [
						sectionHeader('Medications'),
						{
							ul: data.currentMedications.medications.map(
								(m) => `${m.name} ${m.dose} ${m.frequency}`
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
