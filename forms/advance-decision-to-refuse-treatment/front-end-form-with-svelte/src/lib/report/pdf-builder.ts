import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { validityStatusLabel, calculateAge, hasLifeSustainingRefusal } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.personalInformation.dateOfBirth);
	const hasLS = hasLifeSustainingRefusal(data);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'ADVANCE DECISION TO REFUSE TREATMENT (ADRT)',
			alignment: 'center',
			margin: [0, 20, 0, 0],
			fontSize: 10,
			color: '#6b7280',
			bold: true
		},
		footer: (currentPage: number, pageCount: number) => ({
			text: `Page ${currentPage} of ${pageCount} | Generated ${new Date(result.timestamp).toLocaleString()} | Mental Capacity Act 2005`,
			alignment: 'center',
			margin: [0, 20, 0, 0],
			fontSize: 8,
			color: '#9ca3af'
		}),
		content: [
			// Title
			{
				text: 'ADVANCE DECISION TO REFUSE TREATMENT',
				fontSize: 18,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4] as [number, number, number, number]
			},
			{
				text: 'Under the Mental Capacity Act 2005',
				fontSize: 12,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 4] as [number, number, number, number]
			},
			{
				text: `Validity Status: ${validityStatusLabel(result.validityStatus)}`,
				fontSize: 14,
				bold: true,
				alignment: 'center',
				color: result.validityStatus === 'valid' ? '#16a34a' : result.validityStatus === 'invalid' ? '#dc2626' : '#d97706',
				margin: [0, 0, 0, 20] as [number, number, number, number]
			},

			// Personal Details
			sectionHeader('1. Personal Information'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Full Legal Name', data.personalInformation.fullLegalName || 'N/A'),
							field('Date of Birth', `${data.personalInformation.dateOfBirth}${age ? ` (Age ${age})` : ''}`)
						],
						[
							field('NHS Number', data.personalInformation.nhsNumber || 'N/A'),
							field('Address', data.personalInformation.address || 'N/A')
						],
						[
							field('GP', data.personalInformation.gpName || 'N/A'),
							field('GP Practice', data.personalInformation.gpPractice || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Capacity Declaration
			sectionHeader('2. Capacity Declaration'),
			{
				ul: [
					`Mental capacity confirmed: ${data.capacityDeclaration.confirmsCapacity === 'yes' ? 'Yes' : 'No'}`,
					`Understands consequences: ${data.capacityDeclaration.understandsConsequences === 'yes' ? 'Yes' : 'No'}`,
					`No undue influence: ${data.capacityDeclaration.noUndueInfluence === 'yes' ? 'Yes' : 'No'}`,
					`Professional assessment: ${data.capacityDeclaration.professionalCapacityAssessment === 'yes' ? `Yes - ${data.capacityDeclaration.assessedByName}` : 'No'}`
				],
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Circumstances
			sectionHeader('3. Circumstances'),
			{
				text: data.circumstances.specificCircumstances || 'Not specified',
				margin: [0, 0, 0, 8] as [number, number, number, number]
			},
			...(data.circumstances.medicalConditions ? [{
				text: `Medical conditions: ${data.circumstances.medicalConditions}`,
				margin: [0, 0, 0, 16] as [number, number, number, number]
			}] : [{ text: '', margin: [0, 0, 0, 8] as [number, number, number, number] }]),

			// General Treatments Refused
			sectionHeader('4. Treatments Refused - General'),
			{
				ul: [
					...(data.treatmentsRefusedGeneral.antibiotics.refused === 'yes' ? [`Antibiotics: ${data.treatmentsRefusedGeneral.antibiotics.specification || 'No specification'}`] : []),
					...(data.treatmentsRefusedGeneral.bloodTransfusion.refused === 'yes' ? [`Blood Transfusion: ${data.treatmentsRefusedGeneral.bloodTransfusion.specification || 'No specification'}`] : []),
					...(data.treatmentsRefusedGeneral.ivFluids.refused === 'yes' ? [`IV Fluids: ${data.treatmentsRefusedGeneral.ivFluids.specification || 'No specification'}`] : []),
					...(data.treatmentsRefusedGeneral.tubeFeeding.refused === 'yes' ? [`Tube Feeding: ${data.treatmentsRefusedGeneral.tubeFeeding.specification || 'No specification'}`] : []),
					...(data.treatmentsRefusedGeneral.dialysis.refused === 'yes' ? [`Dialysis: ${data.treatmentsRefusedGeneral.dialysis.specification || 'No specification'}`] : []),
					...(data.treatmentsRefusedGeneral.ventilation.refused === 'yes' ? [`Ventilation: ${data.treatmentsRefusedGeneral.ventilation.specification || 'No specification'}`] : []),
					...data.treatmentsRefusedGeneral.otherTreatments.filter(t => t.refused === 'yes').map(t => `${t.treatment}: ${t.specification || 'No specification'}`),
					...(![data.treatmentsRefusedGeneral.antibiotics, data.treatmentsRefusedGeneral.bloodTransfusion, data.treatmentsRefusedGeneral.ivFluids, data.treatmentsRefusedGeneral.tubeFeeding, data.treatmentsRefusedGeneral.dialysis, data.treatmentsRefusedGeneral.ventilation].some(t => t.refused === 'yes') && data.treatmentsRefusedGeneral.otherTreatments.filter(t => t.refused === 'yes').length === 0 ? ['None specified'] : [])
				],
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Life-Sustaining Treatments
			...(hasLS ? [
				sectionHeader('5. Treatments Refused - Life-Sustaining'),
				{
					text: 'IMPORTANT: The following refusals relate to life-sustaining treatment.',
					bold: true,
					color: '#dc2626',
					margin: [0, 0, 0, 8] as [number, number, number, number]
				},
				{
					ul: [
						...(data.treatmentsRefusedLifeSustaining.cpr.refused === 'yes' ? [`CPR ${data.treatmentsRefusedLifeSustaining.cpr.evenIfLifeAtRisk === 'yes' ? '(EVEN IF LIFE IS AT RISK)' : ''}: ${data.treatmentsRefusedLifeSustaining.cpr.specification || 'No specification'}`] : []),
						...(data.treatmentsRefusedLifeSustaining.mechanicalVentilation.refused === 'yes' ? [`Mechanical Ventilation ${data.treatmentsRefusedLifeSustaining.mechanicalVentilation.evenIfLifeAtRisk === 'yes' ? '(EVEN IF LIFE IS AT RISK)' : ''}: ${data.treatmentsRefusedLifeSustaining.mechanicalVentilation.specification || 'No specification'}`] : []),
						...(data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.refused === 'yes' ? [`Artificial Nutrition/Hydration ${data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.evenIfLifeAtRisk === 'yes' ? '(EVEN IF LIFE IS AT RISK)' : ''}: ${data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.specification || 'No specification'}`] : []),
						...data.treatmentsRefusedLifeSustaining.otherLifeSustaining.filter(t => t.refused === 'yes').map(t => `${t.treatment} ${t.evenIfLifeAtRisk === 'yes' ? '(EVEN IF LIFE IS AT RISK)' : ''}: ${t.specification || 'No specification'}`)
					],
					margin: [0, 0, 0, 16] as [number, number, number, number]
				}
			] : []),

			// Signatures
			sectionHeader('10. Legal Signatures'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Patient Signed', data.legalSignatures.patientSignature === 'yes' ? `Yes (${data.legalSignatures.patientSignatureDate})` : 'No'),
							field('Witness Signed', data.legalSignatures.witnessSignature === 'yes' ? `Yes - ${data.legalSignatures.witnessName}` : 'No')
						],
						...(hasLS ? [[
							field('Life-Sustaining Witness', data.legalSignatures.lifeSustainingWitnessSignature === 'yes' ? `Yes - ${data.legalSignatures.lifeSustainingWitnessName}` : 'No'),
							field('"Even if life at risk" Statement', data.legalSignatures.lifeSustainingWrittenStatement === 'yes' ? 'Yes' : 'No')
						]] : [])
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Validity Issues
			...(result.firedRules.length > 0
				? [
						sectionHeader('Validity Issues'),
						{
							ul: result.firedRules.map(
								(f) => ({
									text: `[${f.severity.toUpperCase()}] ${f.category}: ${f.description}`,
									color: f.severity === 'critical' ? '#dc2626' : f.severity === 'required' ? '#d97706' : '#2563eb',
									margin: [0, 2, 0, 2] as [number, number, number, number]
								})
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

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
