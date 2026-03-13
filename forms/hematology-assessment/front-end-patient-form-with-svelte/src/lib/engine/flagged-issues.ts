import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the abnormality score. These are actionable alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Pancytopenia detection ─────────────────────────────
	if (
		data.bloodCountAnalysis.hemoglobin !== null && data.bloodCountAnalysis.hemoglobin < 10.0 &&
		data.bloodCountAnalysis.whiteBloodCellCount !== null && data.bloodCountAnalysis.whiteBloodCellCount < 4.0 &&
		data.bloodCountAnalysis.plateletCount !== null && data.bloodCountAnalysis.plateletCount < 150.0
	) {
		flags.push({
			id: 'FLAG-CBC-001',
			category: 'Blood Count',
			message: 'Pancytopenia detected - all three cell lines depressed, urgent hematology review',
			priority: 'high'
		});
	}

	// ─── Severe neutropenia risk ─────────────────────────────
	if (data.bloodCountAnalysis.whiteBloodCellCount !== null && data.bloodCountAnalysis.whiteBloodCellCount < 1.0) {
		flags.push({
			id: 'FLAG-CBC-002',
			category: 'Blood Count',
			message: 'Severe leukopenia (WBC <1.0) - high infection risk, consider protective isolation',
			priority: 'high'
		});
	}

	// ─── Polycythemia ────────────────────────────────────────
	if (data.bloodCountAnalysis.hemoglobin !== null && data.bloodCountAnalysis.hemoglobin > 18.5) {
		flags.push({
			id: 'FLAG-CBC-003',
			category: 'Blood Count',
			message: 'Elevated hemoglobin >18.5 g/dL - evaluate for polycythemia',
			priority: 'medium'
		});
	}

	// ─── DIC suspected ───────────────────────────────────────
	if (
		data.coagulationStudies.fibrinogen !== null && data.coagulationStudies.fibrinogen < 100.0 &&
		data.coagulationStudies.dDimer !== null && data.coagulationStudies.dDimer > 2.0
	) {
		flags.push({
			id: 'FLAG-COAG-001',
			category: 'Coagulation',
			message: 'Low fibrinogen with elevated D-dimer - DIC workup recommended',
			priority: 'high'
		});
	}

	// ─── Prolonged aPTT ──────────────────────────────────────
	if (data.coagulationStudies.activatedPartialThromboplastinTime !== null && data.coagulationStudies.activatedPartialThromboplastinTime > 60.0) {
		flags.push({
			id: 'FLAG-COAG-002',
			category: 'Coagulation',
			message: 'Markedly prolonged aPTT (>60s) - evaluate for factor deficiency or lupus anticoagulant',
			priority: 'high'
		});
	}

	// ─── Elevated D-dimer ────────────────────────────────────
	if (data.coagulationStudies.dDimer !== null && data.coagulationStudies.dDimer > 5.0) {
		flags.push({
			id: 'FLAG-COAG-003',
			category: 'Coagulation',
			message: 'Severely elevated D-dimer (>5.0 mg/L) - consider PE/DVT workup',
			priority: 'high'
		});
	}

	// ─── Iron deficiency pattern ─────────────────────────────
	if (
		data.ironStudies.serumFerritin !== null && data.ironStudies.serumFerritin < 10.0 &&
		data.ironStudies.transferrinSaturation !== null && data.ironStudies.transferrinSaturation < 15.0
	) {
		flags.push({
			id: 'FLAG-IRON-001',
			category: 'Iron Studies',
			message: 'Iron deficiency pattern - low ferritin with low transferrin saturation',
			priority: 'medium'
		});
	}

	// ─── Iron overload pattern ───────────────────────────────
	if (data.ironStudies.serumFerritin !== null && data.ironStudies.serumFerritin > 1000.0) {
		flags.push({
			id: 'FLAG-IRON-002',
			category: 'Iron Studies',
			message: 'Markedly elevated ferritin (>1000 ng/mL) - evaluate for hemochromatosis or secondary overload',
			priority: 'high'
		});
	}

	// ─── Abnormal blood film ─────────────────────────────────
	if (
		data.peripheralBloodFilm.abnormalCellMorphology !== '' &&
		data.peripheralBloodFilm.abnormalCellMorphology !== 'none' &&
		data.peripheralBloodFilm.abnormalCellMorphology !== 'normal'
	) {
		flags.push({
			id: 'FLAG-FILM-001',
			category: 'Blood Film',
			message: 'Abnormal cell morphology reported on peripheral blood film - review recommended',
			priority: 'medium'
		});
	}

	// ─── Positive sickle cell screen ─────────────────────────
	if (data.hemoglobinopathyScreening.sickleCellScreen === 'positive') {
		flags.push({
			id: 'FLAG-HGB-001',
			category: 'Hemoglobinopathy',
			message: 'Positive sickle cell screen - confirmatory testing recommended',
			priority: 'medium'
		});
	}

	// ─── Positive thalassemia screen ─────────────────────────
	if (data.hemoglobinopathyScreening.thalassemiaScreen === 'positive') {
		flags.push({
			id: 'FLAG-HGB-002',
			category: 'Hemoglobinopathy',
			message: 'Positive thalassemia screen - genetic counseling may be indicated',
			priority: 'medium'
		});
	}

	// ─── Transfusion reaction history ────────────────────────
	if (
		data.transfusionHistory.transfusionReactions !== '' &&
		data.transfusionHistory.transfusionReactions !== 'none' &&
		data.transfusionHistory.transfusionReactions !== 'no'
	) {
		flags.push({
			id: 'FLAG-TRANS-001',
			category: 'Transfusion',
			message: 'Previous transfusion reactions reported - special precautions needed',
			priority: 'medium'
		});
	}

	// ─── Urgent clinical review ──────────────────────────────
	if (data.clinicalReview.urgencyLevel !== null && data.clinicalReview.urgencyLevel >= 4) {
		flags.push({
			id: 'FLAG-CLIN-001',
			category: 'Clinical',
			message: 'High urgency level indicated - expedited specialist review required',
			priority: 'high'
		});
	}

	// Sort: high > medium > low
	const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

	return flags;
}
