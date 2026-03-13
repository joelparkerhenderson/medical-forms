import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { calculateAge } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.patientInformation.dob);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'CONSENT TO TREATMENT FORM',
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
			// Title & Status
			{
				text: `Consent Form - ${result.status}`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `${result.completenessPercent}% Complete`,
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
							field('Name', `${data.patientInformation.firstName} ${data.patientInformation.lastName}`),
							field('DOB', `${data.patientInformation.dob}${age ? ` (Age ${age})` : ''}`)
						],
						[
							field('Sex', data.patientInformation.sex || 'N/A'),
							field('NHS Number', data.patientInformation.nhsNumber || 'N/A')
						],
						[
							field('Phone', data.patientInformation.phone || 'N/A'),
							field('Address', data.patientInformation.address || 'N/A')
						],
						[
							field('Emergency Contact', data.patientInformation.emergencyContact || 'N/A'),
							field('Emergency Phone', data.patientInformation.emergencyContactPhone || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Procedure Details
			sectionHeader('Procedure Details'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Procedure', data.procedureDetails.procedureName || 'N/A'),
							field('Department', data.procedureDetails.department || 'N/A')
						],
						[
							field('Clinician', data.procedureDetails.treatingClinician || 'N/A'),
							field('Scheduled Date', data.procedureDetails.scheduledDate || 'N/A')
						],
						[
							field('Duration', data.procedureDetails.estimatedDuration || 'N/A'),
							field('Admission', data.procedureDetails.admissionRequired || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Risks & Benefits
			sectionHeader('Risks & Benefits'),
			{
				table: {
					widths: ['*'],
					body: [
						[field('Common Risks', data.risksBenefits.commonRisks || 'N/A')],
						[field('Serious Risks', data.risksBenefits.seriousRisks || 'N/A')],
						[field('Expected Benefits', data.risksBenefits.expectedBenefits || 'N/A')],
						[field('Success Rate', data.risksBenefits.successRate || 'N/A')],
						[field('Recovery Period', data.risksBenefits.recoveryPeriod || 'N/A')]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Anesthesia
			sectionHeader('Anesthesia Information'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Type', data.anesthesiaInformation.anesthesiaType || 'N/A'),
							field('Previous Problems', data.anesthesiaInformation.previousAnesthesiaProblems || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Consent & Signatures
			sectionHeader('Consent & Signatures'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Patient Consent', data.signatureConsent.patientConsent === 'yes' ? 'GIVEN' : data.signatureConsent.patientConsent === 'no' ? 'REFUSED' : 'PENDING'),
							field('Date', data.signatureConsent.signatureDate || 'N/A')
						],
						[
							field('Witness', `${data.signatureConsent.witnessName || 'N/A'} (${data.signatureConsent.witnessRole || 'N/A'})`),
							field('Clinician', `${data.signatureConsent.clinicianName || 'N/A'} (${data.signatureConsent.clinicianRole || 'N/A'})`)
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
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
				: []),

			// Missing Fields
			...(result.firedRules.length > 0
				? [
						sectionHeader('Missing Required Fields'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 80],
								body: [
									[
										{ text: 'Rule', bold: true, fontSize: 9 },
										{ text: 'Section', bold: true, fontSize: 9 },
										{ text: 'Issue', bold: true, fontSize: 9 },
										{ text: 'Field', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.section, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: r.field, fontSize: 8, color: '#6b7280' }
									])
								]
							},
							layout: 'lightHorizontalLines',
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
