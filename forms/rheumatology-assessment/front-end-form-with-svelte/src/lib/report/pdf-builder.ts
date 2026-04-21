import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { das28Label, bmiCategory, calculateAge, diseaseActivityLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);
	const bmi = data.demographics.bmi;

	const allMeds = [
		...data.currentMedications.dmards.map((m) => `[DMARD] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.biologics.map((m) => `[Biologic] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.nsaids.map((m) => `[NSAID] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.steroids.map((m) => `[Steroid] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.painMedication.map((m) => `[Pain] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.supplements.map((m) => `[Supplement] ${m.name} ${m.dose} ${m.frequency}`)
	];

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'RHEUMATOLOGY ASSESSMENT REPORT',
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
			// Title & DAS28 Score
			{
				text: result.das28Score !== null
					? `DAS28: ${result.das28Score.toFixed(2)}`
					: 'DAS28: Incomplete Data',
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: diseaseActivityLabel(result.diseaseActivity),
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
						],
						[
							field('Diagnosis', data.diseaseHistory.primaryDiagnosis || 'N/A'),
							field('Duration', data.diseaseHistory.diseaseDurationYears ? `${data.diseaseHistory.diseaseDurationYears} years` : 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// DAS28 Components
			sectionHeader('DAS28 Components'),
			{
				table: {
					widths: ['*', '*', '*', '*'],
					body: [
						[
							{ text: 'TJC28', bold: true, fontSize: 9, alignment: 'center' },
							{ text: 'SJC28', bold: true, fontSize: 9, alignment: 'center' },
							{ text: 'ESR (mm/hr)', bold: true, fontSize: 9, alignment: 'center' },
							{ text: 'Patient VAS', bold: true, fontSize: 9, alignment: 'center' }
						],
						[
							{ text: String(data.jointAssessment.tenderJointCount28 ?? '-'), fontSize: 12, alignment: 'center', bold: true },
							{ text: String(data.jointAssessment.swollenJointCount28 ?? '-'), fontSize: 12, alignment: 'center', bold: true },
							{ text: String(data.laboratoryResults.esr ?? '-'), fontSize: 12, alignment: 'center', bold: true },
							{ text: String(data.jointAssessment.patientGlobalVAS ?? '-'), fontSize: 12, alignment: 'center', bold: true }
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Rheumatologist'),
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

			// Clinical Findings
			...(result.firedRules.length > 0
				? [
						sectionHeader('Clinical Findings'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*'],
								body: [
									[
										{ text: 'Rule ID', bold: true, fontSize: 9 },
										{ text: 'Category', bold: true, fontSize: 9 },
										{ text: 'Finding', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.category, fontSize: 9 },
										{ text: r.description, fontSize: 9 }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...(allMeds.length > 0
				? [
						sectionHeader('Medications'),
						{
							ul: allMeds,
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Allergies
			...(data.allergies.drugAllergies.length > 0
				? [
						sectionHeader('Allergies'),
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
