import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { riskCategoryLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'PREVENT CVD RISK ASSESSMENT REPORT',
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
			// Title & Risk Category
			{
				text: riskCategoryLabel(result.riskCategory),
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `10-Year Risk: ${result.tenYearRiskPercent}%  |  30-Year Risk: ${result.thirtyYearRiskPercent}%`,
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
							field('Name', data.patientInformation.fullName || 'N/A'),
							field('DOB', data.patientInformation.dateOfBirth || 'N/A')
						],
						[
							field('NHS Number', data.patientInformation.nhsNumber || 'N/A'),
							field('Age / Sex', `${data.demographics.age ?? 'N/A'} / ${data.demographics.sex || 'N/A'}`)
						],
						[
							field('GP', data.patientInformation.gpName || 'N/A'),
							field('GP Practice', data.patientInformation.gpPractice || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Clinical Data
			sectionHeader('Clinical Data'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Systolic BP', data.bloodPressure.systolicBp !== null ? `${data.bloodPressure.systolicBp} mmHg` : 'N/A'),
							field('Diastolic BP', data.bloodPressure.diastolicBp !== null ? `${data.bloodPressure.diastolicBp} mmHg` : 'N/A')
						],
						[
							field('Total Cholesterol', data.cholesterolLipids.totalCholesterol !== null ? `${data.cholesterolLipids.totalCholesterol} mg/dL` : 'N/A'),
							field('HDL Cholesterol', data.cholesterolLipids.hdlCholesterol !== null ? `${data.cholesterolLipids.hdlCholesterol} mg/dL` : 'N/A')
						],
						[
							field('LDL Cholesterol', data.cholesterolLipids.ldlCholesterol !== null ? `${data.cholesterolLipids.ldlCholesterol} mg/dL` : 'N/A'),
							field('Triglycerides', data.cholesterolLipids.triglycerides !== null ? `${data.cholesterolLipids.triglycerides} mg/dL` : 'N/A')
						],
						[
							field('Diabetes', `${data.metabolicHealth.hasDiabetes || 'N/A'}${data.metabolicHealth.diabetesType ? ` (${data.metabolicHealth.diabetesType})` : ''}`),
							field('HbA1c', data.metabolicHealth.hba1cValue !== null ? `${data.metabolicHealth.hba1cValue} ${data.metabolicHealth.hba1cUnit}` : 'N/A')
						],
						[
							field('BMI', data.metabolicHealth.bmi !== null ? `${data.metabolicHealth.bmi}` : 'N/A'),
							field('eGFR', data.renalFunction.egfr !== null ? `${data.renalFunction.egfr} mL/min` : 'N/A')
						],
						[
							field('Urine ACR', data.renalFunction.urineAcr !== null ? `${data.renalFunction.urineAcr} mg/g` : 'N/A'),
							field('Smoking', data.smokingHistory.smokingStatus || 'N/A')
						],
						[
							field('On Antihypertensive', data.bloodPressure.onAntihypertensive || 'N/A'),
							field('On Statin', data.cholesterolLipids.onStatin || 'N/A')
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
							ul: result.additionalFlags.map((f) => ({
								text: `[${f.priority.toUpperCase()}] ${f.category}: ${f.message}`,
								color:
									f.priority === 'high'
										? '#dc2626'
										: f.priority === 'medium'
											? '#d97706'
											: '#4b5563',
								margin: [0, 2, 0, 2] as [number, number, number, number]
							})),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Fired Rules
			...(result.firedRules.length > 0
				? [
						sectionHeader('Risk Rules Triggered'),
						{
							table: {
								headerRows: 1,
								widths: [50, 80, '*', 50],
								body: [
									[
										{ text: 'Rule', bold: true, fontSize: 9 },
										{ text: 'Category', bold: true, fontSize: 9 },
										{ text: 'Description', bold: true, fontSize: 9 },
										{ text: 'Level', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.category, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{
											text: r.riskLevel.toUpperCase(),
											fontSize: 8,
											bold: true,
											color:
												r.riskLevel === 'high'
													? '#dc2626'
													: r.riskLevel === 'medium'
														? '#d97706'
														: '#16a34a'
										}
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medical History
			sectionHeader('Medical History'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Known CVD', data.medicalHistory.hasKnownCvd || 'N/A'),
							field('Atrial Fibrillation', data.medicalHistory.atrialFibrillation || 'N/A')
						],
						[
							field('Family CVD History', data.medicalHistory.familyCvdHistory || 'N/A'),
							field('Family Details', data.medicalHistory.familyCvdDetails || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Clinical Notes
			...(data.reviewCalculate.clinicalNotes
				? [
						sectionHeader('Clinical Notes'),
						{
							text: data.reviewCalculate.clinicalNotes,
							margin: [0, 0, 0, 8] as [number, number, number, number]
						},
						...(data.reviewCalculate.clinicianName
							? [
									{
										text: `Reviewed by: ${data.reviewCalculate.clinicianName}${data.reviewCalculate.reviewDate ? ` on ${data.reviewCalculate.reviewDate}` : ''}`,
										fontSize: 9,
										color: '#6b7280',
										margin: [0, 0, 0, 16] as [number, number, number, number]
									}
								]
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
