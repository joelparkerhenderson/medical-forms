import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { severityLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'MENTAL HEALTH ASSESSMENT REPORT',
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
			// Scores
			{
				columns: [
					{
						width: '*',
						text: [
							{ text: 'PHQ-9 Depression: ', bold: true, fontSize: 14 },
							{ text: `${result.phq9.score}/${result.phq9.maxScore}`, fontSize: 14, bold: true },
							{ text: `\n${severityLabel(result.phq9.severity)}`, fontSize: 11, color: '#4b5563' }
						],
						alignment: 'center'
					},
					{
						width: '*',
						text: [
							{ text: 'GAD-7 Anxiety: ', bold: true, fontSize: 14 },
							{ text: `${result.gad7.score}/${result.gad7.maxScore}`, fontSize: 14, bold: true },
							{ text: `\n${severityLabel(result.gad7.severity)}`, fontSize: 11, color: '#4b5563' }
						],
						alignment: 'center'
					}
				],
				margin: [0, 0, 0, 20] as [number, number, number, number]
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
							field('Emergency Contact', `${data.demographics.emergencyContactName} (${data.demographics.emergencyContactRelationship})`)
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Risk Assessment
			sectionHeader('Risk Assessment'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Suicidal Ideation', data.riskAssessment.suicidalIdeation || 'Not assessed'),
							field('Self-Harm', data.riskAssessment.selfHarm || 'Not assessed')
						],
						[
							field('Harm to Others', data.riskAssessment.harmToOthers || 'Not assessed'),
							field('Safety Plan', data.riskAssessment.hasSafetyPlan || 'N/A')
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

			// Psychiatric Medications
			...(data.currentMedications.psychiatricMedications.length > 0
				? [
						sectionHeader('Psychiatric Medications'),
						{
							ul: data.currentMedications.psychiatricMedications.map(
								(m) => `${m.name} ${m.dose} ${m.frequency}`
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Other Medications
			...(data.currentMedications.otherMedications.length > 0
				? [
						sectionHeader('Other Medications'),
						{
							ul: data.currentMedications.otherMedications.map(
								(m) => `${m.name} ${m.dose} ${m.frequency}`
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Social & Functional
			sectionHeader('Social & Functional Status'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Employment', data.socialFunctional.employmentStatus || 'N/A'),
							field('Relationship', data.socialFunctional.relationshipStatus || 'N/A')
						],
						[
							field('Housing', data.socialFunctional.housingStatus || 'N/A'),
							field('Support System', data.socialFunctional.supportSystem || 'N/A')
						],
						[
							field('Functional Impairment', data.socialFunctional.functionalImpairment || 'N/A'),
							field('', '')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			}
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
