import type { CasualtyCardData, GradingResult } from '$lib/engine/types';

function createDefaultData(): CasualtyCardData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			nhsNumber: '',
			address: '',
			postcode: '',
			phone: '',
			email: '',
			ethnicity: '',
			preferredLanguage: '',
			interpreterRequired: ''
		},
		nextOfKinGP: {
			nextOfKin: {
				name: '',
				relationship: '',
				phone: '',
				notified: ''
			},
			gp: {
				name: '',
				practiceName: '',
				practiceAddress: '',
				practicePhone: ''
			}
		},
		arrivalTriage: {
			attendanceDate: '',
			arrivalTime: '',
			attendanceCategory: '',
			arrivalMode: '',
			referralSource: '',
			ambulanceIncidentNumber: '',
			triageTime: '',
			triageNurse: '',
			mtsFlowchart: '',
			mtsCategory: '',
			mtsDiscriminator: ''
		},
		presentingComplaint: {
			chiefComplaint: '',
			historyOfPresentingComplaint: '',
			onset: '',
			duration: '',
			character: '',
			severity: '',
			location: '',
			radiation: '',
			aggravatingFactors: '',
			relievingFactors: '',
			associatedSymptoms: '',
			previousEpisodes: '',
			treatmentPriorToArrival: ''
		},
		painAssessment: {
			painPresent: '',
			painScore: null,
			painLocation: '',
			painCharacter: '',
			painOnset: '',
			painSeverityCategory: ''
		},
		medicalHistory: {
			pastMedicalHistory: '',
			pastSurgicalHistory: '',
			medications: [],
			allergies: [],
			tetanusStatus: '',
			smokingStatus: '',
			alcoholConsumption: '',
			recreationalDrugUse: '',
			lastOralIntake: ''
		},
		vitalSigns: {
			heartRate: null,
			systolicBP: null,
			diastolicBP: null,
			respiratoryRate: null,
			oxygenSaturation: null,
			supplementalOxygen: '',
			oxygenFlowRate: null,
			temperature: null,
			bloodGlucose: null,
			consciousnessLevel: '',
			pupilLeftSize: null,
			pupilLeftReactive: '',
			pupilRightSize: null,
			pupilRightReactive: '',
			capillaryRefillTime: null,
			weight: null
		},
		primarySurvey: {
			airway: {
				status: '',
				adjuncts: '',
				cSpineImmobilised: ''
			},
			breathing: {
				effort: '',
				chestMovement: '',
				breathSounds: '',
				tracheaPosition: ''
			},
			circulation: {
				pulseCharacter: '',
				skinColour: '',
				skinTemperature: '',
				capillaryRefill: '',
				haemorrhage: '',
				ivAccess: ''
			},
			disability: {
				gcsEye: null,
				gcsVerbal: null,
				gcsMotor: null,
				gcsTotal: null,
				pupils: '',
				bloodGlucose: '',
				limbMovements: ''
			},
			exposure: {
				skinExamination: '',
				injuriesIdentified: '',
				logRollFindings: ''
			}
		},
		clinicalExamination: {
			generalAppearance: '',
			headAndFace: '',
			neck: '',
			chestCardiovascular: '',
			chestRespiratory: '',
			abdomen: '',
			pelvis: '',
			musculoskeletalLimbs: '',
			neurological: '',
			skin: '',
			mentalState: '',
			bodyDiagramNotes: ''
		},
		investigations: {
			bloodTests: [],
			urinalysis: '',
			pregnancyTest: '',
			imaging: [],
			ecgPerformed: '',
			ecgFindings: '',
			otherInvestigations: ''
		},
		treatment: {
			medicationsAdministered: [],
			fluidTherapy: [],
			procedures: [],
			oxygenTherapyDevice: '',
			oxygenTherapyFlowRate: '',
			tetanusProphylaxis: ''
		},
		assessmentPlan: {
			workingDiagnosis: '',
			differentialDiagnoses: '',
			clinicalImpression: '',
			riskStratification: ''
		},
		disposition: {
			disposition: '',
			admittingSpecialty: '',
			admittingConsultant: '',
			ward: '',
			levelOfCare: '',
			dischargeDiagnosis: '',
			dischargeMedications: '',
			dischargeInstructions: '',
			followUp: '',
			returnPrecautions: '',
			receivingHospital: '',
			reasonForTransfer: '',
			modeOfTransfer: '',
			dischargeTime: '',
			totalTimeInDepartment: ''
		},
		safeguardingConsent: {
			safeguardingConcern: '',
			safeguardingType: '',
			referralMade: '',
			mentalCapacityAssessment: '',
			mentalHealthActStatus: '',
			consentForTreatment: '',
			completedByName: '',
			completedByRole: '',
			completedByGmcNumber: '',
			seniorReviewingClinician: ''
		}
	};
}

class CasualtyCardStore {
	data = $state<CasualtyCardData>(createDefaultData());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultData();
		this.result = null;
		this.currentStep = 1;
	}
}

export const casualtyCard = new CasualtyCardStore();
