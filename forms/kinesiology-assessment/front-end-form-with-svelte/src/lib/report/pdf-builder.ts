import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { fmsScoreLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'KINESIOLOGY ASSESSMENT REPORT',
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
			// Title & FMS Score
			{
				text: `FMS Score: ${result.fmsScore}/21`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.fmsCategory,
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
							field('Sport/Activity', data.referralInfo.sportOrActivity || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Referral Information
			sectionHeader('Referral Information'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Referring Provider', data.referralInfo.referringProvider || 'N/A'),
							field('Referral Date', data.referralInfo.referralDate || 'N/A')
						],
						[
							field('Reason', data.referralInfo.referralReason || 'N/A'),
							field('Activity Level', data.movementHistory.activityLevel || 'N/A')
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

			// FMS Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('FMS Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [50, 100, '*', 40],
								body: [
									[
										{ text: 'Pattern', bold: true, fontSize: 9 },
										{ text: 'Movement', bold: true, fontSize: 9 },
										{ text: 'Description', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.pattern, fontSize: 9 },
										{ text: r.description, fontSize: 8, color: '#6b7280' },
										{ text: `${r.score}/3`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Movement History
			...(data.movementHistory.injuryHistory || data.movementHistory.previousTreatments
				? [
						sectionHeader('Movement History'),
						...(data.movementHistory.injuryHistory
							? [{ text: [{ text: 'Injury History: ', bold: true, color: '#6b7280' }, data.movementHistory.injuryHistory], margin: [0, 2, 0, 2] as [number, number, number, number] }]
							: []),
						...(data.movementHistory.previousTreatments
							? [{ text: [{ text: 'Previous Treatments: ', bold: true, color: '#6b7280' }, data.movementHistory.previousTreatments], margin: [0, 2, 0, 2] as [number, number, number, number] }]
							: [])
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
