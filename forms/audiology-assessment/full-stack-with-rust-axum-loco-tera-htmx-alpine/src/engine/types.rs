use serde::{Deserialize, Serialize};

pub type HearingLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub referral_source: String,
    pub referral_reason: String,
    pub assessment_date: String,
    pub audiologist_name: String,
    pub clinic_location: String,
}

// ─── Hearing History (Step 2) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HearingHistory {
    pub onset_type: String,
    pub onset_duration: String,
    pub affected_ear: String,
    pub family_history: String,
    pub noise_exposure_history: String,
    pub noise_exposure_type: String,
    pub hearing_protection_use: String,
    pub previous_hearing_test: String,
    pub previous_hearing_aid: String,
    pub ototoxic_medication: String,
    pub ototoxic_medication_name: String,
}

// ─── Symptoms Assessment (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomsAssessment {
    pub hearing_difficulty_quiet: Option<u8>,
    pub hearing_difficulty_noise: Option<u8>,
    pub hearing_difficulty_phone: Option<u8>,
    pub hearing_difficulty_group: Option<u8>,
    pub hearing_difficulty_tv: Option<u8>,
    pub ear_pain: String,
    pub ear_discharge: String,
    pub ear_fullness: String,
    pub autophony: String,
}

// ─── Otoscopic Examination (Step 4) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OtoscopicExamination {
    pub right_canal: String,
    pub right_tympanic_membrane: String,
    pub right_cerumen: String,
    pub right_abnormalities: String,
    pub left_canal: String,
    pub left_tympanic_membrane: String,
    pub left_cerumen: String,
    pub left_abnormalities: String,
    pub active_infection: String,
}

// ─── Audiometric Results (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AudiometricResults {
    // Air conduction thresholds (dB HL) - Right ear
    pub right_ac_250: Option<u8>,
    pub right_ac_500: Option<u8>,
    pub right_ac_1000: Option<u8>,
    pub right_ac_2000: Option<u8>,
    pub right_ac_4000: Option<u8>,
    pub right_ac_8000: Option<u8>,
    // Air conduction thresholds (dB HL) - Left ear
    pub left_ac_250: Option<u8>,
    pub left_ac_500: Option<u8>,
    pub left_ac_1000: Option<u8>,
    pub left_ac_2000: Option<u8>,
    pub left_ac_4000: Option<u8>,
    pub left_ac_8000: Option<u8>,
    // Bone conduction thresholds (dB HL) - Right ear
    pub right_bc_500: Option<u8>,
    pub right_bc_1000: Option<u8>,
    pub right_bc_2000: Option<u8>,
    pub right_bc_4000: Option<u8>,
    // Bone conduction thresholds (dB HL) - Left ear
    pub left_bc_500: Option<u8>,
    pub left_bc_1000: Option<u8>,
    pub left_bc_2000: Option<u8>,
    pub left_bc_4000: Option<u8>,
    // Speech audiometry
    pub right_srt: Option<u8>,
    pub right_wrs: Option<u8>,
    pub left_srt: Option<u8>,
    pub left_wrs: Option<u8>,
    // Tympanometry
    pub right_tympanogram_type: String,
    pub left_tympanogram_type: String,
    pub right_compliance: String,
    pub left_compliance: String,
}

// ─── Tinnitus (Step 6) ──────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Tinnitus {
    pub tinnitus_present: String,
    pub tinnitus_ear: String,
    pub tinnitus_type: String,
    pub tinnitus_onset: String,
    pub tinnitus_severity: Option<u8>,
    pub tinnitus_sleep_impact: Option<u8>,
    pub tinnitus_concentration_impact: Option<u8>,
    pub tinnitus_emotional_impact: Option<u8>,
    pub tinnitus_daily_activity_impact: Option<u8>,
}

// ─── Balance Assessment (Step 7) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BalanceAssessment {
    pub dizziness_present: String,
    pub dizziness_type: String,
    pub dizziness_frequency: String,
    pub dizziness_duration: String,
    pub dizziness_triggers: String,
    pub falls_history: String,
    pub falls_frequency: String,
    pub nausea_with_dizziness: String,
    pub dizziness_severity: Option<u8>,
    pub dizziness_daily_impact: Option<u8>,
}

// ─── Communication Impact (Step 8) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CommunicationImpact {
    pub difficulty_understanding_speech: Option<u8>,
    pub social_withdrawal: Option<u8>,
    pub frustration_level: Option<u8>,
    pub asking_to_repeat: Option<u8>,
    pub avoiding_situations: Option<u8>,
    pub impact_on_work: Option<u8>,
    pub impact_on_relationships: Option<u8>,
    pub communication_strategies_used: String,
    pub additional_concerns: String,
}

// ─── Hearing Aid Assessment (Step 9) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HearingAidAssessment {
    pub current_hearing_aid: String,
    pub hearing_aid_type: String,
    pub hearing_aid_age: String,
    pub hearing_aid_satisfaction: Option<u8>,
    pub hearing_aid_hours_per_day: String,
    pub hearing_aid_difficulties: String,
    pub interest_in_hearing_aid: String,
    pub hearing_aid_concerns: String,
    pub assistive_device_use: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub loss_type_right: String,
    pub loss_type_left: String,
    pub recommended_action: String,
    pub ent_referral_needed: String,
    pub follow_up_interval: String,
    pub clinician_notes: String,
    pub patient_goals: String,
    pub consent_for_treatment: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub hearing_history: HearingHistory,
    pub symptoms_assessment: SymptomsAssessment,
    pub otoscopic_examination: OtoscopicExamination,
    pub audiometric_results: AudiometricResults,
    pub tinnitus: Tinnitus,
    pub balance_assessment: BalanceAssessment,
    pub communication_impact: CommunicationImpact,
    pub hearing_aid_assessment: HearingAidAssessment,
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
    pub hearing_level: HearingLevel,
    pub pure_tone_average: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
