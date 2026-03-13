import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { eligibilityLabel, calculateAge, bmiCategory } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dob);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'SEMAGLUTIDE ELIGIBILITY ASSESSMENT REPORT',
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
			// Title & Eligibility Status
			{
				text: result.eligibilityStatus,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				color: result.eligibilityStatus === 'Eligible' ? '#16a34a' : result.eligibilityStatus === 'Conditional' ? '#d97706' : '#dc2626',
				margin: [0, 0, 0, 4]
			},
			{
				text: eligibilityLabel(result.eligibilityStatus),
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 4]
			},
			...(result.bmi !== null
				? [
						{
							text: `BMI: ${result.bmi.toFixed(1)} (${result.bmiCategory})`,
							fontSize: 12,
							alignment: 'center' as const,
							color: '#4b5563',
							margin: [0, 0, 0, 20] as [number, number, number, number]
						}
					]
				: [{ text: '', margin: [0, 0, 0, 20] as [number, number, number, number] }]),

			// Patient Details
			sectionHeader('Patient Details'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Name', `${data.demographics.firstName} ${data.demographics.lastName}`),
							field('DOB', `${data.demographics.dob}${age ? ` (Age ${age})` : ''}`)
						],
						[
							field('Sex', data.demographics.sex || 'N/A'),
							field('Primary Indication', data.indicationGoals.primaryIndication || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Absolute Contraindications
			...(result.absoluteContraindications.length > 0
				? [
						sectionHeader('Absolute Contraindications'),
						{
							ul: result.absoluteContraindications.map(
								(r) => ({
									text: `[${r.category}] ${r.description}`,
									color: '#dc2626',
									margin: [0, 2, 0, 2] as [number, number, number, number]
								})
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Relative Contraindications
			...(result.relativeContraindications.length > 0
				? [
						sectionHeader('Relative Contraindications'),
						{
							ul: result.relativeContraindications.map(
								(r) => ({
									text: `[${r.category}] ${r.description}`,
									color: '#d97706',
									margin: [0, 2, 0, 2] as [number, number, number, number]
								})
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Monitoring Flags
			...(result.monitoringFlags.length > 0
				? [
						sectionHeader('Monitoring Flags'),
						{
							ul: result.monitoringFlags.map(
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

			// Metabolic Profile
			sectionHeader('Metabolic Profile'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('HbA1c', data.metabolicProfile.hba1c !== null ? `${data.metabolicProfile.hba1c}%` : 'N/A'),
							field('Fasting Glucose', data.metabolicProfile.fastingGlucose !== null ? `${data.metabolicProfile.fastingGlucose} mmol/L` : 'N/A')
						],
						[
							field('Total Cholesterol', data.metabolicProfile.totalCholesterol !== null ? `${data.metabolicProfile.totalCholesterol} mmol/L` : 'N/A'),
							field('Triglycerides', data.metabolicProfile.triglycerides !== null ? `${data.metabolicProfile.triglycerides} mmol/L` : 'N/A')
						],
						[
							field('LDL', data.metabolicProfile.ldl !== null ? `${data.metabolicProfile.ldl} mmol/L` : 'N/A'),
							field('HDL', data.metabolicProfile.hdl !== null ? `${data.metabolicProfile.hdl} mmol/L` : 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Cardiovascular Risk
			sectionHeader('Cardiovascular Risk'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Blood Pressure', data.cardiovascularRisk.bloodPressureSystolic !== null && data.cardiovascularRisk.bloodPressureDiastolic !== null ? `${data.cardiovascularRisk.bloodPressureSystolic}/${data.cardiovascularRisk.bloodPressureDiastolic} mmHg` : 'N/A'),
							field('Heart Rate', data.cardiovascularRisk.heartRate !== null ? `${data.cardiovascularRisk.heartRate} bpm` : 'N/A')
						],
						[
							field('Previous MI', data.cardiovascularRisk.previousMI || 'N/A'),
							field('Heart Failure', data.cardiovascularRisk.heartFailure || 'N/A')
						],
						[
							field('QRISK Score', data.cardiovascularRisk.qriskScore !== null ? `${data.cardiovascularRisk.qriskScore}%` : 'N/A'),
							field('', '')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Treatment Plan
			sectionHeader('Treatment Plan'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Formulation', data.treatmentPlan.selectedFormulation || 'N/A'),
							field('Starting Dose', data.treatmentPlan.startingDose || 'N/A')
						],
						[
							field('Titration', data.treatmentPlan.titrationSchedule || 'N/A'),
							field('Monitoring', data.treatmentPlan.monitoringFrequency || 'N/A')
						],
						[
							field('Follow-up', data.treatmentPlan.followUpWeeks !== null ? `${data.treatmentPlan.followUpWeeks} weeks` : 'N/A'),
							field('', '')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Medications
			...buildMedicationSection(data)
		],
		defaultStyle: {
			fontSize: 10
		}
	};
}

function buildMedicationSection(data: AssessmentData): object[] {
	const sections: object[] = [];
	const allMeds = [
		...(data.currentMedications.insulinTherapy === 'yes'
			? [`[Insulin] ${data.currentMedications.insulinType || 'Type not specified'}`]
			: []),
		...(data.currentMedications.sulfonylureas === 'yes'
			? ['[Sulfonylurea] Currently prescribed']
			: []),
		...data.currentMedications.otherDiabetesMedications.map((m) => `[Diabetes] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.antihypertensives.map((m) => `[Antihypertensive] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.lipidLowering.map((m) => `[Lipid-lowering] ${m.name} ${m.dose} ${m.frequency}`),
		...data.currentMedications.otherMedications.map((m) => `[Other] ${m.name} ${m.dose} ${m.frequency}`)
	];

	if (allMeds.length > 0) {
		sections.push(sectionHeader('Current Medications'));
		sections.push({
			ul: allMeds,
			margin: [0, 0, 0, 16] as [number, number, number, number]
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
