import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { actScoreLabel, bmiCategory, calculateAge, controlLevelLabel, fev1Severity } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);
	const bmi = data.demographics.bmi;

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'ASTHMA ASSESSMENT REPORT',
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
			// Title & ACT Score
			{
				text: `ACT Score: ${result.actScore}`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: controlLevelLabel(result.controlLevel),
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
							field('BMI', bmi ? `${bmi} (${bmiCategory(bmi)})` : 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Lung Function
			...(data.lungFunction.fev1Percent !== null || data.lungFunction.peakFlowPercent !== null
				? [
						sectionHeader('Lung Function'),
						{
							table: {
								widths: ['*', '*'],
								body: [
									[
										field('FEV1', data.lungFunction.fev1Percent !== null ? `${data.lungFunction.fev1Percent}% (${fev1Severity(data.lungFunction.fev1Percent)})` : 'N/A'),
										field('FEV1/FVC', data.lungFunction.fev1Fvc !== null ? `${data.lungFunction.fev1Fvc}` : 'N/A')
									],
									[
										field('Peak Flow', data.lungFunction.peakFlowCurrent !== null ? `${data.lungFunction.peakFlowCurrent} L/min` : 'N/A'),
										field('Peak Flow %', data.lungFunction.peakFlowPercent !== null ? `${data.lungFunction.peakFlowPercent}% of best` : 'N/A')
									]
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// ACT Score Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('ACT Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [60, '*', 50],
								body: [
									[
										{ text: 'Question', bold: true, fontSize: 9 },
										{ text: 'Category', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.category, fontSize: 9 },
										{ text: `${r.score}/5`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

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

			// Medications
			...(data.currentMedications.controllerMedications.length > 0 ||
				data.currentMedications.rescueInhalers.length > 0 ||
				data.currentMedications.biologics.length > 0
				? [
						sectionHeader('Medications'),
						...(data.currentMedications.controllerMedications.length > 0
							? [{
									text: 'Controllers:',
									bold: true,
									fontSize: 10,
									margin: [0, 0, 0, 4] as [number, number, number, number]
								},
								{
									ul: data.currentMedications.controllerMedications.map(
										(m) => `${m.name} ${m.dose} ${m.frequency}`
									),
									margin: [0, 0, 0, 8] as [number, number, number, number]
								}]
							: []),
						...(data.currentMedications.rescueInhalers.length > 0
							? [{
									text: 'Rescue Inhalers:',
									bold: true,
									fontSize: 10,
									margin: [0, 0, 0, 4] as [number, number, number, number]
								},
								{
									ul: data.currentMedications.rescueInhalers.map(
										(m) => `${m.name} ${m.dose} ${m.frequency}`
									),
									margin: [0, 0, 0, 8] as [number, number, number, number]
								}]
							: []),
						...(data.currentMedications.biologics.length > 0
							? [{
									text: 'Biologics:',
									bold: true,
									fontSize: 10,
									margin: [0, 0, 0, 4] as [number, number, number, number]
								},
								{
									ul: data.currentMedications.biologics.map(
										(m) => `${m.name} ${m.dose} ${m.frequency}`
									),
									margin: [0, 0, 0, 16] as [number, number, number, number]
								}]
							: [])
					]
				: []),

			// Drug Allergies
			...(data.allergies.drugAllergies.length > 0
				? [
						sectionHeader('Drug Allergies'),
						{
							ul: data.allergies.drugAllergies.map(
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
