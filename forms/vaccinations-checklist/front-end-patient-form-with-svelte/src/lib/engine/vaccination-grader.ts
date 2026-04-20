import type { AssessmentData, ComplianceStatus, RiskLevel, FiredRule, GradingResult } from './types';
import { vaccinationRules } from './vaccination-rules';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Pure function: evaluates all vaccination rules against patient data.
 * Returns compliance status, risk level, and all fired rules.
 */
export function calculateVaccinationGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of vaccinationRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			console.warn(`Vaccination rule ${rule.id} evaluation failed:`, e);
		}
	}

	const childhoodComplete = deriveChildhoodComplete(data);
	const occupationalComplete = deriveOccupationalComplete(data);
	const covidComplete = data.covid19Vaccination.covidPrimaryCourse === 'yes';
	const fluCurrent = data.influenzaVaccination.fluVaccineCurrentSeason === 'yes';

	const complianceStatus = deriveComplianceStatus(data, firedRules, childhoodComplete, occupationalComplete, covidComplete);
	const overallRisk = deriveOverallRisk(firedRules, complianceStatus, data);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		complianceStatus,
		overallRisk,
		childhoodComplete,
		occupationalComplete,
		covidComplete,
		fluCurrent,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Determine whether childhood immunisation schedule is complete. */
function deriveChildhoodComplete(data: AssessmentData): boolean {
	const c = data.childhoodImmunisations;
	return (
		c.mmrDose1 === 'yes' &&
		c.mmrDose2 === 'yes' &&
		c.dtpPrimaryCourse === 'yes' &&
		c.dtpBooster === 'yes' &&
		c.polioPrimaryCourse === 'yes' &&
		c.polioBooster === 'yes'
	);
}

/** Determine whether occupational vaccine requirements are met. */
function deriveOccupationalComplete(data: AssessmentData): boolean {
	const isHealthcare = data.demographics.occupationCategory === 'healthcare';
	if (!isHealthcare) return true;

	const o = data.occupationalVaccines;
	return (
		o.hepatitisBCourse === 'yes' &&
		o.hepatitisBAntiBodyLevel !== 'inadequate' &&
		(o.varicellaVaccine === 'yes' || o.varicellaHistory === 'yes')
	);
}

/** Derive overall compliance status from assessment data and fired rules. */
function deriveComplianceStatus(
	data: AssessmentData,
	firedRules: FiredRule[],
	childhoodComplete: boolean,
	occupationalComplete: boolean,
	covidComplete: boolean
): ComplianceStatus {
	// If live vaccines are contraindicated or immunocompromised with documented exemptions
	if (
		data.contraindicationsAllergies.liveVaccineContraindicated === 'yes' ||
		(data.vaccinationHistory.immunocompromised === 'yes' &&
			data.vaccinationHistory.adverseReactionSeverity === 'anaphylaxis')
	) {
		return 'contraindicated';
	}

	// If critical rules fired, patient is non-compliant
	const hasCriticalRule = firedRules.some((r) => r.grade >= 4);
	if (hasCriticalRule) return 'non-compliant';

	// If significant rules fired or key schedules incomplete
	const hasSignificantRule = firedRules.some((r) => r.grade >= 3);
	if (hasSignificantRule || !childhoodComplete || !occupationalComplete) return 'partially-immunised';

	// If moderate rules fired
	if (firedRules.some((r) => r.grade >= 2)) return 'partially-immunised';

	// All clear
	if (childhoodComplete && occupationalComplete && covidComplete) return 'fully-immunised';

	return 'partially-immunised';
}

/** Derive overall risk level from fired rules, compliance, and context. */
function deriveOverallRisk(
	firedRules: FiredRule[],
	complianceStatus: ComplianceStatus,
	data: AssessmentData
): RiskLevel {
	const maxGrade =
		firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Critical: active exposure without immunity, or grade 4 rules
	if (maxGrade >= 4 || data.scheduleCompliance.activeExposureIncident === 'yes') return 'critical';

	// High: non-compliant in high-risk role, or grade 3 rules
	if (
		maxGrade >= 3 ||
		(complianceStatus === 'non-compliant' && data.demographics.occupationCategory === 'healthcare')
	) {
		return 'high';
	}

	// Moderate: partially immunised, or grade 2 rules
	if (maxGrade >= 2 || complianceStatus === 'partially-immunised') return 'moderate';

	// Low: fully immunised
	return 'low';
}
