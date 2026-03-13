use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_age: String,
    pub patient_sex: String,
    pub referral_source: String,
    pub assessment_date: String,
    pub clinician_name: String,
    pub clinician_role: String,
}

// ─── Presenting Complaint (Step 2) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PresentingComplaint {
    pub chief_complaint: String,
    pub onset_duration: String,
    pub symptom_severity: Option<u8>,
    pub functional_impact: Option<u8>,
    pub symptom_progression: String,
    pub precipitating_factors: String,
}

// ─── Psychiatric History (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PsychiatricHistory {
    pub previous_diagnoses: String,
    pub previous_hospitalizations: String,
    pub hospitalization_count: String,
    pub previous_treatments: String,
    pub treatment_response: Option<u8>,
    pub therapy_history: String,
}

// ─── Mental State Examination (Step 4) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MentalStateExamination {
    pub appearance_behaviour: Option<u8>,
    pub speech_assessment: Option<u8>,
    pub mood_rating: Option<u8>,
    pub affect_congruence: Option<u8>,
    pub thought_form: Option<u8>,
    pub thought_content: Option<u8>,
    pub perception: Option<u8>,
    pub cognition: Option<u8>,
    pub insight_judgement: Option<u8>,
}

// ─── Risk Assessment (Step 5) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RiskAssessment {
    pub suicidal_ideation: Option<u8>,
    pub self_harm_risk: Option<u8>,
    pub harm_to_others: Option<u8>,
    pub safeguarding_concerns: Option<u8>,
    pub risk_plan_specificity: Option<u8>,
    pub protective_factors: Option<u8>,
}

// ─── Substance Use (Step 6) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SubstanceUse {
    pub alcohol_use: Option<u8>,
    pub drug_use: Option<u8>,
    pub tobacco_use: String,
    pub substance_impact: Option<u8>,
    pub withdrawal_risk: Option<u8>,
    pub readiness_to_change: Option<u8>,
}

// ─── Social & Functional (Step 7) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SocialFunctional {
    pub living_situation: String,
    pub employment_status: String,
    pub social_support: Option<u8>,
    pub daily_functioning: Option<u8>,
    pub relationship_quality: Option<u8>,
    pub financial_concerns: String,
}

// ─── Family History (Step 8) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FamilyHistory {
    pub family_psychiatric_history: String,
    pub family_suicide_history: String,
    pub family_substance_use: String,
    pub adverse_childhood_experiences: Option<u8>,
    pub family_support_level: Option<u8>,
    pub genetic_risk_factors: String,
}

// ─── Current Treatment (Step 9) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub current_medications: String,
    pub medication_adherence: Option<u8>,
    pub side_effects_severity: Option<u8>,
    pub therapy_engagement: Option<u8>,
    pub treatment_satisfaction: Option<u8>,
    pub barriers_to_treatment: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_severity: Option<u8>,
    pub treatment_urgency: Option<u8>,
    pub prognosis_outlook: Option<u8>,
    pub clinical_notes: String,
    pub follow_up_plan: String,
    pub additional_referrals: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub presenting_complaint: PresentingComplaint,
    pub psychiatric_history: PsychiatricHistory,
    pub mental_state_examination: MentalStateExamination,
    pub risk_assessment: RiskAssessment,
    pub substance_use: SubstanceUse,
    pub social_functional: SocialFunctional,
    pub family_history: FamilyHistory,
    pub current_treatment: CurrentTreatment,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ──────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub concern_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdditionalFlag {
    pub id: String,
    pub category: String,
    pub message: String,
    pub priority: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradingResult {
    pub severity_level: SeverityLevel,
    pub severity_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
