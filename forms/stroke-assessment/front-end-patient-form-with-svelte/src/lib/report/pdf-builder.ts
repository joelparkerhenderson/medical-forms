import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { nihssScoreLabel, calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'STROKE ASSESSMENT REPORT',
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
				text: `NIHSS Score: ${result.nihssScore}/42`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.nihssCategory,
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
							field('Onset Time', data.symptomOnset.onsetTime || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Symptom Onset
			sectionHeader('Symptom Onset'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Symptom Progression', data.symptomOnset.symptomProgression || 'N/A'),
							field('Mode of Arrival', data.symptomOnset.modeOfArrival || 'N/A')
						],
						[
							field('Last Known Well', data.symptomOnset.lastKnownWell || 'N/A'),
							field('', '')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Stroke Team'),
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

			// NIHSS Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('NIHSS Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 40],
								body: [
									[
										{ text: 'Item', bold: true, fontSize: 9 },
										{ text: 'Domain', bold: true, fontSize: 9 },
										{ text: 'Description', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.domain, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `${r.score}`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Risk Factors
			sectionHeader('Risk Factors'),
			{
				ul: [
					`Hypertension: ${data.riskFactors.hypertension || 'N/A'}`,
					`Diabetes: ${data.riskFactors.diabetes || 'N/A'}`,
					`Atrial Fibrillation: ${data.riskFactors.atrialFibrillation || 'N/A'}`,
					`Previous Stroke: ${data.riskFactors.previousStroke || 'N/A'}`,
					`Smoking: ${data.riskFactors.smoking || 'N/A'}`,
					`Hyperlipidemia: ${data.riskFactors.hyperlipidemia || 'N/A'}`,
					`Family History: ${data.riskFactors.familyHistory || 'N/A'}`
				],
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Medications
			...buildMedicationSection(data),

			// Allergies
			...(data.currentMedications.allergies.length > 0
				? [
						sectionHeader('Allergies'),
						{
							ul: data.currentMedications.allergies.map(
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
	const allMeds = data.currentMedications.medications.map(
		(m) => `${m.name} ${m.dose} ${m.frequency}`
	);

	if (allMeds.length > 0) {
		sections.push(sectionHeader('Current Medications'));
		sections.push({
			ul: allMeds,
			margin: [0, 0, 0, 16] as [number, number, number, number]
		});
	}

	if (data.currentMedications.anticoagulants === 'yes') {
		sections.push({
			text: [
				{ text: 'Anticoagulants: ', bold: true, color: '#dc2626' },
				{ text: data.currentMedications.anticoagulantDetails || 'Details not specified' }
			],
			margin: [0, 0, 0, 8] as [number, number, number, number]
		});
	}

	if (data.currentMedications.antiplatelets === 'yes') {
		sections.push({
			text: [
				{ text: 'Antiplatelets: ', bold: true, color: '#d97706' },
				{ text: data.currentMedications.antiplateletDetails || 'Details not specified' }
			],
			margin: [0, 0, 0, 8] as [number, number, number, number]
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
