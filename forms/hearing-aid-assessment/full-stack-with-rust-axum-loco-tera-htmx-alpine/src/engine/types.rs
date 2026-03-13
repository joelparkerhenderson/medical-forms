use serde::{Deserialize, Serialize};

pub type HearingAidLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub referral_source: String,
    pub assessment_date: String,
    pub audiologist_name: String,
}

// ─── Hearing History (Step 2) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HearingHistory {
    pub onset_duration: String,
    pub hearing_loss_type: String,
    pub affected_ear: String,
    pub family_history: String,
    pub noise_exposure: String,
    pub tinnitus_present: String,
    pub previous_hearing_aid_use: String,
    pub medical_conditions: String,
}

// ─── Audiometric Results (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AudiometricResults {
    pub right_ear_pta: Option<u8>,
    pub left_ear_pta: Option<u8>,
    pub speech_recognition_right: Option<u8>,
    pub speech_recognition_left: Option<u8>,
    pub hearing_loss_severity: String,
    pub audiogram_configuration: String,
}

// ─── Communication Needs (Step 4) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CommunicationNeeds {
    pub quiet_conversation: Option<u8>,
    pub group_conversation: Option<u8>,
    pub telephone_use: Option<u8>,
    pub television_listening: Option<u8>,
    pub public_settings: Option<u8>,
    pub workplace_communication: Option<u8>,
}

// ─── Lifestyle Assessment (Step 5) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LifestyleAssessment {
    pub social_activity_level: Option<u8>,
    pub outdoor_activity_level: Option<u8>,
    pub technology_comfort: Option<u8>,
    pub manual_dexterity: Option<u8>,
    pub cosmetic_concern: Option<u8>,
    pub motivation_level: Option<u8>,
}

// ─── Current Hearing Aids (Step 6) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentHearingAids {
    pub currently_wearing: String,
    pub current_aid_type: String,
    pub current_aid_age: String,
    pub satisfaction_with_current: Option<u8>,
    pub daily_usage_hours: String,
    pub current_aid_issues: String,
}

// ─── Fitting Requirements (Step 7) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FittingRequirements {
    pub preferred_style: String,
    pub ear_canal_suitability: Option<u8>,
    pub connectivity_needs: Option<u8>,
    pub rechargeable_preference: String,
    pub bilateral_fitting: String,
    pub budget_range: String,
}

// ─── Expectations & Goals (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ExpectationsGoals {
    pub realistic_expectations: Option<u8>,
    pub primary_goal: String,
    pub willingness_to_adapt: Option<u8>,
    pub support_system: Option<u8>,
    pub follow_up_commitment: Option<u8>,
    pub overall_readiness: Option<u8>,
}

// ─── Trial Period (Step 9) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TrialPeriod {
    pub trial_duration: String,
    pub initial_comfort: Option<u8>,
    pub sound_quality: Option<u8>,
    pub feedback_management: Option<u8>,
    pub daily_wear_compliance: Option<u8>,
    pub reported_benefit: Option<u8>,
}

// ─── Clinical Review (Step 10) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub aided_improvement: Option<u8>,
    pub patient_satisfaction: Option<u8>,
    pub recommendation_confidence: Option<u8>,
    pub additional_services_needed: String,
    pub clinician_notes: String,
    pub follow_up_plan: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub hearing_history: HearingHistory,
    pub audiometric_results: AudiometricResults,
    pub communication_needs: CommunicationNeeds,
    pub lifestyle_assessment: LifestyleAssessment,
    pub current_hearing_aids: CurrentHearingAids,
    pub fitting_requirements: FittingRequirements,
    pub expectations_goals: ExpectationsGoals,
    pub trial_period: TrialPeriod,
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
    pub hearing_aid_level: HearingAidLevel,
    pub hearing_aid_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
