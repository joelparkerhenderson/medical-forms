import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { satisfactionScoreLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'ENCOUNTER SATISFACTION REPORT',
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
			// Title & Score
			{
				text: `Satisfaction Score: ${result.compositeScore.toFixed(1)}/5.0`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.category,
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 4]
			},
			{
				text: `${result.answeredCount} of 19 questions answered`,
				fontSize: 10,
				alignment: 'center',
				color: '#9ca3af',
				margin: [0, 0, 0, 20]
			},

			// Patient & Visit Details
			sectionHeader('Patient & Visit Details'),
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
							field('Visit Date', data.visitInformation.visitDate || 'N/A')
						],
						[
							field('Department', data.visitInformation.department || 'N/A'),
							field('Provider', data.visitInformation.providerName || 'N/A')
						],
						[
							field('Visit Type', data.visitInformation.visitType || 'N/A'),
							field('First Visit', data.visitInformation.firstVisit || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Flagged Issues
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues'),
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

			// Domain Breakdown
			...(result.domainScores.length > 0
				? [
						sectionHeader('Score Breakdown by Domain'),
						{
							table: {
								headerRows: 1,
								widths: [120, '*', 50],
								body: [
									[
										{ text: 'Domain', bold: true, fontSize: 9 },
										{ text: 'Questions', bold: true, fontSize: 9 },
										{ text: 'Mean', bold: true, fontSize: 9 }
									],
									...result.domainScores.flatMap((d) => [
										[
											{ text: d.domain, bold: true, fontSize: 9, color: '#1f2937' },
											{ text: '', fontSize: 9 },
											{ text: `${d.mean.toFixed(1)}/5`, fontSize: 9, bold: true }
										],
										...d.questions.map((q) => [
											{ text: q.id, fontSize: 8, color: '#6b7280' },
											{ text: q.text, fontSize: 8 },
											{ text: `${q.score}/5`, fontSize: 8 }
										])
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Comments
			...(data.overallSatisfaction.comments
				? [
						sectionHeader('Patient Comments'),
						{
							text: data.overallSatisfaction.comments,
							fontSize: 10,
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
