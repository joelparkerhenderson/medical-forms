import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { mcasScoreLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'MCAS ASSESSMENT REPORT',
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
			// Title & MCAS Score
			{
				text: `MCAS Symptom Score: ${result.symptomScore}/40`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `${result.mcasCategory} | ${result.organSystemsAffected} organ system(s) affected`,
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
							field('Symptom Duration', data.symptomOverview.symptomDuration || 'N/A')
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

			// Symptom Score Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('Symptom Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [80, 80, '*', 40],
								body: [
									[
										{ text: 'ID', bold: true, fontSize: 9 },
										{ text: 'System', bold: true, fontSize: 9 },
										{ text: 'Symptom', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.domain, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `${r.score}/3`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Triggers
			sectionHeader('Triggers & Patterns'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Food Triggers', data.triggersPatterns.foodTriggers || 'None reported'),
							field('Environmental', data.triggersPatterns.environmentalTriggers || 'None reported')
						],
						[
							field('Stress Trigger', data.triggersPatterns.stressTriggers || 'N/A'),
							field('Exercise Trigger', data.triggersPatterns.exerciseTrigger || 'N/A')
						],
						[
							field('Temperature Trigger', data.triggersPatterns.temperatureTrigger || 'N/A'),
							field('Medication Triggers', data.triggersPatterns.medicationTriggers || 'None reported')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Laboratory Results
			sectionHeader('Laboratory Results'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Serum Tryptase', data.laboratoryResults.serumTryptase !== null ? `${data.laboratoryResults.serumTryptase} ng/mL` : 'Not tested'),
							field('Plasma Histamine', data.laboratoryResults.histamine !== null ? `${data.laboratoryResults.histamine} ng/mL` : 'Not tested')
						],
						[
							field('Prostaglandin D2', data.laboratoryResults.prostaglandinD2 !== null ? `${data.laboratoryResults.prostaglandinD2} ng/mL` : 'Not tested'),
							field('Chromogranin A', data.laboratoryResults.chromograninA !== null ? `${data.laboratoryResults.chromograninA} ng/mL` : 'Not tested')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Current Treatment
			sectionHeader('Current Treatment'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Antihistamines', data.currentTreatment.antihistamines || 'N/A'),
							field('Mast Cell Stabilizers', data.currentTreatment.mastCellStabilizers || 'N/A')
						],
						[
							field('Leukotriene Inhibitors', data.currentTreatment.leukotrienInhibitors || 'N/A'),
							field('Epinephrine', data.currentTreatment.epinephrine || 'N/A')
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
