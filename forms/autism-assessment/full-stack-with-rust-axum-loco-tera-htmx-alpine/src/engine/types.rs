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
    pub clinician_role: String,
}

// ─── Developmental History (Step 2) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DevelopmentalHistory {
    pub speech_delay: String,
    pub motor_delay: String,
    pub social_play_differences: String,
    pub early_repetitive_behaviours: String,
    pub age_first_concerns: String,
    pub previous_assessments: String,
    pub developmental_notes: String,
}

// ─── Social Communication (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SocialCommunication {
    pub eye_contact: Option<u8>,
    pub conversational_reciprocity: Option<u8>,
    pub nonverbal_communication: Option<u8>,
    pub understanding_social_cues: Option<u8>,
    pub friendship_maintenance: Option<u8>,
    pub communication_preference: String,
}

// ─── Restricted Repetitive Behaviours (Step 4) ──────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RestrictedRepetitiveBehaviours {
    pub intense_interests: Option<u8>,
    pub routines_rituals: Option<u8>,
    pub resistance_to_change: Option<u8>,
    pub repetitive_movements: Option<u8>,
    pub need_for_sameness: Option<u8>,
    pub special_interest_description: String,
}

// ─── Sensory Processing (Step 5) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SensoryProcessing {
    pub auditory_sensitivity: Option<u8>,
    pub visual_sensitivity: Option<u8>,
    pub tactile_sensitivity: Option<u8>,
    pub olfactory_sensitivity: Option<u8>,
    pub sensory_seeking: Option<u8>,
    pub sensory_overload_frequency: String,
    pub sensory_coping_strategies: String,
}

// ─── AQ-10 Screening (Step 6) ───────────────────────────────
// Each item: 0 = definitely disagree, 1 = slightly disagree,
//            2 = slightly agree, 3 = definitely agree

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Aq10Screening {
    /// Q1: I often notice small sounds when others do not
    pub q1_notice_sounds: Option<u8>,
    /// Q2: I usually concentrate more on the whole picture rather than small details
    pub q2_whole_picture: Option<u8>,
    /// Q3: I find it easy to do more than one thing at once
    pub q3_multitask: Option<u8>,
    /// Q4: If there is an interruption, I can switch back very quickly
    pub q4_switch_back: Option<u8>,
    /// Q5: I find it easy to read between the lines when someone is talking to me
    pub q5_read_between_lines: Option<u8>,
    /// Q6: I know how to tell if someone listening to me is getting bored
    pub q6_detect_boredom: Option<u8>,
    /// Q7: When I'm reading a story, I find it difficult to work out the characters' intentions
    pub q7_character_intentions: Option<u8>,
    /// Q8: I like to collect information about categories of things
    pub q8_collect_info: Option<u8>,
    /// Q9: I find it easy to work out what someone is thinking or feeling just by looking at their face
    pub q9_read_faces: Option<u8>,
    /// Q10: I find it difficult to work out people's intentions
    pub q10_work_out_intentions: Option<u8>,
}

// ─── Daily Living Skills (Step 7) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DailyLivingSkills {
    pub personal_care: Option<u8>,
    pub meal_preparation: Option<u8>,
    pub time_management: Option<u8>,
    pub financial_management: Option<u8>,
    pub travel_independence: Option<u8>,
    pub executive_function_difficulties: String,
}

// ─── Mental Health Comorbidities (Step 8) ────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MentalHealthComorbidities {
    pub anxiety_level: Option<u8>,
    pub depression_level: Option<u8>,
    pub sleep_difficulties: Option<u8>,
    pub self_harm_risk: String,
    pub current_medications: String,
    pub previous_mental_health_diagnoses: String,
    pub safeguarding_concerns: String,
}

// ─── Support Needs (Step 9) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SupportNeeds {
    pub employment_support: String,
    pub education_support: String,
    pub relationship_support: String,
    pub housing_support: String,
    pub benefits_support: String,
    pub current_support_services: String,
    pub support_level_needed: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinical_observations: String,
    pub informant_history: String,
    pub recommended_referrals: String,
    pub follow_up_plan: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub developmental_history: DevelopmentalHistory,
    pub social_communication: SocialCommunication,
    pub restricted_repetitive_behaviours: RestrictedRepetitiveBehaviours,
    pub sensory_processing: SensoryProcessing,
    pub aq10_screening: Aq10Screening,
    pub daily_living_skills: DailyLivingSkills,
    pub mental_health_comorbidities: MentalHealthComorbidities,
    pub support_needs: SupportNeeds,
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
    pub aq10_score: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
