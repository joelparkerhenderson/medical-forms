import type { AssessmentData, UKMECMethodResult, FiredRule, UKMECCategory } from './types';
import { ukmecRules, allMethods, methodLabels } from './ukmec-rules';
import { calculateAge } from './utils';

/**
 * Pure function: evaluates UKMEC category per contraceptive method
 * based on patient data. Returns the highest UKMEC category for each
 * method along with the reasons for that categorisation.
 */
export function evaluateUKMEC(data: AssessmentData): {
	ukmecResults: UKMECMethodResult[];
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const methodCategories: Map<string, { category: UKMECCategory; reasons: string[] }> = new Map();

	// Initialise all methods at category 1 (no restriction)
	for (const method of allMethods) {
		methodCategories.set(method, { category: 1, reasons: [] });
	}

	// Derive conditions from patient data
	const conditions = deriveConditions(data);

	// Apply each rule
	for (const rule of ukmecRules) {
		if (conditions.has(rule.condition)) {
			const current = methodCategories.get(rule.method);
			if (current) {
				if (rule.category > current.category) {
					current.category = rule.category;
				}
				current.reasons.push(rule.description);

				firedRules.push({
					id: rule.id,
					domain: rule.condition,
					description: rule.description,
					score: rule.category
				});
			}
		}
	}

	const ukmecResults: UKMECMethodResult[] = allMethods.map((method) => {
		const result = methodCategories.get(method)!;
		return {
			method,
			methodLabel: methodLabels[method] || method,
			category: result.category,
			reasons: result.reasons
		};
	});

	return { ukmecResults, firedRules };
}

/**
 * Derives a set of active clinical conditions from the assessment data.
 */
function deriveConditions(data: AssessmentData): Set<string> {
	const conditions = new Set<string>();
	const age = calculateAge(data.demographics.dateOfBirth);

	// Migraine with aura
	if (data.medicalHistory.migraineWithAura === 'yes') {
		conditions.add('migraineWithAura');
	}

	// DVT / VTE history
	if (data.medicalHistory.dvtHistory === 'yes') {
		conditions.add('dvtHistory');
	}

	// Breast cancer
	if (data.medicalHistory.breastCancer === 'yes') {
		conditions.add('breastCancer');
	}

	// Hypertension
	if (data.medicalHistory.hypertension === 'yes') {
		const systolic = data.cardiovascularRisk.bloodPressureSystolic;
		if (systolic !== null && systolic >= 160) {
			conditions.add('hypertension-severe');
		} else if (systolic !== null && systolic >= 140) {
			conditions.add('hypertension-moderate');
		} else {
			// Hypertension reported but no BP values - assume moderate
			conditions.add('hypertension-moderate');
		}
	}

	// Liver disease
	if (data.medicalHistory.liverDisease === 'yes') {
		conditions.add('liverDisease');
	}

	// Diabetes
	if (data.medicalHistory.diabetes === 'yes') {
		conditions.add('diabetes');
	}

	// Epilepsy
	if (data.medicalHistory.epilepsy === 'yes') {
		conditions.add('epilepsy');
	}

	// Smoking + age >= 35
	if (age !== null && age >= 35) {
		if (data.cardiovascularRisk.smoking === 'current-heavy') {
			conditions.add('heavy-smoker-over-35');
		} else if (
			data.cardiovascularRisk.smoking === 'current-light' ||
			data.lifestyleFactors.smokingStatus === 'current-light' ||
			data.lifestyleFactors.smokingStatus === 'current-heavy'
		) {
			conditions.add('smoker-over-35');
		}
	}

	// BMI >= 35
	if (data.cardiovascularRisk.bmi !== null && data.cardiovascularRisk.bmi >= 35) {
		conditions.add('obesity-bmi-35');
	}

	// Breastfeeding < 6 weeks postpartum
	if (data.reproductiveHistory.breastfeeding === 'yes') {
		const deliveryDate = data.reproductiveHistory.lastDeliveryDate;
		if (deliveryDate) {
			const delivery = new Date(deliveryDate);
			const today = new Date();
			const weeksSinceDelivery = (today.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24 * 7);
			if (weeksSinceDelivery < 6) {
				conditions.add('breastfeeding-under-6-weeks');
			}
		}
	}

	return conditions;
}
