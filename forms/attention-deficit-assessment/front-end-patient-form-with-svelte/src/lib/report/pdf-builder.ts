import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { asrsClassificationLabel, adhdSubtypeLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'ADHD ASSESSMENT REPORT (ASRS v1.1)',
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
			// Title & Classification
			{
				text: `ASRS Total: ${result.asrsTotal}/72`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: asrsClassificationLabel(result.classification),
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 4]
			},
			{
				text: adhdSubtypeLabel(result.subtype),
				fontSize: 12,
				alignment: 'center',
				color: '#6b7280',
				margin: [0, 0, 0, 20]
			},

			// Score Breakdown
			sectionHeader('Score Breakdown'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Part A Score', `${result.partAScore}/24`),
							field('Part B Score', `${result.partBScore}/48`)
						],
						[
							field('Inattentive Subscore', `${result.inattentiveSubscore}`),
							field('Hyperactive-Impulsive Subscore', `${result.hyperactiveImpulsiveSubscore}`)
						],
						[
							field('Part A Screener', result.partAScreenerPositive ? 'POSITIVE' : 'Negative'),
							field('Classification', asrsClassificationLabel(result.classification))
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
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
							field('Occupation', data.demographics.occupation || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Clinician'),
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

			// Fired Rules
			...(result.firedRules.length > 0
				? [
						sectionHeader('Classification Justification'),
						{
							table: {
								headerRows: 1,
								widths: [70, 90, '*', 70],
								body: [
									[
										{ text: 'Rule ID', bold: true, fontSize: 9 },
										{ text: 'Domain', bold: true, fontSize: 9 },
										{ text: 'Finding', bold: true, fontSize: 9 },
										{ text: 'Level', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.domain, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: asrsClassificationLabel(r.classification), fontSize: 8, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...(data.medications.length > 0
				? [
						sectionHeader('Medications'),
						{
							ul: data.medications.map(
								(m) => `${m.name} ${m.dose} ${m.frequency}`
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Allergies
			...(data.allergies.length > 0
				? [
						sectionHeader('Allergies'),
						{
							ul: data.allergies.map(
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
