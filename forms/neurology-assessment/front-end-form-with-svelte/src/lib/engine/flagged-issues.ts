import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the neurologist,
 * independent of NIHSS score. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Acute stroke symptoms (HIGH) ───────────────────────
	const nihss = data.nihssAssessment;
	const hasAcuteDeficit =
		(nihss.consciousness !== null && nihss.consciousness >= 2) ||
		(nihss.motorLeftArm !== null && nihss.motorLeftArm >= 3) ||
		(nihss.motorRightArm !== null && nihss.motorRightArm >= 3) ||
		(nihss.motorLeftLeg !== null && nihss.motorLeftLeg >= 3) ||
		(nihss.motorRightLeg !== null && nihss.motorRightLeg >= 3) ||
		(nihss.language !== null && nihss.language >= 2);

	if (hasAcuteDeficit) {
		flags.push({
			id: 'FLAG-STROKE-001',
			category: 'Acute Stroke',
			message: 'Significant neurological deficit detected - consider acute stroke pathway',
			priority: 'high'
		});
	}

	if (data.chiefComplaint.onsetType === 'sudden') {
		flags.push({
			id: 'FLAG-STROKE-002',
			category: 'Acute Stroke',
			message: 'Sudden onset of symptoms - urgent evaluation required',
			priority: 'high'
		});
	}

	// ─── Status epilepticus (HIGH) ──────────────────────────
	if (data.seizureHistory.statusEpilepticus === 'yes') {
		flags.push({
			id: 'FLAG-SEIZURE-001',
			category: 'Seizure',
			message: 'History of status epilepticus - emergency seizure management plan required',
			priority: 'high'
		});
	}

	// ─── Raised ICP indicators (HIGH) ───────────────────────
	const hasICPSigns =
		(nihss.consciousness !== null && nihss.consciousness >= 2) &&
		data.headacheAssessment.redFlagWorstEver === 'yes';

	if (hasICPSigns) {
		flags.push({
			id: 'FLAG-ICP-001',
			category: 'Raised ICP',
			message: 'Possible raised intracranial pressure - reduced consciousness with worst headache',
			priority: 'high'
		});
	}

	if (
		data.diagnosticResults.mriCtFinding === 'mass' ||
		data.diagnosticResults.mriCtFinding === 'haemorrhage'
	) {
		flags.push({
			id: 'FLAG-ICP-002',
			category: 'Raised ICP',
			message: `Imaging finding: ${data.diagnosticResults.mriCtFinding} - assess for raised ICP`,
			priority: 'high'
		});
	}

	// ─── Anticoagulant use (MEDIUM) ─────────────────────────
	if (data.currentMedications.anticoagulants === 'yes') {
		flags.push({
			id: 'FLAG-ANTICOAG-001',
			category: 'Medication',
			message: `On anticoagulants: ${data.currentMedications.anticoagulantDetails || 'type not specified'} - bleeding risk with neurological procedures`,
			priority: 'medium'
		});
	}

	// ─── Headache red flags (HIGH) ──────────────────────────
	if (data.headacheAssessment.redFlagSuddenOnset === 'yes') {
		flags.push({
			id: 'FLAG-HEADACHE-001',
			category: 'Headache',
			message: 'Thunderclap/sudden-onset headache - rule out subarachnoid haemorrhage',
			priority: 'high'
		});
	}

	if (data.headacheAssessment.redFlagFever === 'yes' && data.headacheAssessment.redFlagNeckStiffness === 'yes') {
		flags.push({
			id: 'FLAG-HEADACHE-002',
			category: 'Headache',
			message: 'Headache with fever and neck stiffness - rule out meningitis',
			priority: 'high'
		});
	}

	if (data.headacheAssessment.redFlagNeurologicalDeficit === 'yes') {
		flags.push({
			id: 'FLAG-HEADACHE-003',
			category: 'Headache',
			message: 'Headache with focal neurological deficit - urgent imaging required',
			priority: 'high'
		});
	}

	// ─── Cognitive impairment (MEDIUM) ──────────────────────
	if (data.cognitiveAssessment.orientation === 'disoriented') {
		flags.push({
			id: 'FLAG-COGNITIVE-001',
			category: 'Cognitive',
			message: 'Patient disoriented - assess capacity and safety',
			priority: 'medium'
		});
	}

	if (data.cognitiveAssessment.mmseScore !== null && data.cognitiveAssessment.mmseScore < 24) {
		flags.push({
			id: 'FLAG-COGNITIVE-002',
			category: 'Cognitive',
			message: `MMSE score ${data.cognitiveAssessment.mmseScore}/30 - cognitive impairment detected`,
			priority: 'medium'
		});
	}

	// ─── Gait instability (MEDIUM) ──────────────────────────
	if (data.motorSensoryExam.gait === 'ataxic' || data.motorSensoryExam.gait === 'unable') {
		flags.push({
			id: 'FLAG-MOBILITY-001',
			category: 'Mobility',
			message: `Gait abnormality: ${data.motorSensoryExam.gait} - fall risk assessment needed`,
			priority: 'medium'
		});
	}

	// ─── Driving restrictions (LOW) ─────────────────────────
	if (data.functionalSocial.drivingStatus === 'not-driving-medical') {
		flags.push({
			id: 'FLAG-DRIVING-001',
			category: 'Functional',
			message: 'Patient not driving due to medical reasons - DVLA notification may be required',
			priority: 'low'
		});
	}

	// ─── Intracranial haemorrhage on imaging (HIGH) ─────────
	if (data.diagnosticResults.mriCtFinding === 'haemorrhage') {
		flags.push({
			id: 'FLAG-IMAGING-001',
			category: 'Imaging',
			message: 'Intracranial haemorrhage identified on imaging',
			priority: 'high'
		});
	}

	// ─── Abnormal EEG (MEDIUM) ──────────────────────────────
	if (data.diagnosticResults.eegFinding === 'epileptiform') {
		flags.push({
			id: 'FLAG-EEG-001',
			category: 'Diagnostics',
			message: 'Epileptiform activity on EEG - seizure management review needed',
			priority: 'medium'
		});
	}

	// ─── High disability score (MEDIUM) ─────────────────────
	if (data.functionalSocial.mrsScore !== null && data.functionalSocial.mrsScore >= 4) {
		flags.push({
			id: 'FLAG-DISABILITY-001',
			category: 'Functional',
			message: `Modified Rankin Scale ${data.functionalSocial.mrsScore} - significant disability, care support needed`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
