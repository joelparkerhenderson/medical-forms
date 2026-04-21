// ──────────────────────────────────────────────
// Core survey data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type LikertScore = 1 | 2 | 3 | 4 | 5;

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	ageRange: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65-74' | '75-plus' | '';
	ethnicity: string;
	preferredLanguage: string;
	interpreterRequired: YesNo;
}

export interface VisitDetails {
	visitDate: string;
	visitType: 'outpatient' | 'inpatient' | 'day-case' | 'emergency' | 'telehealth' | 'home-visit' | '';
	department: string;
	hospitalSite: string;
	lengthOfStayDays: number | null;
	referralSource: 'gp' | 'self' | 'emergency' | 'another-hospital' | 'specialist' | '';
	isFirstVisit: YesNo;
}

export interface AccessWaitingTimes {
	easeOfBooking: number | null;
	waitingTimeForAppointment: number | null;
	waitingTimeOnDay: number | null;
	receptionService: number | null;
	signageWayfinding: number | null;
	parkingTransport: number | null;
	actualWaitMinutes: number | null;
}

export interface CommunicationInformation {
	explanationOfCondition: number | null;
	explanationOfTreatment: number | null;
	opportunityToAskQuestions: number | null;
	listenedTo: number | null;
	informedAboutMedication: number | null;
	writtenInformationQuality: number | null;
}

export interface ClinicalCareQuality {
	confidenceInClinician: number | null;
	thoroughnessOfExamination: number | null;
	painManagement: number | null;
	involvementInDecisions: number | null;
	privacyDuringExamination: number | null;
	coordinationOfCare: number | null;
}

export interface StaffAttitude {
	doctorCourtesy: number | null;
	nurseCourtesy: number | null;
	receptionCourtesy: number | null;
	respectForDignity: number | null;
	culturalSensitivity: number | null;
	emotionalSupport: number | null;
}

export interface EnvironmentFacilities {
	cleanliness: number | null;
	comfort: number | null;
	noiseLevels: number | null;
	foodQuality: number | null;
	toiletFacilities: number | null;
	temperatureComfort: number | null;
}

export interface DischargeFollowUp {
	dischargeInformation: number | null;
	medicationExplanation: number | null;
	followUpArrangements: number | null;
	knewWhoToContact: number | null;
	recoveryInformation: number | null;
	carePlanClarity: number | null;
}

export interface OverallExperience {
	overallSatisfaction: number | null;
	wouldRecommend: number | null;
	metExpectations: number | null;
	feltSafe: number | null;
	wouldReturn: number | null;
	nhsRating: number | null;
}

export interface CommentsSuggestions {
	whatWentWell: string;
	whatCouldImprove: string;
	specificStaffPraise: string;
	complaintRaised: YesNo;
	complaintDetails: string;
	additionalComments: string;
	consentToContact: YesNo;
	contactEmail: string;
	contactPhone: string;
}

// ──────────────────────────────────────────────
// Full survey data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	visitDetails: VisitDetails;
	accessWaitingTimes: AccessWaitingTimes;
	communicationInformation: CommunicationInformation;
	clinicalCareQuality: ClinicalCareQuality;
	staffAttitude: StaffAttitude;
	environmentFacilities: EnvironmentFacilities;
	dischargeFollowUp: DischargeFollowUp;
	overallExperience: OverallExperience;
	commentsSuggestions: CommentsSuggestions;
}

// ──────────────────────────────────────────────
// Satisfaction grading types
// ──────────────────────────────────────────────

export type SatisfactionCategory = 'excellent' | 'good' | 'satisfactory' | 'poor' | 'very-poor';

export interface SatisfactionRule {
	id: string;
	domain: string;
	description: string;
	severity: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	domain: string;
	description: string;
	severity: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface DomainScores {
	access: number | null;
	communication: number | null;
	clinicalCare: number | null;
	staff: number | null;
	environment: number | null;
	discharge: number | null;
	overall: number | null;
}

export interface GradingResult {
	normalizedScore: number;
	satisfactionCategory: SatisfactionCategory;
	domainScores: DomainScores;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: keyof AssessmentData;
}
