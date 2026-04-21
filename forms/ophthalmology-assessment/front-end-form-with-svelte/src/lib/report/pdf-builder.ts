import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { vaGradeLabel, calculateAge, iopStatusLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'OPHTHALMOLOGY ASSESSMENT REPORT',
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
			// Title & VA Grade
			{
				text: vaGradeLabel(result.vaGrade),
				fontSize: 22,
				bold: true,
				alignment: 'center',
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
							field('Affected Eye', data.chiefComplaint.affectedEye || 'N/A')
						],
						[
							{
								text: [
									{ text: 'Primary Concern: ', bold: true, color: '#6b7280' },
									{ text: data.chiefComplaint.primaryConcern || 'N/A' }
								],
								colSpan: 2,
								margin: [0, 4, 0, 4] as [number, number, number, number]
							},
							{}
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Visual Acuity
			sectionHeader('Visual Acuity'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Right Eye (corrected)', data.visualAcuity.distanceVaRightCorrected || 'N/A'),
							field('Left Eye (corrected)', data.visualAcuity.distanceVaLeftCorrected || 'N/A')
						],
						[
							field('IOP Right', `${data.anteriorSegment.iopRight ?? 'N/A'} mmHg (${iopStatusLabel(data.anteriorSegment.iopRight)})`),
							field('IOP Left', `${data.anteriorSegment.iopLeft ?? 'N/A'} mmHg (${iopStatusLabel(data.anteriorSegment.iopLeft)})`)
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Ophthalmologist'),
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

			// Fired Rules
			...(result.firedRules.length > 0
				? [
						sectionHeader('VA Grade Justification'),
						{
							table: {
								headerRows: 1,
								widths: [60, 80, '*', 60],
								body: [
									[
										{ text: 'Rule ID', bold: true, fontSize: 9 },
										{ text: 'System', bold: true, fontSize: 9 },
										{ text: 'Finding', bold: true, fontSize: 9 },
										{ text: 'Grade', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.system, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: r.grade, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...(data.currentMedications.eyeDrops.length > 0
				? [
						sectionHeader('Eye Drops'),
						{
							ul: data.currentMedications.eyeDrops.map(
								(m) => `${m.name} ${m.dose} ${m.frequency}`
							),
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Drug Allergies
			...(data.currentMedications.ophthalmicDrugAllergies.length > 0
				? [
						sectionHeader('Ophthalmic Drug Allergies'),
						{
							ul: data.currentMedications.ophthalmicDrugAllergies.map(
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
