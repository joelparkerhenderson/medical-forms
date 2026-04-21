import type { AssessmentData, AdditionalFlag, UKMECMethodResult } from './types';
import { calculateAge } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of UKMEC categorisation. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(
	data: AssessmentData,
	ukmecResults: UKMECMethodResult[]
): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];
	const age = calculateAge(data.demographics.dateOfBirth);

	// ─── UKMEC 3/4 for preferred method ───────────────────
	if (data.preferencesPriorities.preferredMethod) {
		const preferredResult = ukmecResults.find(
			(r) => r.method === data.preferencesPriorities.preferredMethod
		);
		if (preferredResult && preferredResult.category >= 3) {
			flags.push({
				id: 'FLAG-PREFERRED-UKMEC',
				category: 'Preferred Method Contraindication',
				message: `Patient's preferred method (${preferredResult.methodLabel}) has UKMEC category ${preferredResult.category} - ${preferredResult.reasons.join('; ')}`,
				priority: 'high'
			});
		}
	}

	// ─── Migraine with aura + combined hormonal ──────────
	if (data.medicalHistory.migraineWithAura === 'yes') {
		flags.push({
			id: 'FLAG-MIGRAINE-AURA',
			category: 'Stroke Risk',
			message: 'Migraine with aura - all combined hormonal contraception (COC, patch, ring) is UKMEC 4 due to increased stroke risk',
			priority: 'high'
		});
	}

	// ─── Smoker aged >= 35 + combined hormonal ───────────
	if (
		age !== null &&
		age >= 35 &&
		(data.cardiovascularRisk.smoking === 'current-light' ||
			data.cardiovascularRisk.smoking === 'current-heavy' ||
			data.lifestyleFactors.smokingStatus === 'current-light' ||
			data.lifestyleFactors.smokingStatus === 'current-heavy')
	) {
		flags.push({
			id: 'FLAG-SMOKER-35',
			category: 'Cardiovascular Risk',
			message: `Smoker aged ${age} (>= 35) - combined hormonal contraception carries increased cardiovascular risk`,
			priority: 'high'
		});
	}

	// ─── DVT / VTE history ──────────────────────────────
	if (data.medicalHistory.dvtHistory === 'yes') {
		flags.push({
			id: 'FLAG-DVT',
			category: 'Thromboembolism Risk',
			message: 'History of DVT/VTE - all combined hormonal contraception is UKMEC 4',
			priority: 'high'
		});
	}

	// ─── Breastfeeding < 6 weeks postpartum ─────────────
	if (data.reproductiveHistory.breastfeeding === 'yes') {
		const deliveryDate = data.reproductiveHistory.lastDeliveryDate;
		if (deliveryDate) {
			const delivery = new Date(deliveryDate);
			const today = new Date();
			const weeksSinceDelivery = (today.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24 * 7);
			if (weeksSinceDelivery < 6) {
				flags.push({
					id: 'FLAG-BREASTFEEDING',
					category: 'Postpartum',
					message: `Breastfeeding and ${Math.round(weeksSinceDelivery)} weeks postpartum (< 6 weeks) - CHC is UKMEC 4`,
					priority: 'high'
				});
			}
		}
	}

	// ─── Uncontrolled hypertension ──────────────────────
	if (
		data.medicalHistory.hypertension === 'yes' &&
		data.cardiovascularRisk.bloodPressureSystolic !== null &&
		data.cardiovascularRisk.bloodPressureSystolic >= 160
	) {
		flags.push({
			id: 'FLAG-HYPERTENSION',
			category: 'Hypertension',
			message: `Uncontrolled hypertension (systolic ${data.cardiovascularRisk.bloodPressureSystolic} mmHg) - CHC is UKMEC 4`,
			priority: 'high'
		});
	}

	// ─── Breast cancer ─────────────────────────────────
	if (data.medicalHistory.breastCancer === 'yes') {
		flags.push({
			id: 'FLAG-BREAST-CANCER',
			category: 'Oncology',
			message: 'Current or recent breast cancer - all hormonal contraception is UKMEC 4. Consider copper IUD or barrier methods.',
			priority: 'high'
		});
	}

	// ─── HIV positive ──────────────────────────────────
	if (data.medicalHistory.hiv === 'yes') {
		flags.push({
			id: 'FLAG-HIV',
			category: 'Infectious Disease',
			message: 'HIV positive - consider drug interactions with antiretroviral therapy and ensure barrier method counselling for STI prevention',
			priority: 'medium'
		});
	}

	// ─── STI history ───────────────────────────────────
	if (data.medicalHistory.stiHistory === 'yes') {
		flags.push({
			id: 'FLAG-STI',
			category: 'Sexual Health',
			message: 'History of STI - ensure barrier method counselling alongside chosen contraception',
			priority: 'medium'
		});
	}

	// ─── High BMI ──────────────────────────────────────
	if (data.cardiovascularRisk.bmi !== null && data.cardiovascularRisk.bmi >= 35) {
		flags.push({
			id: 'FLAG-OBESITY',
			category: 'Obesity',
			message: `BMI ${data.cardiovascularRisk.bmi} (>= 35) - CHC is UKMEC 3, consider progestogen-only or non-hormonal methods`,
			priority: 'medium'
		});
	}

	// ─── Liver disease ─────────────────────────────────
	if (data.medicalHistory.liverDisease === 'yes') {
		flags.push({
			id: 'FLAG-LIVER',
			category: 'Hepatic',
			message: 'Active liver disease - CHC and POP carry increased risk. Consider copper IUD or barrier methods.',
			priority: 'medium'
		});
	}

	// ─── Cervical screening overdue ────────────────────
	if (data.breastCervicalScreening.lastCervicalScreening) {
		const lastScreen = new Date(data.breastCervicalScreening.lastCervicalScreening);
		const today = new Date();
		const yearsSinceScreen = (today.getTime() - lastScreen.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
		if (yearsSinceScreen > 3) {
			flags.push({
				id: 'FLAG-CERVICAL-OVERDUE',
				category: 'Screening',
				message: `Cervical screening may be overdue (last: ${data.breastCervicalScreening.lastCervicalScreening}) - advise scheduling`,
				priority: 'low'
			});
		}
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
