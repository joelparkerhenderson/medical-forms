import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			occupation: '',
			dominantHand: ''
		},
		chiefComplaint: {
			primaryConcern: '',
			affectedJoint: '',
			side: '',
			duration: '',
			onsetType: '',
			aggravatingFactors: []
		},
		painAssessment: {
			currentPainLevel: null,
			worstPain: null,
			bestPain: null,
			painCharacter: '',
			painFrequency: '',
			nightPain: '',
			painWithWeightBearing: ''
		},
		dashQuestionnaire: {
			q1: null, q2: null, q3: null, q4: null, q5: null,
			q6: null, q7: null, q8: null, q9: null, q10: null,
			q11: null, q12: null, q13: null, q14: null, q15: null,
			q16: null, q17: null, q18: null, q19: null, q20: null,
			q21: null, q22: null, q23: null, q24: null, q25: null,
			q26: null, q27: null, q28: null, q29: null, q30: null
		},
		rangeOfMotion: {
			joint: '',
			flexion: null,
			extension: null,
			abduction: null,
			adduction: null,
			internalRotation: null,
			externalRotation: null,
			notes: ''
		},
		strengthTesting: {
			gripStrengthLeft: null,
			gripStrengthRight: null,
			manualMuscleGrade: '',
			specificWeaknesses: ''
		},
		functionalLimitations: {
			difficultyWithADLs: [],
			mobilityAids: [],
			workRestrictions: '',
			sportRestrictions: ''
		},
		imagingHistory: {
			xRay: { performed: '', date: '', findings: '' },
			mri: { performed: '', date: '', findings: '' },
			ctScan: { performed: '', date: '', findings: '' },
			ultrasound: { performed: '', date: '', findings: '' }
		},
		currentTreatment: {
			medications: [],
			physicalTherapy: '',
			physicalTherapyDetails: '',
			injections: '',
			injectionDetails: '',
			braceOrSplint: '',
			braceDetails: '',
			otherTreatments: '',
			allergies: []
		},
		surgicalHistory: {
			previousOrthopedicSurgery: '',
			surgeries: [],
			anesthesiaComplications: '',
			anesthesiaDetails: '',
			willingToConsiderSurgery: ''
		}
	};
}

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessment());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
