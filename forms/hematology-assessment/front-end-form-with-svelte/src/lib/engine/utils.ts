import type { AssessmentData, AbnormalityLevel } from './types';

/** Returns a human-readable label for an abnormality level. */
export function abnormalityLevelLabel(level: AbnormalityLevel): string {
	switch (level) {
		case 'critical':
			return 'Critical';
		case 'severeAbnormality':
			return 'Severe Abnormality';
		case 'moderateAbnormality':
			return 'Moderate Abnormality';
		case 'mildAbnormality':
			return 'Mild Abnormality';
		case 'normal':
			return 'Normal';
		case 'draft':
			return 'Draft';
		default:
			return 'Unknown';
	}
}

/** Abnormality level colour class for Tailwind. */
export function abnormalityLevelColor(level: AbnormalityLevel): string {
	switch (level) {
		case 'critical':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'severeAbnormality':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'moderateAbnormality':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'mildAbnormality':
			return 'bg-blue-100 text-blue-800 border-blue-300';
		case 'normal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'draft':
			return 'bg-gray-100 text-gray-700 border-gray-300';
		default:
			return 'bg-gray-100 text-gray-700 border-gray-300';
	}
}

/** Collect all numeric lab values from the assessment data as (number | null)[]. */
export function collectNumericItems(data: AssessmentData): (number | null)[] {
	return [
		// Blood Count Analysis (8 items)
		data.bloodCountAnalysis.hemoglobin,
		data.bloodCountAnalysis.hematocrit,
		data.bloodCountAnalysis.redBloodCellCount,
		data.bloodCountAnalysis.whiteBloodCellCount,
		data.bloodCountAnalysis.plateletCount,
		data.bloodCountAnalysis.meanCorpuscularVolume,
		data.bloodCountAnalysis.meanCorpuscularHemoglobin,
		data.bloodCountAnalysis.redCellDistributionWidth,
		// Coagulation Studies (6 items)
		data.coagulationStudies.prothrombinTime,
		data.coagulationStudies.inr,
		data.coagulationStudies.activatedPartialThromboplastinTime,
		data.coagulationStudies.fibrinogen,
		data.coagulationStudies.dDimer,
		data.coagulationStudies.bleedingTime,
		// Iron Studies (5 items)
		data.ironStudies.serumIron,
		data.ironStudies.totalIronBindingCapacity,
		data.ironStudies.transferrinSaturation,
		data.ironStudies.serumFerritin,
		data.ironStudies.reticulocyteCount
	];
}

/**
 * Calculate a composite abnormality score (0-100) from lab values.
 *
 * The score is based on how far each lab value deviates from its normal range.
 * 0 = all values normal, 100 = maximally abnormal.
 *
 * Returns null if no numeric items are answered.
 */
export function calculateAbnormalityScore(data: AssessmentData): number | null {
	const deviations: number[] = [];

	function deviation(
		value: number | null,
		low: number,
		high: number,
		severeLow: number,
		severeHigh: number
	): number | null {
		if (value === null) return null;
		if (value >= low && value <= high) return 0.0;
		if (value < low) {
			const dist = (low - value) / Math.max(low - severeLow, 0.01);
			return Math.min(dist, 1.0);
		}
		const dist = (value - high) / Math.max(severeHigh - high, 0.01);
		return Math.min(dist, 1.0);
	}

	// Hemoglobin: normal 12-17 g/dL, severe <6 or >22
	const dHgb = deviation(data.bloodCountAnalysis.hemoglobin, 12.0, 17.0, 6.0, 22.0);
	if (dHgb !== null) deviations.push(dHgb);

	// Hematocrit: normal 36-52%, severe <20 or >65
	const dHct = deviation(data.bloodCountAnalysis.hematocrit, 36.0, 52.0, 20.0, 65.0);
	if (dHct !== null) deviations.push(dHct);

	// RBC: normal 4.0-6.0, severe <2.0 or >8.0
	const dRbc = deviation(data.bloodCountAnalysis.redBloodCellCount, 4.0, 6.0, 2.0, 8.0);
	if (dRbc !== null) deviations.push(dRbc);

	// WBC: normal 4.0-11.0, severe <1.0 or >30.0
	const dWbc = deviation(data.bloodCountAnalysis.whiteBloodCellCount, 4.0, 11.0, 1.0, 30.0);
	if (dWbc !== null) deviations.push(dWbc);

	// Platelets: normal 150-400, severe <20 or >1000
	const dPlt = deviation(data.bloodCountAnalysis.plateletCount, 150.0, 400.0, 20.0, 1000.0);
	if (dPlt !== null) deviations.push(dPlt);

	// MCV: normal 80-100, severe <50 or >130
	const dMcv = deviation(data.bloodCountAnalysis.meanCorpuscularVolume, 80.0, 100.0, 50.0, 130.0);
	if (dMcv !== null) deviations.push(dMcv);

	// MCH: normal 27-33, severe <15 or >45
	const dMch = deviation(data.bloodCountAnalysis.meanCorpuscularHemoglobin, 27.0, 33.0, 15.0, 45.0);
	if (dMch !== null) deviations.push(dMch);

	// RDW: normal 11.5-14.5%, severe <8 or >25
	const dRdw = deviation(data.bloodCountAnalysis.redCellDistributionWidth, 11.5, 14.5, 8.0, 25.0);
	if (dRdw !== null) deviations.push(dRdw);

	// PT: normal 11-13.5 seconds, severe <8 or >30
	const dPt = deviation(data.coagulationStudies.prothrombinTime, 11.0, 13.5, 8.0, 30.0);
	if (dPt !== null) deviations.push(dPt);

	// INR: normal 0.8-1.2, severe <0.5 or >5.0
	const dInr = deviation(data.coagulationStudies.inr, 0.8, 1.2, 0.5, 5.0);
	if (dInr !== null) deviations.push(dInr);

	// aPTT: normal 25-35 seconds, severe <15 or >80
	const dAptt = deviation(data.coagulationStudies.activatedPartialThromboplastinTime, 25.0, 35.0, 15.0, 80.0);
	if (dAptt !== null) deviations.push(dAptt);

	// Fibrinogen: normal 200-400 mg/dL, severe <50 or >800
	const dFib = deviation(data.coagulationStudies.fibrinogen, 200.0, 400.0, 50.0, 800.0);
	if (dFib !== null) deviations.push(dFib);

	// D-dimer: normal 0-0.5 mg/L, severe >5.0
	const dDd = deviation(data.coagulationStudies.dDimer, 0.0, 0.5, 0.0, 5.0);
	if (dDd !== null) deviations.push(dDd);

	// Serum iron: normal 60-170 mcg/dL, severe <10 or >300
	const dIron = deviation(data.ironStudies.serumIron, 60.0, 170.0, 10.0, 300.0);
	if (dIron !== null) deviations.push(dIron);

	// TIBC: normal 250-370 mcg/dL, severe <100 or >600
	const dTibc = deviation(data.ironStudies.totalIronBindingCapacity, 250.0, 370.0, 100.0, 600.0);
	if (dTibc !== null) deviations.push(dTibc);

	// Transferrin saturation: normal 20-50%, severe <5 or >90
	const dTsat = deviation(data.ironStudies.transferrinSaturation, 20.0, 50.0, 5.0, 90.0);
	if (dTsat !== null) deviations.push(dTsat);

	// Ferritin: normal 20-250 ng/mL, severe <5 or >1000
	const dFer = deviation(data.ironStudies.serumFerritin, 20.0, 250.0, 5.0, 1000.0);
	if (dFer !== null) deviations.push(dFer);

	// Reticulocyte count: normal 0.5-2.5%, severe <0.1 or >10
	const dRet = deviation(data.ironStudies.reticulocyteCount, 0.5, 2.5, 0.1, 10.0);
	if (dRet !== null) deviations.push(dRet);

	if (deviations.length === 0) return null;

	const sum = deviations.reduce((a, b) => a + b, 0);
	const avg = sum / deviations.length;
	const score = Math.round(avg * 100);
	return Math.min(score, 100);
}

/** Calculate the blood count dimension score (0-100). */
export function bloodCountScore(data: AssessmentData): number | null {
	const items = collectNumericItems(data);
	const answered = items.slice(0, 8).filter((x) => x !== null);
	if (answered.length === 0) return null;

	const emptyData: AssessmentData = createEmptyAssessmentData();
	emptyData.bloodCountAnalysis = { ...data.bloodCountAnalysis };
	return calculateAbnormalityScore(emptyData);
}

/** Calculate the coagulation dimension score (0-100). */
export function coagulationScore(data: AssessmentData): number | null {
	const items = collectNumericItems(data);
	const answered = items.slice(8, 14).filter((x) => x !== null);
	if (answered.length === 0) return null;

	const emptyData: AssessmentData = createEmptyAssessmentData();
	emptyData.coagulationStudies = { ...data.coagulationStudies };
	return calculateAbnormalityScore(emptyData);
}

/** Calculate the iron studies dimension score (0-100). */
export function ironStudiesScore(data: AssessmentData): number | null {
	const items = collectNumericItems(data);
	const answered = items.slice(14, 19).filter((x) => x !== null);
	if (answered.length === 0) return null;

	const emptyData: AssessmentData = createEmptyAssessmentData();
	emptyData.ironStudies = { ...data.ironStudies };
	return calculateAbnormalityScore(emptyData);
}

/** Create an empty AssessmentData with default values. */
function createEmptyAssessmentData(): AssessmentData {
	return {
		patientInformation: {
			patientName: '',
			dateOfBirth: '',
			medicalRecordNumber: '',
			referringPhysician: '',
			clinicalIndication: '',
			specimenDate: '',
			specimenType: ''
		},
		bloodCountAnalysis: {
			hemoglobin: null,
			hematocrit: null,
			redBloodCellCount: null,
			whiteBloodCellCount: null,
			plateletCount: null,
			meanCorpuscularVolume: null,
			meanCorpuscularHemoglobin: null,
			redCellDistributionWidth: null
		},
		coagulationStudies: {
			prothrombinTime: null,
			inr: null,
			activatedPartialThromboplastinTime: null,
			fibrinogen: null,
			dDimer: null,
			bleedingTime: null
		},
		peripheralBloodFilm: {
			redCellMorphology: '',
			whiteBloodCellDifferential: '',
			plateletMorphology: '',
			abnormalCellMorphology: '',
			filmQuality: null,
			filmComments: ''
		},
		ironStudies: {
			serumIron: null,
			totalIronBindingCapacity: null,
			transferrinSaturation: null,
			serumFerritin: null,
			reticulocyteCount: null
		},
		hemoglobinopathyScreening: {
			hemoglobinElectrophoresis: '',
			sickleCellScreen: '',
			thalassemiaScreen: '',
			hplcResults: '',
			geneticTestingNotes: ''
		},
		boneMarrowAssessment: {
			aspirateFindings: '',
			biopsyFindings: '',
			cellularity: null,
			cytogeneticsResults: '',
			flowCytometryResults: '',
			boneMarrowComments: ''
		},
		transfusionHistory: {
			previousTransfusions: '',
			transfusionReactions: '',
			bloodGroupType: '',
			antibodyScreen: '',
			crossmatchResults: ''
		},
		treatmentMedications: {
			currentMedications: '',
			chemotherapyRegimen: '',
			anticoagulantTherapy: '',
			ironTherapy: '',
			treatmentResponse: '',
			adverseEffects: ''
		},
		clinicalReview: {
			clinicalSummary: '',
			diagnosis: '',
			followUpPlan: '',
			urgencyLevel: null,
			reviewerName: '',
			reviewDate: '',
			additionalNotes: ''
		}
	};
}
