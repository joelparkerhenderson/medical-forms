import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { mrsSeverityLabel, riskClassificationLabel, bmiCategory, calculateAge, mrsScoreLabel } from '$lib/engine/utils';

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
			text: 'HORMONE REPLACEMENT THERAPY ASSESSMENT REPORT',
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
			// Title & MRS Score
			{
				text: `MRS Total Score: ${result.mrsResult.totalScore}/44`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: mrsSeverityLabel(result.mrsResult.severity),
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 8]
			},
			{
				text: `Somatic: ${result.mrsResult.subscales.somatic}/16 | Psychological: ${result.mrsResult.subscales.psychological}/16 | Urogenital: ${result.mrsResult.subscales.urogenital}/12`,
				fontSize: 10,
				alignment: 'center',
				color: '#6b7280',
				margin: [0, 0, 0, 8]
			},
			{
				text: `HRT Risk Classification: ${result.riskClassification}`,
				fontSize: 16,
				bold: true,
				alignment: 'center',
				color: result.riskClassification === 'Contraindicated' ? '#dc2626' :
					result.riskClassification === 'Cautious' ? '#d97706' :
					result.riskClassification === 'Acceptable' ? '#ca8a04' : '#16a34a',
				margin: [0, 0, 0, 4]
			},
			{
				text: riskClassificationLabel(result.riskClassification),
				fontSize: 10,
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
							field('BMI', bmi ? `${bmi} (${bmiCategory(bmi)})` : 'N/A')
						],
						[
							field('Menopause Status', data.menopauseStatus.menopausalStatus || 'N/A'),
							field('Age at Menopause', data.menopauseStatus.ageAtMenopause?.toString() ?? 'N/A')
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

			// MRS Symptom Scores
			...(result.firedRules.length > 0
				? [
						sectionHeader('MRS Symptom Scores'),
						{
							table: {
								headerRows: 1,
								widths: [50, 80, '*', 60],
								body: [
									[
										{ text: 'Item', bold: true, fontSize: 9 },
										{ text: 'Subscale', bold: true, fontSize: 9 },
										{ text: 'Symptom', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.system, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: mrsScoreLabel(r.score), fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...(data.currentMedications.otherMedications.length > 0
				? [
						sectionHeader('Current Medications'),
						{
							ul: data.currentMedications.otherMedications.map(
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
