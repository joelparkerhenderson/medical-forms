// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

/** ASRS frequency score: 0=Never, 1=Rarely, 2=Sometimes, 3=Often, 4=Very Often */
export type ASRSScore = 0 | 1 | 2 | 3 | 4 | null;

/** ADHD Classification based on ASRS total and Part A screener */
export type ADHDClassification = 'unlikely' | 'possible' | 'likely' | 'highly-likely';

/** ADHD Subtype based on subscore analysis */
export type ADHDSubtype = 'inattentive' | 'hyperactive-impulsive' | 'combined' | 'unspecified';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	occupation: string;
	educationLevel: 'none' | 'secondary' | 'college' | 'undergraduate' | 'postgraduate' | '';
}

export interface ASRSPartA {
	/** Q1: How often do you have difficulty concentrating on what people say to you, even when they are speaking directly? */
	focusDifficulty: ASRSScore;
	/** Q2: How often do you have difficulty organizing tasks and activities? */
	organizationDifficulty: ASRSScore;
	/** Q3: How often do you have problems remembering appointments or obligations? */
	rememberingDifficulty: ASRSScore;
	/** Q4: When you have a task that requires sustained mental effort, how often do you avoid or delay starting it? */
	avoidingTasks: ASRSScore;
	/** Q5: How often do you fidget or squirm with your hands or feet when you have to sit down for a long time? */
	fidgeting: ASRSScore;
	/** Q6: How often do you feel overly active or compelled to do things, as if driven by a motor? */
	overlyActive: ASRSScore;
}

export interface ASRSPartB {
	/** Q7: How often do you make careless mistakes when you have to work on a boring or difficult project? */
	carelessMistakes: ASRSScore;
	/** Q8: How often do you have difficulty keeping your attention when you are doing boring or repetitive work? */
	attentionDifficulty: ASRSScore;
	/** Q9: How often do you have difficulty concentrating on what people say to you, even in a one-on-one situation? */
	concentrationDifficulty: ASRSScore;
	/** Q10: How often do you misplace or have difficulty finding things at home or at work? */
	misplacingThings: ASRSScore;
	/** Q11: How often are you distracted by activity or noise around you? */
	distractedByNoise: ASRSScore;
	/** Q12: How often do you leave your seat in meetings or other situations in which you are expected to remain seated? */
	leavingSeat: ASRSScore;
	/** Q13: How often do you feel restless or fidgety? */
	restlessness: ASRSScore;
	/** Q14: How often do you have difficulty unwinding and relaxing when you have time to yourself? */
	difficultyRelaxing: ASRSScore;
	/** Q15: How often do you find yourself talking too much when you are in social situations? */
	talkingTooMuch: ASRSScore;
	/** Q16: How often do you finish the sentences of people you are talking to before they can finish them? */
	finishingSentences: ASRSScore;
	/** Q17: How often do you have difficulty waiting your turn in situations when turn-taking is required? */
	difficultyWaiting: ASRSScore;
	/** Q18: How often do you interrupt others when they are busy? */
	interruptingOthers: ASRSScore;
}

export interface ChildhoodHistory {
	childhoodSymptoms: YesNo;
	childhoodSymptomsDetails: string;
	schoolPerformance: 'above-average' | 'average' | 'below-average' | 'failing' | '';
	behaviouralReports: YesNo;
	behaviouralReportsDetails: string;
	onsetBeforeAge12: YesNo;
}

export interface FunctionalImpact {
	workAcademicImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
	relationshipImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
	dailyLivingImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
	financialManagementImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
	timeManagementImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
}

export interface ComorbidConditions {
	anxiety: YesNo;
	anxietyDetails: string;
	depression: YesNo;
	depressionDetails: string;
	substanceUse: YesNo;
	substanceUseDetails: string;
	sleepDisorders: YesNo;
	sleepDisordersDetails: string;
	learningDisabilities: YesNo;
	learningDisabilitiesDetails: string;
	autismSpectrum: YesNo;
	autismSpectrumDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface MedicalHistory {
	cardiovascularIssues: YesNo;
	cardiovascularDetails: string;
	seizureHistory: YesNo;
	seizureDetails: string;
	ticDisorder: YesNo;
	ticDetails: string;
	thyroidDisease: YesNo;
	thyroidDetails: string;
	headInjuries: YesNo;
	headInjuryDetails: string;
}

export interface SocialSupport {
	familyHistoryADHD: YesNo;
	familyHistoryDetails: string;
	supportSystems: string;
	copingStrategies: string;
	previousAssessments: YesNo;
	previousAssessmentDetails: string;
	previousDiagnosis: YesNo;
	previousDiagnosisDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	asrsPartA: ASRSPartA;
	asrsPartB: ASRSPartB;
	childhoodHistory: ChildhoodHistory;
	functionalImpact: FunctionalImpact;
	comorbidConditions: ComorbidConditions;
	medications: Medication[];
	allergies: Allergy[];
	medicalHistory: MedicalHistory;
	socialSupport: SocialSupport;
}

// ──────────────────────────────────────────────
// ASRS grading types
// ──────────────────────────────────────────────

export interface ASRSRule {
	id: string;
	domain: string;
	description: string;
	classification: ADHDClassification;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	domain: string;
	description: string;
	classification: ADHDClassification;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	asrsTotal: number;
	partAScore: number;
	partBScore: number;
	inattentiveSubscore: number;
	hyperactiveImpulsiveSubscore: number;
	partAScreenerPositive: boolean;
	classification: ADHDClassification;
	subtype: ADHDSubtype;
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
	section: keyof AssessmentData | 'medications' | 'allergies';
	isConditional?: boolean;
	shouldShow?: (data: AssessmentData) => boolean;
}
