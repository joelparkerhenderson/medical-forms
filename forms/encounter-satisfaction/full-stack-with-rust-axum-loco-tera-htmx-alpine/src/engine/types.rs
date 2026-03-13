use serde::{Deserialize, Serialize};

pub type SatisfactionLevel = String;

// ─── Visit Information (Step 1) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VisitInformation {
    pub visit_date: String,
    pub department_name: String,
    pub provider_name: String,
    pub provider_role: String,
    pub visit_type: String,
    pub visit_duration: String,
    pub is_first_visit: String,
    pub referral_source: String,
}

// ─── Wait Time & Access (Step 2) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WaitTimeAccess {
    pub ease_of_scheduling: Option<u8>,
    pub appointment_wait_days: String,
    pub waiting_room_time: String,
    pub wait_time_acceptability: Option<u8>,
    pub location_accessibility: Option<u8>,
    pub signage_wayfinding: Option<u8>,
}

// ─── Communication (Step 3) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Communication {
    pub provider_listening: Option<u8>,
    pub provider_explaining: Option<u8>,
    pub provider_respect: Option<u8>,
    pub provider_time_adequacy: Option<u8>,
    pub questions_encouraged: Option<u8>,
    pub information_clarity: Option<u8>,
    pub shared_decision_making: Option<u8>,
}

// ─── Care Quality (Step 4) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CareQuality {
    pub thoroughness_of_examination: Option<u8>,
    pub diagnosis_explanation: Option<u8>,
    pub treatment_plan_clarity: Option<u8>,
    pub confidence_in_provider: Option<u8>,
    pub coordination_of_care: Option<u8>,
    pub involvement_in_decisions: Option<u8>,
}

// ─── Staff Interaction (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StaffInteraction {
    pub reception_courtesy: Option<u8>,
    pub nursing_responsiveness: Option<u8>,
    pub staff_professionalism: Option<u8>,
    pub staff_helpfulness: Option<u8>,
    pub privacy_respected: Option<u8>,
    pub team_coordination: Option<u8>,
}

// ─── Environment (Step 6) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EncounterEnvironment {
    pub facility_cleanliness: Option<u8>,
    pub facility_comfort: Option<u8>,
    pub noise_level: Option<u8>,
    pub privacy_adequacy: Option<u8>,
    pub equipment_condition: Option<u8>,
    pub overall_ambience: Option<u8>,
}

// ─── Medication & Treatment (Step 7) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicationTreatment {
    pub medication_explanation: Option<u8>,
    pub side_effects_explained: Option<u8>,
    pub pain_management: Option<u8>,
    pub treatment_effectiveness: Option<u8>,
    pub alternatives_discussed: Option<u8>,
    pub medications_provided: String,
}

// ─── Discharge & Follow-up (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DischargeFollowUp {
    pub discharge_instruction_clarity: Option<u8>,
    pub follow_up_plan_explained: Option<u8>,
    pub self_care_instructions: Option<u8>,
    pub warning_signs_explained: Option<u8>,
    pub contact_information_provided: Option<u8>,
    pub follow_up_appointment_scheduled: String,
}

// ─── Overall Experience (Step 9) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OverallExperience {
    pub overall_satisfaction: Option<u8>,
    pub likelihood_to_recommend: Option<u8>,
    pub met_expectations: Option<u8>,
    pub would_return_for_care: Option<u8>,
    pub emotional_experience: String,
    pub best_aspect: String,
    pub worst_aspect: String,
}

// ─── Demographics & Comments (Step 10) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DemographicsComments {
    pub patient_age: String,
    pub patient_sex: String,
    pub ethnicity: String,
    pub has_disability: String,
    pub is_return_patient: String,
    pub additional_comments: String,
    pub improvement_suggestions: String,
    pub compliments: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub visit_information: VisitInformation,
    pub wait_time_access: WaitTimeAccess,
    pub communication: Communication,
    pub care_quality: CareQuality,
    pub staff_interaction: StaffInteraction,
    pub environment: EncounterEnvironment,
    pub medication_treatment: MedicationTreatment,
    pub discharge_follow_up: DischargeFollowUp,
    pub overall_experience: OverallExperience,
    pub demographics_comments: DemographicsComments,
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
    pub satisfaction_level: SatisfactionLevel,
    pub satisfaction_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
