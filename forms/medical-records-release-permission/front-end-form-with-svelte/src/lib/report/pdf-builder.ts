import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { calculateAge, formatDate, formatNhsNumber } from '$lib/engine/utils';
import { recordTypeOptions, purposeOptions } from '$lib/engine/validation-rules';

function getPurposeLabel(value: string): string {
	return purposeOptions.find((o) => o.value === value)?.label ?? value;
}

function getRecordTypeLabel(value: string): string {
	return recordTypeOptions.find((o) => o.value === value)?.label ?? value;
}

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.patientInformation.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'MEDICAL RECORDS RELEASE AUTHORIZATION',
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
				text: 'Release Authorization Summary',
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `${result.completenessScore}% Complete - ${result.completenessStatus}`,
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
							field('DOB', `${formatDate(data.patientInformation.dateOfBirth)}${age ? ` (Age ${age})` : ''}`)
						],
						[
							field('NHS Number', formatNhsNumber(data.patientInformation.nhsNumber)),
							field('Sex', data.patientInformation.sex || 'N/A')
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

			// Authorized Recipient
			sectionHeader('Authorized Recipient'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Name', data.authorizedRecipient.recipientName || 'N/A'),
							field('Organization', data.authorizedRecipient.recipientOrganization || 'N/A')
						],
						[
							field('Role', data.authorizedRecipient.recipientRole || 'N/A'),
							field('Email', data.authorizedRecipient.recipientEmail || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Records to Release
			sectionHeader('Records Authorized for Release'),
			...(data.recordsToRelease.recordTypes.length > 0
				? [
						{
							ul: data.recordsToRelease.recordTypes.map(
								(rt) => getRecordTypeLabel(rt)
							),
							margin: [0, 0, 0, 8] as [number, number, number, number]
						}
					]
				: [{ text: 'No record types specified', italics: true, color: '#9ca3af', margin: [0, 0, 0, 8] as [number, number, number, number] }]
			),
			...(data.recordsToRelease.specificDateRange === 'yes'
				? [{
						text: [
							{ text: 'Date Range: ', bold: true },
							{ text: `${formatDate(data.recordsToRelease.dateFrom)} to ${formatDate(data.recordsToRelease.dateTo)}` }
						],
						margin: [0, 0, 0, 16] as [number, number, number, number]
					}]
				: [{ text: '', margin: [0, 0, 0, 8] as [number, number, number, number] }]
			),

			// Purpose
			sectionHeader('Purpose of Release'),
			{
				text: data.purposeOfRelease.purpose
					? getPurposeLabel(data.purposeOfRelease.purpose)
						+ (data.purposeOfRelease.purpose === 'other' && data.purposeOfRelease.otherDetails
							? ` - ${data.purposeOfRelease.otherDetails}` : '')
					: 'Not specified',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Authorization Period
			sectionHeader('Authorization Period'),
			{
				table: {
					widths: ['*', '*', '*'],
					body: [
						[
							field('Start', formatDate(data.authorizationPeriod.startDate)),
							field('End', formatDate(data.authorizationPeriod.endDate)),
							field('Single Use', data.authorizationPeriod.singleUse === 'yes' ? 'Yes' : 'No')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Restrictions
			sectionHeader('Restrictions & Limitations'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('HIV Records', data.restrictionsLimitations.excludeHIV === 'yes' ? 'Excluded' : 'Included'),
							field('Substance Abuse', data.restrictionsLimitations.excludeSubstanceAbuse === 'yes' ? 'Excluded' : 'Included')
						],
						[
							field('Mental Health', data.restrictionsLimitations.excludeMentalHealth === 'yes' ? 'Excluded' : 'Included'),
							field('Genetic Info', data.restrictionsLimitations.excludeGeneticInfo === 'yes' ? 'Excluded' : 'Included')
						],
						[
							field('STI Records', data.restrictionsLimitations.excludeSTI === 'yes' ? 'Excluded' : 'Included'),
							field('', '')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Consent & Signature
			sectionHeader('Consent & Signature'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Patient Consent', data.signatureConsent.patientSignatureConfirmed === 'yes' ? 'CONFIRMED' : 'NOT CONFIRMED'),
							field('Signature Date', formatDate(data.signatureConsent.signatureDate))
						],
						[
							field('Witness', data.signatureConsent.witnessName || 'N/A'),
							field('Witness Confirmed', data.signatureConsent.witnessSignatureConfirmed === 'yes' ? 'Yes' : 'No')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Additional Flags
			...(result.additionalFlags.length > 0
				? [
						sectionHeader('Flagged Issues for Review'),
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
