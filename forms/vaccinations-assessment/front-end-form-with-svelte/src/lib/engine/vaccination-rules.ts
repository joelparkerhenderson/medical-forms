import type { AssessmentData, FiredRule } from './types';
import { childhoodScore, adultScore, consentScore } from './utils';

/** A declarative vaccination concern rule. */
export interface VaccinationRule {
	id: string;
	category: string;
	description: string;
	concernLevel: 'high' | 'medium' | 'low';
	evaluate: (d: AssessmentData) => boolean;
}

/** All vaccination rules, ordered by concern level (high -> medium -> low). */
export function allRules(): VaccinationRule[] {
	return [
		// ─── HIGH CONCERN ───────────────────────────────────────
		{
			id: 'VAX-001',
			category: 'Childhood',
			description: 'MMR vaccination not given (0) - measles risk',
			concernLevel: 'high',
			evaluate: (d) => d.childhoodVaccinations.mmr === 0
		},
		{
			id: 'VAX-002',
			category: 'Childhood',
			description: 'Childhood vaccination completeness below 40%',
			concernLevel: 'high',
			evaluate: (d) => { const s = childhoodScore(d); return s !== null && s < 40; }
		},
		{
			id: 'VAX-003',
			category: 'Contraindication',
			description: 'Previous anaphylaxis to vaccine reported',
			concernLevel: 'high',
			evaluate: (d) => d.contraindicationsAllergies.previousAnaphylaxis === 'yes'
		},
		{
			id: 'VAX-004',
			category: 'Clinical',
			description: 'Immediate adverse reaction reported post-vaccination',
			concernLevel: 'high',
			evaluate: (d) => d.clinicalReview.immediateReaction === 'yes'
		},
		{
			id: 'VAX-005',
			category: 'Consent',
			description: 'Consent not given for vaccination',
			concernLevel: 'high',
			evaluate: (d) => d.consentInformation.consentGiven === 'no'
		},
		// ─── MEDIUM CONCERN ─────────────────────────────────────
		{
			id: 'VAX-006',
			category: 'Childhood',
			description: 'DTaP/IPV/Hib/HepB vaccination incomplete (partial)',
			concernLevel: 'medium',
			evaluate: (d) => d.childhoodVaccinations.dtapIpvHibHepb === 1
		},
		{
			id: 'VAX-007',
			category: 'Adult',
			description: 'Influenza vaccination not current',
			concernLevel: 'medium',
			evaluate: (d) => d.adultVaccinations.influenzaAnnual === 0
		},
		{
			id: 'VAX-008',
			category: 'Adult',
			description: 'COVID-19 vaccination not given',
			concernLevel: 'medium',
			evaluate: (d) => d.adultVaccinations.covid19 === 0
		},
		{
			id: 'VAX-009',
			category: 'Adult',
			description: 'Adult vaccination completeness below 40%',
			concernLevel: 'medium',
			evaluate: (d) => { const s = adultScore(d); return s !== null && s < 40; }
		},
		{
			id: 'VAX-010',
			category: 'Travel',
			description: 'Travel planned but no travel vaccinations recorded',
			concernLevel: 'medium',
			evaluate: (d) =>
				d.travelVaccinations.travelPlanned === 'yes' &&
				d.travelVaccinations.hepatitisA === null &&
				d.travelVaccinations.hepatitisB === null &&
				d.travelVaccinations.typhoid === null &&
				d.travelVaccinations.yellowFever === null &&
				d.travelVaccinations.rabies === null &&
				d.travelVaccinations.japaneseEncephalitis === null
		},
		{
			id: 'VAX-011',
			category: 'Occupational',
			description: 'Healthcare worker without hepatitis B vaccination',
			concernLevel: 'medium',
			evaluate: (d) =>
				d.occupationalVaccinations.healthcareWorker === 'yes' &&
				d.occupationalVaccinations.hepatitisBOccupational === 0
		},
		{
			id: 'VAX-012',
			category: 'Contraindication',
			description: 'Patient is pregnant - live vaccine contraindication',
			concernLevel: 'medium',
			evaluate: (d) => d.contraindicationsAllergies.pregnant === 'yes'
		},
		{
			id: 'VAX-013',
			category: 'History',
			description: 'Patient is immunocompromised - requires specialist review',
			concernLevel: 'medium',
			evaluate: (d) => d.immunizationHistory.immunocompromised === 'yes'
		},
		{
			id: 'VAX-014',
			category: 'Consent',
			description: 'Consent quality score below 50% - inadequate information provision',
			concernLevel: 'medium',
			evaluate: (d) => { const s = consentScore(d); return s !== null && s < 50; }
		},
		{
			id: 'VAX-015',
			category: 'Clinical',
			description: 'Catch-up schedule needed but no referral made',
			concernLevel: 'medium',
			evaluate: (d) =>
				d.clinicalReview.catchUpScheduleNeeded === 'yes' &&
				d.clinicalReview.referralNeeded !== 'yes'
		},
		// ─── LOW CONCERN (positive indicators) ──────────────────
		{
			id: 'VAX-016',
			category: 'Childhood',
			description: 'All childhood vaccinations complete',
			concernLevel: 'low',
			evaluate: (d) => {
				const items = [
					d.childhoodVaccinations.dtapIpvHibHepb,
					d.childhoodVaccinations.pneumococcal,
					d.childhoodVaccinations.rotavirus,
					d.childhoodVaccinations.meningitisB,
					d.childhoodVaccinations.mmr,
					d.childhoodVaccinations.hibMenc,
					d.childhoodVaccinations.preschoolBooster
				];
				const answered = items.filter((v): v is number => v !== null);
				return answered.length > 0 && answered.every((v) => v === 2);
			}
		},
		{
			id: 'VAX-017',
			category: 'Adult',
			description: 'All adult vaccinations complete',
			concernLevel: 'low',
			evaluate: (d) => {
				const items = [
					d.adultVaccinations.tdIpvBooster,
					d.adultVaccinations.hpv,
					d.adultVaccinations.meningitisAcwy,
					d.adultVaccinations.influenzaAnnual,
					d.adultVaccinations.covid19,
					d.adultVaccinations.shingles,
					d.adultVaccinations.pneumococcalPpv
				];
				const answered = items.filter((v): v is number => v !== null);
				return answered.length > 0 && answered.every((v) => v === 2);
			}
		},
		{
			id: 'VAX-018',
			category: 'Consent',
			description: 'All consent quality items rated Good or Excellent (4-5)',
			concernLevel: 'low',
			evaluate: (d) => {
				const items = [
					d.consentInformation.informationProvided,
					d.consentInformation.risksExplained,
					d.consentInformation.benefitsExplained,
					d.consentInformation.questionsAnswered
				];
				const answered = items.filter((v): v is number => v !== null);
				return answered.length > 0 && answered.every((v) => v >= 4);
			}
		},
		{
			id: 'VAX-019',
			category: 'History',
			description: 'Vaccination record available and verified',
			concernLevel: 'low',
			evaluate: (d) => d.immunizationHistory.hasVaccinationRecord === 'yes'
		},
		{
			id: 'VAX-020',
			category: 'Clinical',
			description: 'Post-vaccination observation completed satisfactorily (rated 4-5)',
			concernLevel: 'low',
			evaluate: (d) => {
				const v = d.clinicalReview.postVaccinationObservation;
				return v !== null && v >= 4 && v <= 5;
			}
		}
	];
}

/** Evaluate all rules against data, returning fired rules. */
export function evaluateRules(data: AssessmentData): FiredRule[] {
	const fired: FiredRule[] = [];
	for (const rule of allRules()) {
		if (rule.evaluate(data)) {
			fired.push({
				id: rule.id,
				category: rule.category,
				description: rule.description,
				concernLevel: rule.concernLevel
			});
		}
	}
	return fired;
}
