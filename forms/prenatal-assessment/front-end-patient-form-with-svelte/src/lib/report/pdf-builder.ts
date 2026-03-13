import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { riskLevelLabel, calculateAge, gestationalWeeksLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'PRENATAL ASSESSMENT REPORT',
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
			// Title & Risk Level
			{
				text: riskLevelLabel(result.riskLevel),
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `Risk Score: ${result.riskScore}`,
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
							field('Gestational Age', gestationalWeeksLabel(data.pregnancyDetails.gestationalWeeks)),
							field('EDD', data.pregnancyDetails.estimatedDueDate || 'N/A')
						],
						[
							field('Gravida/Para', `G${data.obstetricHistory.gravida ?? '?'}P${data.obstetricHistory.para ?? '?'}`),
							field('Blood Type', `${data.laboratoryResults.bloodType || 'N/A'}${data.laboratoryResults.rhFactor === 'positive' ? '+' : data.laboratoryResults.rhFactor === 'negative' ? '-' : ''}`)
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Vital Signs
			sectionHeader('Vital Signs'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Blood Pressure', `${data.vitalSigns.bloodPressureSystolic ?? '?'}/${data.vitalSigns.bloodPressureDiastolic ?? '?'} mmHg`),
							field('Fetal Heart Rate', `${data.vitalSigns.fetalHeartRate ?? 'N/A'} bpm`)
						],
						[
							field('BMI', data.vitalSigns.bmi !== null ? `${data.vitalSigns.bmi} kg/m2` : 'N/A'),
							field('Fundal Height', data.vitalSigns.fundalHeight !== null ? `${data.vitalSigns.fundalHeight} cm` : 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Obstetrician'),
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

			// Risk Factor Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('Risk Factor Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [70, 80, '*', 40],
								body: [
									[
										{ text: 'Rule', bold: true, fontSize: 9 },
										{ text: 'Category', bold: true, fontSize: 9 },
										{ text: 'Description', bold: true, fontSize: 9 },
										{ text: 'Weight', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.category, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `+${r.weight}`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Mental Health
			...(data.mentalHealthScreening.edinburghScore !== null
				? [
						sectionHeader('Mental Health'),
						{
							text: `Edinburgh Score: ${data.mentalHealthScreening.edinburghScore}/30`,
							fontSize: 10,
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Birth Plan
			sectionHeader('Birth Plan Preferences'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Delivery', data.birthPlanPreferences.deliveryPreference || 'N/A'),
							field('Pain Management', data.birthPlanPreferences.painManagement || 'N/A')
						],
						[
							field('Feeding Plan', data.birthPlanPreferences.feedingPlan || 'N/A'),
							field('Special Requests', data.birthPlanPreferences.specialRequests || 'N/A')
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
