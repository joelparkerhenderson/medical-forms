import type { AssessmentData, AdditionalFlag } from './types';
import { calculateAge, calculateBMI } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of eligibility status. These are safety-critical or clinically
 * significant alerts for semaglutide prescribing.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Insulin + semaglutide hypoglycemia risk ────────────
	if (data.currentMedications.insulinTherapy === 'yes') {
		flags.push({
			id: 'FLAG-HYPO-001',
			category: 'Hypoglycemia Risk',
			message: `Concurrent insulin therapy (${data.currentMedications.insulinType || 'type not specified'}) - increased hypoglycemia risk with semaglutide. Consider insulin dose reduction.`,
			priority: 'high'
		});
	}

	if (data.currentMedications.sulfonylureas === 'yes') {
		flags.push({
			id: 'FLAG-HYPO-002',
			category: 'Hypoglycemia Risk',
			message: 'Concurrent sulfonylurea therapy - increased hypoglycemia risk. Consider dose reduction.',
			priority: 'high'
		});
	}

	// ─── Elevated HbA1c ─────────────────────────────────────
	if (data.metabolicProfile.hba1c !== null && data.metabolicProfile.hba1c > 10) {
		flags.push({
			id: 'FLAG-HBA1C-001',
			category: 'Metabolic',
			message: `HbA1c significantly elevated at ${data.metabolicProfile.hba1c}% - consider specialist diabetology review before initiation`,
			priority: 'high'
		});
	} else if (data.metabolicProfile.hba1c !== null && data.metabolicProfile.hba1c > 8) {
		flags.push({
			id: 'FLAG-HBA1C-002',
			category: 'Metabolic',
			message: `HbA1c elevated at ${data.metabolicProfile.hba1c}% - monitor closely during titration`,
			priority: 'medium'
		});
	}

	// ─── Severe obesity BMI >= 40 ───────────────────────────
	const bmi = calculateBMI(data.bodyComposition.heightCm, data.bodyComposition.weightKg);
	if (bmi !== null && bmi >= 40) {
		flags.push({
			id: 'FLAG-BMI-001',
			category: 'Severe Obesity',
			message: `BMI ${bmi.toFixed(1)} indicates severe obesity (class III) - may require multidisciplinary approach and enhanced monitoring`,
			priority: 'medium'
		});
	}

	// ─── Cardiovascular disease history ─────────────────────
	if (data.cardiovascularRisk.previousMI === 'yes' || data.cardiovascularRisk.heartFailure === 'yes') {
		flags.push({
			id: 'FLAG-CVD-001',
			category: 'Cardiovascular',
			message: 'History of major cardiovascular event - semaglutide may provide cardiovascular benefit but requires cardiology coordination',
			priority: 'medium'
		});
	}

	if (data.cardiovascularRisk.peripheralVascularDisease === 'yes' || data.cardiovascularRisk.cerebrovascularDisease === 'yes') {
		flags.push({
			id: 'FLAG-CVD-002',
			category: 'Cardiovascular',
			message: 'Peripheral or cerebrovascular disease present - monitor cardiovascular risk factors closely',
			priority: 'medium'
		});
	}

	// ─── Eating disorder ────────────────────────────────────
	if (data.mentalHealthScreening.eatingDisorderHistory === 'yes') {
		flags.push({
			id: 'FLAG-ED-001',
			category: 'Eating Disorder',
			message: `Eating disorder history: ${data.mentalHealthScreening.eatingDisorderDetails || 'details not specified'} - weight loss medication requires careful psychiatric monitoring`,
			priority: 'high'
		});
	}

	// ─── Suicidal ideation ──────────────────────────────────
	if (data.mentalHealthScreening.suicidalIdeation === 'yes') {
		flags.push({
			id: 'FLAG-SI-001',
			category: 'Mental Health',
			message: 'Active suicidal ideation reported - urgent psychiatric assessment required before initiating GLP-1 RA therapy',
			priority: 'high'
		});
	}

	// ─── Body dysmorphia ────────────────────────────────────
	if (data.mentalHealthScreening.bodyDysmorphia === 'yes') {
		flags.push({
			id: 'FLAG-BD-001',
			category: 'Mental Health',
			message: 'Body dysmorphia reported - psychological assessment recommended before weight management medication',
			priority: 'medium'
		});
	}

	// ─── Gastroparesis ──────────────────────────────────────
	if (data.gastrointestinalHistory.gastroparesis === 'yes') {
		flags.push({
			id: 'FLAG-GI-001',
			category: 'Gastrointestinal',
			message: 'Gastroparesis present - semaglutide delays gastric emptying and may worsen symptoms significantly',
			priority: 'high'
		});
	}

	// ─── Gallstone risk ─────────────────────────────────────
	if (data.gastrointestinalHistory.gallstoneHistory === 'yes') {
		flags.push({
			id: 'FLAG-GI-002',
			category: 'Gastrointestinal',
			message: 'History of gallstones - rapid weight loss with GLP-1 RAs increases cholelithiasis risk. Monitor for biliary symptoms.',
			priority: 'medium'
		});
	}

	// ─── IBD ────────────────────────────────────────────────
	if (data.gastrointestinalHistory.ibd === 'yes') {
		flags.push({
			id: 'FLAG-GI-003',
			category: 'Gastrointestinal',
			message: 'Inflammatory bowel disease present - GI side effects may exacerbate IBD symptoms',
			priority: 'medium'
		});
	}

	// ─── Breastfeeding ──────────────────────────────────────
	if (data.contraindicationsScreening.breastfeeding === 'yes') {
		flags.push({
			id: 'FLAG-BF-001',
			category: 'Reproductive',
			message: 'Currently breastfeeding - insufficient safety data for semaglutide in lactation',
			priority: 'high'
		});
	}

	// ─── Low BMI for weight management indication ───────────
	if (data.indicationGoals.primaryIndication === 'weight-management' && bmi !== null && bmi < 27) {
		flags.push({
			id: 'FLAG-BMI-LOW-001',
			category: 'Body Composition',
			message: `BMI ${bmi.toFixed(1)} is below recommended threshold for weight management indication (BMI >= 27 with comorbidity or >= 30)`,
			priority: 'medium'
		});
	}

	// ─── Elderly concerns ───────────────────────────────────
	const age = calculateAge(data.demographics.dob);
	if (age !== null && age >= 75) {
		flags.push({
			id: 'FLAG-AGE-001',
			category: 'Elderly Patient',
			message: `Patient aged ${age} - increased risk of sarcopenia with weight loss. Ensure adequate protein intake and resistance exercise programme.`,
			priority: 'medium'
		});
	} else if (age !== null && age >= 65) {
		flags.push({
			id: 'FLAG-AGE-002',
			category: 'Elderly Patient',
			message: `Patient aged ${age} - monitor for muscle mass loss and nutritional adequacy during treatment`,
			priority: 'low'
		});
	}

	// ─── Renal impairment ───────────────────────────────────
	if (data.metabolicProfile.fastingGlucose !== null && data.metabolicProfile.fastingGlucose > 11) {
		flags.push({
			id: 'FLAG-RENAL-001',
			category: 'Renal',
			message: 'Significantly elevated fasting glucose - assess renal function before initiation. Semaglutide may cause dehydration-related renal impairment.',
			priority: 'medium'
		});
	}

	// ─── Binge drinking ─────────────────────────────────────
	if (data.mentalHealthScreening.bingeDrinkingHistory === 'yes') {
		flags.push({
			id: 'FLAG-ALCOHOL-001',
			category: 'Substance Use',
			message: 'History of binge drinking - increased pancreatitis risk with GLP-1 RA therapy',
			priority: 'medium'
		});
	}

	// ─── Previous bariatric surgery ─────────────────────────
	if (data.gastrointestinalHistory.previousBariatricSurgery === 'yes') {
		flags.push({
			id: 'FLAG-BARI-001',
			category: 'Surgical History',
			message: 'Previous bariatric surgery - altered GI anatomy may affect semaglutide absorption and tolerability',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
