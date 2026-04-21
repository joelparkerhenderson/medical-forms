import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { psqiScoreLabel, calculateAge, sleepEfficiencyCalc } from '$lib/engine/utils';

export function buildPdfDocument(
	data: AssessmentData,
	result: GradingResult
): TDocumentDefinitions {
	const age = calculateAge(data.demographics.dateOfBirth);
	const efficiency = sleepEfficiencyCalc(
		data.sleepEfficiency.hoursAsleep,
		data.sleepEfficiency.hoursInBed
	);

	return {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		header: {
			text: 'SLEEP QUALITY ASSESSMENT REPORT',
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
			// Title & PSQI Score
			{
				text: `PSQI Score: ${result.psqiScore}/21`,
				fontSize: 24,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 4]
			},
			{
				text: result.psqiCategory,
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
							field('Sleep Environment', data.sleepHabits.sleepEnvironment || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Sleep Summary
			sectionHeader('Sleep Summary'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Usual Bedtime', data.sleepHabits.usualBedtime || 'N/A'),
							field('Usual Wake Time', data.sleepHabits.usualWakeTime || 'N/A')
						],
						[
							field('Hours of Sleep', data.sleepDuration.actualSleepHours !== null ? `${data.sleepDuration.actualSleepHours} hours` : 'N/A'),
							field('Sleep Efficiency', efficiency !== null ? `${efficiency.toFixed(1)}%` : 'N/A')
						],
						[
							field('Minutes to Fall Asleep', data.sleepHabits.minutesToFallAsleep !== null ? `${data.sleepHabits.minutesToFallAsleep} min` : 'N/A'),
							field('Feels Enough Sleep', data.sleepDuration.feelEnoughSleep || 'N/A')
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

			// PSQI Breakdown
			...(result.firedRules.length > 0
				? [
						sectionHeader('PSQI Score Breakdown'),
						{
							table: {
								headerRows: 1,
								widths: [60, 100, '*', 40],
								body: [
									[
										{ text: 'Component', bold: true, fontSize: 9 },
										{ text: 'Name', bold: true, fontSize: 9 },
										{ text: 'Details', bold: true, fontSize: 9 },
										{ text: 'Score', bold: true, fontSize: 9 }
									],
									...result.firedRules.map((r) => [
										{ text: r.id, fontSize: 8, color: '#6b7280' },
										{ text: r.component, fontSize: 9 },
										{ text: r.description, fontSize: 9 },
										{ text: `${r.score}/3`, fontSize: 9, bold: true }
									])
								]
							},
							layout: 'lightHorizontalLines',
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Lifestyle Factors
			sectionHeader('Lifestyle Factors'),
			{
				table: {
					widths: ['*', '*'],
					body: [
						[
							field('Caffeine', data.medicalLifestyle.caffeineIntake || 'N/A'),
							field('Alcohol', data.medicalLifestyle.alcoholUse || 'N/A')
						],
						[
							field('Exercise', data.medicalLifestyle.exerciseFrequency || 'N/A'),
							field('Screen Time Before Bed', data.medicalLifestyle.screenTimeBeforeBed || 'N/A')
						],
						[
							field('Shift Work', data.medicalLifestyle.shiftWork || 'N/A'),
							field('Driving Drowsiness', data.daytimeDysfunction.drivingDrowsiness || 'N/A')
						]
					]
				},
				layout: 'lightHorizontalLines',
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},

			// Medical Conditions
			...(data.medicalLifestyle.medicalConditions
				? [
						sectionHeader('Medical Conditions'),
						{
							text: data.medicalLifestyle.medicalConditions,
							margin: [0, 0, 0, 16] as [number, number, number, number]
						}
					]
				: []),

			// Current Medications
			...(data.medicalLifestyle.currentMedications
				? [
						sectionHeader('Current Medications'),
						{
							text: data.medicalLifestyle.currentMedications,
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
