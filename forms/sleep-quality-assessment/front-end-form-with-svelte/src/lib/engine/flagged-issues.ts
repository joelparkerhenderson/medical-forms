import type { AssessmentData, AdditionalFlag } from './types';
import { frequencyToScore } from './psqi-rules';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of PSQI score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Sleep apnea suspicion ─────────────────────────
	if (
		frequencyToScore(data.sleepDisturbances.breathingDifficulty) >= 2 &&
		frequencyToScore(data.sleepDisturbances.coughingSnoring) >= 2
	) {
		flags.push({
			id: 'FLAG-APNEA-001',
			category: 'Sleep Apnea Suspicion',
			message: 'Frequent breathing difficulty combined with frequent coughing/snoring - assess for obstructive sleep apnea',
			priority: 'high'
		});
	}

	if (frequencyToScore(data.sleepDisturbances.breathingDifficulty) >= 3) {
		flags.push({
			id: 'FLAG-APNEA-002',
			category: 'Sleep Apnea Suspicion',
			message: 'Breathing difficulty reported 3+ times per week - urgent sleep study recommended',
			priority: 'high'
		});
	}

	// ─── Severe insomnia ────────────────────────────────
	const minutesToFall = data.sleepHabits.minutesToFallAsleep;
	if (minutesToFall !== null && minutesToFall > 60) {
		flags.push({
			id: 'FLAG-INSOMNIA-001',
			category: 'Severe Insomnia',
			message: `Takes over 60 minutes to fall asleep (${minutesToFall} min) - evaluate for chronic insomnia disorder`,
			priority: 'high'
		});
	}

	const sleepHours = data.sleepDuration.actualSleepHours;
	if (sleepHours !== null && sleepHours < 4) {
		flags.push({
			id: 'FLAG-INSOMNIA-002',
			category: 'Severe Insomnia',
			message: `Extremely low sleep duration (${sleepHours} hours) - significant health risk`,
			priority: 'high'
		});
	}

	// ─── Excessive daytime sleepiness ──────────────────
	if (frequencyToScore(data.daytimeDysfunction.troubleStayingAwake) >= 3) {
		flags.push({
			id: 'FLAG-EDS-001',
			category: 'Excessive Daytime Sleepiness',
			message: 'Trouble staying awake 3+ times per week - assess for narcolepsy or underlying sleep disorder',
			priority: 'high'
		});
	}

	if (data.daytimeDysfunction.drivingDrowsiness === 'yes') {
		flags.push({
			id: 'FLAG-EDS-002',
			category: 'Excessive Daytime Sleepiness',
			message: 'Reports drowsiness while driving - immediate safety concern, advise against driving until assessed',
			priority: 'high'
		});
	}

	// ─── High medication use ───────────────────────────
	if (
		data.sleepMedicationUse.prescriptionSleepMeds === 'yes' &&
		data.sleepMedicationUse.otcSleepAids === 'yes'
	) {
		flags.push({
			id: 'FLAG-MEDS-001',
			category: 'High Medication Use',
			message: 'Using both prescription and OTC sleep aids - review for polypharmacy and dependence risk',
			priority: 'high'
		});
	}

	if (
		frequencyToScore(data.sleepMedicationUse.frequency) >= 3
	) {
		flags.push({
			id: 'FLAG-MEDS-002',
			category: 'High Medication Use',
			message: 'Sleep medication used 3+ times per week - assess for medication dependence',
			priority: 'medium'
		});
	}

	// ─── Shift work issues ──────────────────────────────
	if (data.medicalLifestyle.shiftWork === 'yes') {
		flags.push({
			id: 'FLAG-SHIFT-001',
			category: 'Shift Work',
			message: 'Patient works shifts - consider shift work sleep disorder and circadian rhythm disruption',
			priority: 'medium'
		});
	}

	// ─── Substance interference ─────────────────────────
	if (data.medicalLifestyle.caffeineIntake === 'high-5-plus') {
		flags.push({
			id: 'FLAG-SUBSTANCE-001',
			category: 'Substance Interference',
			message: 'High caffeine intake (5+ beverages/day) - likely contributing to sleep difficulties',
			priority: 'medium'
		});
	}

	if (data.medicalLifestyle.alcoholUse === 'heavy') {
		flags.push({
			id: 'FLAG-SUBSTANCE-002',
			category: 'Substance Interference',
			message: 'Heavy alcohol use reported - alcohol disrupts sleep architecture and worsens sleep quality',
			priority: 'medium'
		});
	}

	// ─── Screen time before bed ─────────────────────────
	if (data.medicalLifestyle.screenTimeBeforeBed === 'more-than-60-min') {
		flags.push({
			id: 'FLAG-HYGIENE-001',
			category: 'Sleep Hygiene',
			message: 'More than 60 minutes of screen time before bed - blue light exposure may delay sleep onset',
			priority: 'low'
		});
	}

	// ─── Mental health concerns ─────────────────────────
	if (
		frequencyToScore(data.daytimeDysfunction.enthusiasmProblem) >= 2 &&
		(sleepHours !== null && sleepHours < 5)
	) {
		flags.push({
			id: 'FLAG-MENTAL-001',
			category: 'Mental Health Concern',
			message: 'Combination of low enthusiasm and poor sleep - screen for depression and anxiety',
			priority: 'medium'
		});
	}

	// ─── Low sleep efficiency ───────────────────────────
	const hoursAsleep = data.sleepEfficiency.hoursAsleep;
	const hoursInBed = data.sleepEfficiency.hoursInBed;
	if (hoursAsleep !== null && hoursInBed !== null && hoursInBed > 0) {
		const efficiency = (hoursAsleep / hoursInBed) * 100;
		if (efficiency < 65) {
			flags.push({
				id: 'FLAG-EFFICIENCY-001',
				category: 'Poor Sleep Efficiency',
				message: `Sleep efficiency is ${efficiency.toFixed(1)}% (below 65%) - consider cognitive behavioural therapy for insomnia (CBT-I)`,
				priority: 'medium'
			});
		}
	}

	// ─── Chronic pain disruption ────────────────────────
	if (frequencyToScore(data.sleepDisturbances.pain) >= 3) {
		flags.push({
			id: 'FLAG-PAIN-001',
			category: 'Pain-Related Sleep Disruption',
			message: 'Pain disrupts sleep 3+ times per week - review pain management strategy',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
