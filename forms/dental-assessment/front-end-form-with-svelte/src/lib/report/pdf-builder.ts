import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { dmftCategoryLabel, dmftScoreLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'DENTAL ASSESSMENT REPORT',
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
			// Title & DMFT Score
			{
				text: `DMFT Score: ${result.dmftScore}`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: dmftCategoryLabel(result.dmftCategory),
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 4]
			},
			{
				text: `D = ${data.dmftAssessment.decayedTeeth ?? 0} | M = ${data.dmftAssessment.missingTeeth ?? 0} | F = ${data.dmftAssessment.filledTeeth ?? 0}`,
				fontSize: 11,
				alignment: 'center',
				color: '#6b7280',
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
							field('Chief Complaint', data.chiefComplaint.primaryConcern || 'N/A')
						],
						[
							field('Pain Severity', data.chiefComplaint.painSeverity !== null ? `${data.chiefComplaint.painSeverity}/10` : 'N/A'),
							field('Oral Hygiene', data.oralExamination.oralHygieneIndex || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Dental Clinician'),
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
						sectionHeader('Assessment Findings'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 70],
								body: [
									[
										{ text: 'Rule ID', bold: true, fontSize: 9 },
										{ text: 'System', bold: true, fontSize: 9 },
										{ text: 'Finding', bold: true, fontSize: 9 },
										{ text: 'Category', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.system, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: dmftScoreLabel(0), fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Periodontal Summary
			sectionHeader('Periodontal Status'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Gum Bleeding', data.periodontalAssessment.gumBleeding || 'N/A'),
							field('Pocket Depths', data.periodontalAssessment.pocketDepthsAboveNormal || 'N/A')
						],
						[
							field('Gum Recession', data.periodontalAssessment.gumRecession || 'N/A'),
							field('Tooth Mobility', data.periodontalAssessment.toothMobility || 'N/A')
						],
						[
							field('Furcation', data.periodontalAssessment.furcationInvolvement || 'N/A'),
							field('Bone Loss', data.radiographicFindings.boneLossPattern || 'N/A')
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
