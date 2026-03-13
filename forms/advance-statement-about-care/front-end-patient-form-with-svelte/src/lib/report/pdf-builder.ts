import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { StatementData, CompletenessResult } from '$lib/engine/types';
import { completenessLevelLabel, calculateAge, formatDate, placeLabel } from '$lib/engine/utils';

export function buildPdfDocument(
	data: StatementData,
	result: CompletenessResult
): TDocumentDefinitions {
	const age = calculateAge(data.personalInformation.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'ADVANCE STATEMENT ABOUT CARE',
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
			// Title
			{
				text: 'Advance Statement About Care',
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `Status: ${completenessLevelLabel(result.level)} (${result.completedCount}/${result.totalCount} sections)`,
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 20]
			},

			// Legal notice
			{
				text: 'This advance statement records the wishes, preferences, and values of the person named below. It is made in accordance with the Mental Capacity Act 2005 and NHS guidelines. This document is not a legally binding Advance Decision to Refuse Treatment (ADRT), but must be taken into account when making best interests decisions.',
				fontSize: 8,
				italics: true,
				color: '#6b7280',
				margin: [0, 0, 0, 16]
			},

			// Personal Details
			sectionHeader('1. Personal Information'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Name', `${data.personalInformation.firstName} ${data.personalInformation.lastName}`),
							field('DOB', `${formatDate(data.personalInformation.dateOfBirth)}${age ? ` (Age ${age})` : ''}`)
						],
						[
							field('NHS Number', data.personalInformation.nhsNumber || 'Not provided'),
							field('Telephone', data.personalInformation.telephone || 'Not provided')
						],
						[
							field('Address', `${data.personalInformation.address} ${data.personalInformation.postcode}`.trim() || 'Not provided'),
							field('GP', data.personalInformation.gpName ? `${data.personalInformation.gpName}, ${data.personalInformation.gpPractice}` : 'Not provided')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Statement Context
			...(data.statementContext.reasonForStatement
				? [
						sectionHeader('2. Statement Context'),
						labelledParagraph('Reason for making this statement', data.statementContext.reasonForStatement),
						...(data.statementContext.currentDiagnosis ? [labelledParagraph('Current diagnosis', data.statementContext.currentDiagnosis)] : []),
						...(data.statementContext.whenStatementShouldApply ? [labelledParagraph('When this statement should apply', data.statementContext.whenStatementShouldApply)] : [])
					]
				: []),

			// Values & Beliefs
			sectionHeader('3. Values & Beliefs'),
			...(data.valuesBeliefs.qualityOfLifePriorities ? [labelledParagraph('Quality of life priorities', data.valuesBeliefs.qualityOfLifePriorities)] : []),
			...(data.valuesBeliefs.whatMakesLifeMeaningful ? [labelledParagraph('What makes life meaningful', data.valuesBeliefs.whatMakesLifeMeaningful)] : []),
			...(data.valuesBeliefs.religiousBeliefs ? [labelledParagraph('Religious beliefs', data.valuesBeliefs.religiousBeliefs)] : []),
			...(data.valuesBeliefs.spiritualBeliefs ? [labelledParagraph('Spiritual beliefs', data.valuesBeliefs.spiritualBeliefs)] : []),
			...(data.valuesBeliefs.culturalValues ? [labelledParagraph('Cultural values', data.valuesBeliefs.culturalValues)] : []),
			...(data.valuesBeliefs.viewsOnDying ? [labelledParagraph('Views on dying', data.valuesBeliefs.viewsOnDying)] : []),

			// Care Preferences
			sectionHeader('4. Care Preferences'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Preferred place of care', placeLabel(data.carePreferences.preferredPlaceOfCare)),
							field('Preferred place of death', placeLabel(data.carePreferences.preferredPlaceOfDeath))
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 8] as [number, number, number, number]
			},
			...(data.carePreferences.personalComfortPreferences ? [labelledParagraph('Personal comfort', data.carePreferences.personalComfortPreferences)] : []),
			...(data.carePreferences.dailyRoutinePreferences ? [labelledParagraph('Daily routine', data.carePreferences.dailyRoutinePreferences)] : []),
			...(data.carePreferences.dietaryRequirements ? [labelledParagraph('Dietary requirements', data.carePreferences.dietaryRequirements)] : []),

			// Medical Treatment Wishes
			sectionHeader('5. Medical Treatment Wishes'),
			{
				text: 'Note: These are wishes and preferences, not legally binding refusals of treatment.',
				fontSize: 8,
				italics: true,
				color: '#d97706',
				margin: [0, 0, 0, 8]
			},
			...(data.medicalTreatmentWishes.painManagementPreferences ? [labelledParagraph('Pain management', data.medicalTreatmentWishes.painManagementPreferences)] : []),
			...(data.medicalTreatmentWishes.resuscitationWishes ? [labelledParagraph('Resuscitation wishes', data.medicalTreatmentWishes.resuscitationWishes)] : []),
			...(data.medicalTreatmentWishes.nutritionHydrationWishes ? [labelledParagraph('Nutrition & hydration', data.medicalTreatmentWishes.nutritionHydrationWishes)] : []),
			...(data.medicalTreatmentWishes.ventilationWishes ? [labelledParagraph('Ventilation', data.medicalTreatmentWishes.ventilationWishes)] : []),
			...(data.medicalTreatmentWishes.antibioticsWishes ? [labelledParagraph('Antibiotics', data.medicalTreatmentWishes.antibioticsWishes)] : []),
			...(data.medicalTreatmentWishes.hospitalisationWishes ? [labelledParagraph('Hospitalisation', data.medicalTreatmentWishes.hospitalisationWishes)] : []),
			...(data.medicalTreatmentWishes.organDonationWishes ? [labelledParagraph('Organ donation', data.medicalTreatmentWishes.organDonationWishes)] : []),

			// Communication Preferences
			...(data.communicationPreferences.howToBeAddressed || data.communicationPreferences.preferredLanguage
				? [
						sectionHeader('6. Communication Preferences'),
						...(data.communicationPreferences.howToBeAddressed ? [labelledParagraph('How to be addressed', data.communicationPreferences.howToBeAddressed)] : []),
						...(data.communicationPreferences.preferredLanguage ? [labelledParagraph('Preferred language', data.communicationPreferences.preferredLanguage)] : []),
						...(data.communicationPreferences.communicationAids ? [labelledParagraph('Communication aids', data.communicationPreferences.communicationAids)] : []),
						...(data.communicationPreferences.informationSharingPreferences ? [labelledParagraph('Information sharing', data.communicationPreferences.informationSharingPreferences)] : [])
					]
				: []),

			// People Important to Me
			...(data.peopleImportantToMe.people.length > 0
				? [
						sectionHeader('7. People Important to Me'),
						{
							table: {
								headerRows: 1,
								widths: ['*', 80, 90, '*'],
								body: [
									[
										{ text: 'Name', bold: true, fontSize: 9 },
										{ text: 'Relationship', bold: true, fontSize: 9 },
										{ text: 'Telephone', bold: true, fontSize: 9 },
										{ text: 'Role', bold: true, fontSize: 9 }
									],
									...data.peopleImportantToMe.people
										.filter((p) => p.name.trim())
										.map((p) => [
											{ text: p.name, fontSize: 9 },
											{ text: p.relationship, fontSize: 9 },
											{ text: p.telephone, fontSize: 9 },
											{ text: p.role, fontSize: 9 }
										])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Practical Matters
			...(data.practicalMatters.funeralWishes || data.practicalMatters.powerOfAttorneyDetails
				? [
						sectionHeader('8. Practical Matters'),
						...(data.practicalMatters.powerOfAttorneyDetails ? [labelledParagraph('Power of Attorney', data.practicalMatters.powerOfAttorneyDetails)] : []),
						...(data.practicalMatters.funeralWishes ? [labelledParagraph('Funeral wishes', data.practicalMatters.funeralWishes)] : []),
						...(data.practicalMatters.willDetails ? [labelledParagraph('Will details', data.practicalMatters.willDetails)] : [])
					]
				: []),

			// Signatures
			sectionHeader('9. Signatures & Witnesses'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Patient signature', data.signaturesWitnesses.patientSignature || 'Not signed'),
							field('Date', formatDate(data.signaturesWitnesses.patientSignatureDate))
						],
						[
							field('Witness', data.signaturesWitnesses.witnessName || 'No witness'),
							field('Witness date', formatDate(data.signaturesWitnesses.witnessSignatureDate))
						],
						[
							field('Review date', formatDate(data.signaturesWitnesses.reviewDate)),
							field('HCP', data.signaturesWitnesses.healthcareProfessionalName || 'Not acknowledged')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Flagged Issues
			...(result.flaggedIssues.length > 0
				? [
						sectionHeader('Issues for Attention'),
						{
							ul: result.flaggedIssues.map(
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

function labelledParagraph(label: string, value: string) {
	return {
		stack: [
			{ text: label, bold: true, color: '#6b7280', fontSize: 9 },
			{ text: value, fontSize: 10, margin: [0, 2, 0, 8] as [number, number, number, number] }
		],
		margin: [0, 0, 0, 4] as [number, number, number, number]
	};
}
