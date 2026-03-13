import type { AssessmentData } from './types';

/** Returns a human-readable label for a vaccination level. */
export function vaccinationLevelLabel(level: string): string {
	switch (level) {
		case 'upToDate': return 'Up to Date';
		case 'partiallyComplete': return 'Partially Complete';
		case 'overdue': return 'Overdue';
		case 'contraindicated': return 'Contraindicated';
		case 'draft': return 'Draft';
		default: return 'Unknown';
	}
}

/** Colour classes for vaccination levels. */
export function vaccinationLevelColor(level: string): string {
	switch (level) {
		case 'upToDate': return 'bg-green-100 text-green-800 border-green-300';
		case 'partiallyComplete': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
		case 'contraindicated': return 'bg-purple-100 text-purple-800 border-purple-300';
		default: return 'bg-gray-100 text-gray-700 border-gray-300';
	}
}

/** Collect all completeness-indicator items from vaccination sections.
 *  Each vaccine field uses: 0 = not given, 1 = partial, 2 = complete. */
export function collectVaccinationItems(data: AssessmentData): (number | null)[] {
	return [
		// Childhood Vaccinations (7 items)
		data.childhoodVaccinations.dtapIpvHibHepb,
		data.childhoodVaccinations.pneumococcal,
		data.childhoodVaccinations.rotavirus,
		data.childhoodVaccinations.meningitisB,
		data.childhoodVaccinations.mmr,
		data.childhoodVaccinations.hibMenc,
		data.childhoodVaccinations.preschoolBooster,
		// Adult Vaccinations (7 items)
		data.adultVaccinations.tdIpvBooster,
		data.adultVaccinations.hpv,
		data.adultVaccinations.meningitisAcwy,
		data.adultVaccinations.influenzaAnnual,
		data.adultVaccinations.covid19,
		data.adultVaccinations.shingles,
		data.adultVaccinations.pneumococcalPpv,
		// Consent quality (4 items)
		data.consentInformation.informationProvided,
		data.consentInformation.risksExplained,
		data.consentInformation.benefitsExplained,
		data.consentInformation.questionsAnswered,
		// Clinical review (1 item)
		data.clinicalReview.postVaccinationObservation
	];
}

/** Calculate the composite vaccination completeness score (0-100).
 *  Vaccine items use 0-2 scale. Consent items use 1-5 Likert scale.
 *  Returns null if no items are answered. */
export function calculateCompositeScore(data: AssessmentData): number | null {
	const vaccineItems = [
		data.childhoodVaccinations.dtapIpvHibHepb,
		data.childhoodVaccinations.pneumococcal,
		data.childhoodVaccinations.rotavirus,
		data.childhoodVaccinations.meningitisB,
		data.childhoodVaccinations.mmr,
		data.childhoodVaccinations.hibMenc,
		data.childhoodVaccinations.preschoolBooster,
		data.adultVaccinations.tdIpvBooster,
		data.adultVaccinations.hpv,
		data.adultVaccinations.meningitisAcwy,
		data.adultVaccinations.influenzaAnnual,
		data.adultVaccinations.covid19,
		data.adultVaccinations.shingles,
		data.adultVaccinations.pneumococcalPpv
	];

	const consentItems = [
		data.consentInformation.informationProvided,
		data.consentInformation.risksExplained,
		data.consentInformation.benefitsExplained,
		data.consentInformation.questionsAnswered
	];

	const answeredVaccines = vaccineItems.filter((v): v is number => v !== null);
	const answeredConsent = consentItems.filter((v): v is number => v !== null);

	if (answeredVaccines.length === 0 && answeredConsent.length === 0) {
		return null;
	}

	// Vaccine score: 0-2 scale -> 0-100
	const vaccineScore = answeredVaccines.length === 0 ? 0 :
		(answeredVaccines.reduce((a, b) => a + b, 0) / answeredVaccines.length / 2.0) * 100;

	// Consent score: 1-5 scale -> 0-100
	const consentScore = answeredConsent.length === 0 ? 0 :
		((answeredConsent.reduce((a, b) => a + b, 0) / answeredConsent.length - 1.0) / 4.0) * 100;

	// Weight: 80% vaccines, 20% consent
	let total: number;
	if (answeredVaccines.length > 0 && answeredConsent.length > 0) {
		total = vaccineScore * 0.8 + consentScore * 0.2;
	} else if (answeredVaccines.length > 0) {
		total = vaccineScore;
	} else {
		total = consentScore;
	}

	return Math.round(total);
}

/** Calculate the childhood vaccination dimension score (0-100). */
export function childhoodScore(data: AssessmentData): number | null {
	return dimensionScore02([
		data.childhoodVaccinations.dtapIpvHibHepb,
		data.childhoodVaccinations.pneumococcal,
		data.childhoodVaccinations.rotavirus,
		data.childhoodVaccinations.meningitisB,
		data.childhoodVaccinations.mmr,
		data.childhoodVaccinations.hibMenc,
		data.childhoodVaccinations.preschoolBooster
	]);
}

/** Calculate the adult vaccination dimension score (0-100). */
export function adultScore(data: AssessmentData): number | null {
	return dimensionScore02([
		data.adultVaccinations.tdIpvBooster,
		data.adultVaccinations.hpv,
		data.adultVaccinations.meningitisAcwy,
		data.adultVaccinations.influenzaAnnual,
		data.adultVaccinations.covid19,
		data.adultVaccinations.shingles,
		data.adultVaccinations.pneumococcalPpv
	]);
}

/** Calculate the consent quality score (0-100) for 1-5 Likert items. */
export function consentScore(data: AssessmentData): number | null {
	const items = [
		data.consentInformation.informationProvided,
		data.consentInformation.risksExplained,
		data.consentInformation.benefitsExplained,
		data.consentInformation.questionsAnswered
	];
	const answered = items.filter((v): v is number => v !== null);
	if (answered.length === 0) return null;
	const sum = answered.reduce((a, b) => a + b, 0);
	const avg = sum / answered.length;
	return Math.round(((avg - 1.0) / 4.0) * 100);
}

/** Calculate the dimension score (0-100) for a set of 0-2 scale items. */
export function dimensionScore02(items: (number | null)[]): number | null {
	const answered = items.filter((v): v is number => v !== null);
	if (answered.length === 0) return null;
	const sum = answered.reduce((a, b) => a + b, 0);
	const avg = sum / answered.length;
	return Math.round((avg / 2.0) * 100);
}

/** Format a date string for display. */
export function formatDate(dateStr: string): string {
	if (!dateStr) return 'N/A';
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return dateStr;
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Format an NHS number for display (XXX XXX XXXX). */
export function formatNhsNumber(nhs: string): string {
	const digits = nhs.replace(/\s/g, '');
	if (digits.length !== 10) return nhs;
	return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/** Completeness category for dashboard display. */
export function completenessCategory(score: number): string {
	if (score >= 90) return 'complete';
	if (score >= 50) return 'partial';
	return 'overdue';
}
