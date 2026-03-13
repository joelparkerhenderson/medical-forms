import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { copmScoreLabel, calculateAge, difficultyLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'OCCUPATIONAL THERAPY ASSESSMENT REPORT',
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
			// Title & COPM Scores
			{
				text: `COPM Performance Score: ${result.performanceScore}/10`,
				fontSize: 20,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.performanceCategory,
				fontSize: 12,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 8]
			},
			{
				text: `COPM Satisfaction Score: ${result.satisfactionScore}/10`,
				fontSize: 20,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.satisfactionCategory,
				fontSize: 12,
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
							field('Primary Diagnosis', data.referralInfo.primaryDiagnosis || 'N/A')
						],
						[
							field('Referral Source', data.referralInfo.referralSource || 'N/A'),
							field('Referring Clinician', data.referralInfo.referringClinician || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Activity Difficulty Summary
			sectionHeader('Activity Difficulty Summary'),
			{
				table: {
					widths: ['*', '*', '*'],
					body: [
						[
							{ text: 'Self-Care', bold: true, fontSize: 9 },
							{ text: 'Productivity', bold: true, fontSize: 9 },
							{ text: 'Leisure', bold: true, fontSize: 9 }
						],
						[
							{
								text: [
									`Personal Care: ${difficultyLabel(data.selfCareActivities.personalCare.difficulty) || 'N/A'}\n`,
									`Functional Mobility: ${difficultyLabel(data.selfCareActivities.functionalMobility.difficulty) || 'N/A'}\n`,
									`Community Mgmt: ${difficultyLabel(data.selfCareActivities.communityManagement.difficulty) || 'N/A'}`
								],
								fontSize: 8
							},
							{
								text: [
									`Paid Work: ${difficultyLabel(data.productivityActivities.paidWork.difficulty) || 'N/A'}\n`,
									`Household: ${difficultyLabel(data.productivityActivities.householdManagement.difficulty) || 'N/A'}\n`,
									`Education: ${difficultyLabel(data.productivityActivities.education.difficulty) || 'N/A'}`
								],
								fontSize: 8
							},
							{
								text: [
									`Quiet Recreation: ${difficultyLabel(data.leisureActivities.quietRecreation.difficulty) || 'N/A'}\n`,
									`Active Recreation: ${difficultyLabel(data.leisureActivities.activeRecreation.difficulty) || 'N/A'}\n`,
									`Social: ${difficultyLabel(data.leisureActivities.socialParticipation.difficulty) || 'N/A'}`
								],
								fontSize: 8
							}
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Occupational Therapist'),
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

			// COPM Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('COPM Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 40],
								body: [
									[
										{ text: 'ID', bold: true, fontSize: 9 },
										{ text: 'Domain', bold: true, fontSize: 9 },
										{ text: 'Activity', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.domain, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `${r.score}/10`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Goals
			...(data.goalsPriorities.shortTermGoals || data.goalsPriorities.longTermGoals
				? [
						sectionHeader('Goals & Priorities'),
						{
							ul: [
								...(data.goalsPriorities.shortTermGoals ? [`Short-Term: ${data.goalsPriorities.shortTermGoals}`] : []),
								...(data.goalsPriorities.longTermGoals ? [`Long-Term: ${data.goalsPriorities.longTermGoals}`] : []),
								...(data.goalsPriorities.priorityAreas ? [`Priority Areas: ${data.goalsPriorities.priorityAreas}`] : []),
								...(data.goalsPriorities.dischargeGoals ? [`Discharge Goals: ${data.goalsPriorities.dischargeGoals}`] : [])
							],
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
