use serde::{Deserialize, Serialize};

pub type LikelihoodLevel = String;

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
    pub clinic_location: String,
}

// ─── Developmental History (Step 2) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DevelopmentalHistory {
    pub childhood_symptoms_present: String,
    pub age_of_onset: String,
    pub childhood_hyperactivity: Option<u8>,
    pub childhood_inattention: Option<u8>,
    pub childhood_impulsivity: Option<u8>,
    pub school_performance_issues: String,
    pub school_behavior_reports: String,
    pub learning_difficulties: String,
    pub childhood_notes: String,
}

// ─── Inattention Symptoms (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InattentionSymptoms {
    pub difficulty_sustaining_attention: Option<u8>,
    pub fails_to_give_close_attention: Option<u8>,
    pub does_not_listen_when_spoken_to: Option<u8>,
    pub fails_to_follow_through: Option<u8>,
    pub difficulty_organizing_tasks: Option<u8>,
    pub avoids_sustained_mental_effort: Option<u8>,
    pub loses_things_necessary: Option<u8>,
    pub easily_distracted: Option<u8>,
    pub forgetful_in_daily_activities: Option<u8>,
}

// ─── Hyperactivity-Impulsivity (Step 4) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HyperactivityImpulsivity {
    pub fidgets_or_squirms: Option<u8>,
    pub leaves_seat_unexpectedly: Option<u8>,
    pub feels_restless: Option<u8>,
    pub difficulty_engaging_quietly: Option<u8>,
    pub on_the_go_driven_by_motor: Option<u8>,
    pub talks_excessively: Option<u8>,
    pub blurts_out_answers: Option<u8>,
    pub difficulty_waiting_turn: Option<u8>,
    pub interrupts_or_intrudes: Option<u8>,
}

// ─── ASRS Screener (Step 5) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AsrsScreener {
    pub asrs_q1_wrapping_up: Option<u8>,
    pub asrs_q2_difficulty_ordering: Option<u8>,
    pub asrs_q3_difficulty_remembering: Option<u8>,
    pub asrs_q4_avoids_getting_started: Option<u8>,
    pub asrs_q5_fidget_squirm: Option<u8>,
    pub asrs_q6_overly_active: Option<u8>,
}

// ─── Functional Impact (Step 6) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalImpact {
    pub work_performance_impact: Option<u8>,
    pub academic_impact: Option<u8>,
    pub relationship_impact: Option<u8>,
    pub social_functioning_impact: Option<u8>,
    pub financial_management_impact: Option<u8>,
    pub driving_safety_concern: Option<u8>,
    pub daily_task_management: Option<u8>,
    pub self_esteem_impact: Option<u8>,
}

// ─── Comorbidities (Step 7) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Comorbidities {
    pub anxiety_symptoms: String,
    pub depression_symptoms: String,
    pub mood_disorder_history: String,
    pub sleep_disorder: String,
    pub substance_use_current: String,
    pub substance_use_history: String,
    pub substance_use_details: String,
    pub autism_spectrum_traits: String,
    pub tic_disorder: String,
    pub eating_disorder: String,
    pub personality_disorder_traits: String,
    pub other_psychiatric_conditions: String,
}

// ─── Previous Assessment (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PreviousAssessment {
    pub previously_assessed_for_adhd: String,
    pub previous_assessment_date: String,
    pub previous_assessment_result: String,
    pub previous_assessment_provider: String,
    pub previous_neuropsychological_testing: String,
    pub school_assessment_reports: String,
    pub informant_reports_available: String,
    pub previous_diagnosis_other: String,
}

// ─── Current Management (Step 9) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentManagement {
    pub currently_on_medication: String,
    pub current_medication_name: String,
    pub current_medication_dose: String,
    pub medication_effectiveness: Option<u8>,
    pub medication_side_effects: String,
    pub previous_adhd_medications: String,
    pub non_pharmacological_strategies: String,
    pub cardiac_history: String,
    pub blood_pressure_status: String,
    pub family_cardiac_history: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub collateral_history_obtained: String,
    pub collateral_source: String,
    pub mental_state_examination: String,
    pub physical_examination_done: String,
    pub ecg_done: String,
    pub clinician_impression: String,
    pub treatment_plan: String,
    pub follow_up_plan: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub developmental_history: DevelopmentalHistory,
    pub inattention_symptoms: InattentionSymptoms,
    pub hyperactivity_impulsivity: HyperactivityImpulsivity,
    pub asrs_screener: AsrsScreener,
    pub functional_impact: FunctionalImpact,
    pub comorbidities: Comorbidities,
    pub previous_assessment: PreviousAssessment,
    pub current_management: CurrentManagement,
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
    pub likelihood_level: LikelihoodLevel,
    pub asrs_score: u8,
    pub asrs_positive_count: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
