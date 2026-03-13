// ─── Basic types ────────────────────────────────────────────

export type Sex = 'male' | 'female' | 'other' | '';
export type YesNo = 'yes' | 'no' | '';
export type LikertScore = 1 | 2 | 3 | 4 | 5;

export type VisitType =
	| 'routine-checkup'
	| 'follow-up'
	| 'urgent-care'
	| 'specialist-referral'
	| 'procedure'
	| 'other'
	| '';

// ─── Assessment data interfaces ─────────────────────────────

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface VisitInformation {
	visitDate: string;
	department: string;
	providerName: string;
	visitType: VisitType;
	reasonForVisit: string;
	firstVisit: YesNo;
}

export interface AccessScheduling {
	easeOfScheduling: LikertScore | null;
	waitForAppointment: LikertScore | null;
	waitInWaitingRoom: LikertScore | null;
}

export interface Communication {
	listening: LikertScore | null;
	explainingCondition: LikertScore | null;
	answeringQuestions: LikertScore | null;
	timeSpent: LikertScore | null;
}

export interface StaffProfessionalism {
	receptionCourtesy: LikertScore | null;
	nursingCourtesy: LikertScore | null;
	respectShown: LikertScore | null;
}

export interface CareQuality {
	involvementInDecisions: LikertScore | null;
	treatmentPlanExplanation: LikertScore | null;
	confidenceInCare: LikertScore | null;
}

export interface Environment {
	cleanliness: LikertScore | null;
	waitingAreaComfort: LikertScore | null;
	privacy: LikertScore | null;
}

export interface OverallSatisfaction {
	overallRating: LikertScore | null;
	likelyToRecommend: LikertScore | null;
	likelyToReturn: LikertScore | null;
	comments: string;
}

// ─── Composite assessment data ──────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	visitInformation: VisitInformation;
	accessScheduling: AccessScheduling;
	communication: Communication;
	staffProfessionalism: StaffProfessionalism;
	careQuality: CareQuality;
	environment: Environment;
	overallSatisfaction: OverallSatisfaction;
}

// ─── Questions ──────────────────────────────────────────────

export interface SatisfactionQuestion {
	id: string;
	domain: string;
	field: string;
	text: string;
}

// ─── Grading result ─────────────────────────────────────────

export interface DomainScore {
	domain: string;
	mean: number;
	count: number;
	questions: { id: string; text: string; score: number }[];
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	compositeScore: number;
	category: string;
	domainScores: DomainScore[];
	additionalFlags: AdditionalFlag[];
	answeredCount: number;
	timestamp: string;
}

// ─── Step config ────────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: string;
}
