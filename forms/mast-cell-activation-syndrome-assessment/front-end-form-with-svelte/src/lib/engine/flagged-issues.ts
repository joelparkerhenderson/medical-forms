import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the MCAS symptom score. These are safety-critical or
 * clinically significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Anaphylaxis history (syncope + cardiovascular instability) ──
	if (
		data.cardiovascularSymptoms.syncope.severity !== null &&
		data.cardiovascularSymptoms.syncope.severity >= 2 &&
		data.cardiovascularSymptoms.hypotension.severity !== null &&
		data.cardiovascularSymptoms.hypotension.severity >= 2
	) {
		flags.push({
			id: 'FLAG-ANAPHYLAXIS-001',
			category: 'Anaphylaxis Risk',
			message: 'History of syncope with hypotension - assess for anaphylaxis risk and ensure emergency action plan',
			priority: 'high'
		});
	}

	// ─── Elevated tryptase ──────────────────────────────
	if (
		data.laboratoryResults.serumTryptase !== null &&
		data.laboratoryResults.serumTryptase > 11.4
	) {
		flags.push({
			id: 'FLAG-TRYPTASE-001',
			category: 'Elevated Tryptase',
			message: `Serum tryptase elevated at ${data.laboratoryResults.serumTryptase} ng/mL (normal <11.4) - consider mastocytosis workup`,
			priority: 'high'
		});
	}

	// ─── Cardiovascular instability ─────────────────────
	if (
		data.cardiovascularSymptoms.tachycardia.severity !== null &&
		data.cardiovascularSymptoms.tachycardia.severity >= 2
	) {
		flags.push({
			id: 'FLAG-CV-001',
			category: 'Cardiovascular Instability',
			message: 'Significant tachycardia reported - monitor for cardiovascular compromise during mast cell episodes',
			priority: 'high'
		});
	}

	if (
		data.cardiovascularSymptoms.hypotension.severity !== null &&
		data.cardiovascularSymptoms.hypotension.severity >= 2
	) {
		flags.push({
			id: 'FLAG-CV-002',
			category: 'Cardiovascular Instability',
			message: 'Significant hypotension reported - ensure patient has access to emergency interventions',
			priority: 'high'
		});
	}

	// ─── Respiratory compromise ─────────────────────────
	if (
		data.respiratorySymptoms.throatTightening.severity !== null &&
		data.respiratorySymptoms.throatTightening.severity >= 2
	) {
		flags.push({
			id: 'FLAG-RESP-001',
			category: 'Respiratory Compromise',
			message: 'Significant throat tightening reported - assess for laryngeal oedema risk',
			priority: 'high'
		});
	}

	if (
		data.respiratorySymptoms.wheezing.severity !== null &&
		data.respiratorySymptoms.wheezing.severity >= 2 &&
		data.respiratorySymptoms.dyspnea.severity !== null &&
		data.respiratorySymptoms.dyspnea.severity >= 2
	) {
		flags.push({
			id: 'FLAG-RESP-002',
			category: 'Respiratory Compromise',
			message: 'Combined wheezing and dyspnea - evaluate for bronchospasm management plan',
			priority: 'high'
		});
	}

	// ─── Severe GI involvement ──────────────────────────
	const giSeverities = [
		data.gastrointestinalSymptoms.abdominalPain.severity,
		data.gastrointestinalSymptoms.nausea.severity,
		data.gastrointestinalSymptoms.diarrhea.severity,
		data.gastrointestinalSymptoms.bloating.severity
	].filter((s): s is number => s !== null);

	const severeGiCount = giSeverities.filter((s) => s >= 2).length;
	if (severeGiCount >= 3) {
		flags.push({
			id: 'FLAG-GI-001',
			category: 'Severe GI Involvement',
			message: `${severeGiCount} gastrointestinal symptoms at moderate or severe level - consider GI specialist referral`,
			priority: 'medium'
		});
	}

	// ─── Multiple organ systems affected ────────────────
	let systemsAffected = 0;

	const dermMax = Math.max(
		data.dermatologicalSymptoms.flushing.severity ?? 0,
		data.dermatologicalSymptoms.urticaria.severity ?? 0,
		data.dermatologicalSymptoms.angioedema.severity ?? 0,
		data.dermatologicalSymptoms.pruritus.severity ?? 0
	);
	if (dermMax > 0) systemsAffected++;

	const giMax = Math.max(
		data.gastrointestinalSymptoms.abdominalPain.severity ?? 0,
		data.gastrointestinalSymptoms.nausea.severity ?? 0,
		data.gastrointestinalSymptoms.diarrhea.severity ?? 0,
		data.gastrointestinalSymptoms.bloating.severity ?? 0
	);
	if (giMax > 0) systemsAffected++;

	const cvMax = Math.max(
		data.cardiovascularSymptoms.tachycardia.severity ?? 0,
		data.cardiovascularSymptoms.hypotension.severity ?? 0,
		data.cardiovascularSymptoms.presyncope.severity ?? 0,
		data.cardiovascularSymptoms.syncope.severity ?? 0
	);
	if (cvMax > 0) systemsAffected++;

	const respMax = Math.max(
		data.respiratorySymptoms.wheezing.severity ?? 0,
		data.respiratorySymptoms.dyspnea.severity ?? 0,
		data.respiratorySymptoms.nasalCongestion.severity ?? 0,
		data.respiratorySymptoms.throatTightening.severity ?? 0
	);
	if (respMax > 0) systemsAffected++;

	const neuroMax = Math.max(
		data.neurologicalSymptoms.headache.severity ?? 0,
		data.neurologicalSymptoms.brainFog.severity ?? 0,
		data.neurologicalSymptoms.dizziness.severity ?? 0,
		data.neurologicalSymptoms.fatigue.severity ?? 0
	);
	if (neuroMax > 0) systemsAffected++;

	if (systemsAffected >= 3) {
		flags.push({
			id: 'FLAG-MULTI-001',
			category: 'Multi-System Involvement',
			message: `${systemsAffected} organ systems affected - meets criterion for multi-system mast cell activation`,
			priority: 'medium'
		});
	}

	// ─── No epinephrine prescribed ──────────────────────
	if (data.currentTreatment.epinephrine === 'no') {
		// Flag only if there are significant cardiovascular or respiratory symptoms
		const hasSevereSymptoms =
			(data.cardiovascularSymptoms.syncope.severity !== null && data.cardiovascularSymptoms.syncope.severity >= 1) ||
			(data.respiratorySymptoms.throatTightening.severity !== null && data.respiratorySymptoms.throatTightening.severity >= 1) ||
			(data.cardiovascularSymptoms.hypotension.severity !== null && data.cardiovascularSymptoms.hypotension.severity >= 2);

		if (hasSevereSymptoms) {
			flags.push({
				id: 'FLAG-EPI-001',
				category: 'No Epinephrine',
				message: 'Patient has cardiovascular or respiratory symptoms but no epinephrine auto-injector prescribed - consider prescribing',
				priority: 'high'
			});
		}
	}

	// ─── Elevated histamine ─────────────────────────────
	if (
		data.laboratoryResults.histamine !== null &&
		data.laboratoryResults.histamine > 1.0
	) {
		flags.push({
			id: 'FLAG-HISTAMINE-001',
			category: 'Elevated Histamine',
			message: `Plasma histamine elevated at ${data.laboratoryResults.histamine} ng/mL - supports mast cell activation diagnosis`,
			priority: 'medium'
		});
	}

	// ─── Elevated prostaglandin D2 ──────────────────────
	if (
		data.laboratoryResults.prostaglandinD2 !== null &&
		data.laboratoryResults.prostaglandinD2 > 0.3
	) {
		flags.push({
			id: 'FLAG-PGD2-001',
			category: 'Elevated Prostaglandin D2',
			message: `Prostaglandin D2 elevated at ${data.laboratoryResults.prostaglandinD2} ng/mL - supports mast cell activation diagnosis`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
