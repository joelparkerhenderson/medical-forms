import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { tinettiScoreLabel, calculateAge, tugCategory } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'MOBILITY ASSESSMENT REPORT',
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
			// Title & Tinetti Score
			{
				text: `Tinetti Score: ${result.tinettiTotal}/28`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: `Balance: ${result.balanceScore}/16 | Gait: ${result.gaitScore}/12`,
				fontSize: 14,
				alignment: 'center',
				color: '#4b5563',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.tinettiCategory,
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
							field('Height / Weight', `${data.demographics.height || 'N/A'} / ${data.demographics.weight || 'N/A'}`)
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Referral Information
			sectionHeader('Referral Information'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Referring Provider', data.referralInfo.referringProvider || 'N/A'),
							field('Referral Date', data.referralInfo.referralDate || 'N/A')
						],
						[
							field('Primary Diagnosis', data.referralInfo.primaryDiagnosis || 'N/A'),
							field('Reason', data.referralInfo.referralReason || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// TUG
			sectionHeader('Timed Up and Go (TUG)'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Time', data.timedUpAndGo.timeSeconds !== null ? `${data.timedUpAndGo.timeSeconds}s` : 'N/A'),
							field('Category', tugCategory(data.timedUpAndGo.timeSeconds))
						],
						[
							field('Used Assistive Device', data.timedUpAndGo.usedAssistiveDevice || 'N/A'),
							field('Device Type', data.timedUpAndGo.deviceType || 'N/A')
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

			// Score Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('Tinetti Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [60, 60, '*', 40],
								body: [
									[
										{ text: 'Item', bold: true, fontSize: 9 },
										{ text: 'Domain', bold: true, fontSize: 9 },
										{ text: 'Description', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.domain, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `${r.score}`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Medications
			...buildMedicationSection(data),

			// Fall History
			sectionHeader('Fall History'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Falls Last Year', data.fallHistory.fallsLastYear !== null ? String(data.fallHistory.fallsLastYear) : 'N/A'),
							field('Fear of Falling', data.fallHistory.fearOfFalling || 'N/A')
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

function buildMedicationSection(data: AssessmentData): object[] {
	const sections: object[] = [];
	const allMeds = data.currentMedications.medications.map(
		(m) => `${m.name} ${m.dose} ${m.frequency}`
	);

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
