use serde::{Deserialize, Serialize};

pub type FrailtyLevel = String;

// ─── Patient Information (Step 1) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub age: Option<u8>,
    pub sex: String,
    pub nhs_number: String,
    pub assessment_date: String,
    pub assessor_name: String,
    pub referral_source: String,
    pub living_situation: String,
}

// ─── Functional Assessment (Step 2) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalAssessment {
    // Barthel Index items (0-2 each, 10 items, max 20)
    pub feeding: Option<u8>,
    pub bathing: Option<u8>,
    pub grooming: Option<u8>,
    pub dressing: Option<u8>,
    pub bowel_control: Option<u8>,
    pub bladder_control: Option<u8>,
    pub toilet_use: Option<u8>,
    pub transfers: Option<u8>,
    pub mobility: Option<u8>,
    pub stairs: Option<u8>,
    // Katz ADL independence (yes/no for each)
    pub katz_bathing: String,
    pub katz_dressing: String,
    pub katz_toileting: String,
    pub katz_transferring: String,
    pub katz_continence: String,
    pub katz_feeding: String,
    // IADL items (independent/needs_help/unable)
    pub iadl_telephone: String,
    pub iadl_shopping: String,
    pub iadl_food_preparation: String,
    pub iadl_housekeeping: String,
    pub iadl_laundry: String,
    pub iadl_transport: String,
    pub iadl_medications: String,
    pub iadl_finances: String,
}

// ─── Cognitive Screening (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CognitiveScreening {
    // MMSE approximate (0-30)
    pub mmse_score: Option<u8>,
    // 4AT delirium screening (0-12)
    pub four_at_alertness: Option<u8>,
    pub four_at_amts4: Option<u8>,
    pub four_at_attention: Option<u8>,
    pub four_at_acute_change: Option<u8>,
    // General cognitive concerns
    pub memory_concerns: String,
    pub orientation_impaired: String,
    pub decision_making_capacity: String,
    pub known_dementia_diagnosis: String,
}

// ─── Falls Risk (Step 4) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FallsRisk {
    pub falls_last_12_months: Option<u8>,
    pub falls_with_injury: Option<u8>,
    pub fear_of_falling: String,
    pub uses_walking_aid: String,
    pub walking_aid_type: String,
    // Tinetti balance items (0-2 each)
    pub tinetti_sitting_balance: Option<u8>,
    pub tinetti_arising: Option<u8>,
    pub tinetti_standing_balance: Option<u8>,
    pub tinetti_nudge_test: Option<u8>,
    pub tinetti_eyes_closed: Option<u8>,
    pub tinetti_turning: Option<u8>,
    pub postural_hypotension: String,
    pub footwear_appropriate: String,
    pub home_hazards_identified: String,
}

// ─── Medication Review (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicationReview {
    pub total_medications: Option<u8>,
    pub high_risk_medications: String,
    pub anticholinergic_burden: String,
    pub medication_adherence: String,
    pub recent_medication_changes: String,
    pub over_the_counter_medications: String,
    pub medication_side_effects: String,
    pub medication_review_date: String,
    pub prescribing_cascade_risk: String,
}

// ─── Nutritional Assessment (Step 6) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NutritionalAssessment {
    // MNA-SF items
    pub appetite_loss: Option<u8>,
    pub weight_loss: Option<u8>,
    pub mobility_mna: Option<u8>,
    pub psychological_stress: Option<u8>,
    pub neuropsychological_problems: Option<u8>,
    pub bmi_category: Option<u8>,
    // Additional nutrition items
    pub swallowing_difficulty: String,
    pub dietary_restrictions: String,
    pub fluid_intake_adequate: String,
    pub oral_health_concerns: String,
}

// ─── Mood Assessment (Step 7) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MoodAssessment {
    // GDS-15 items (yes/no)
    pub gds_satisfied_with_life: String,
    pub gds_dropped_activities: String,
    pub gds_life_feels_empty: String,
    pub gds_often_bored: String,
    pub gds_good_spirits: String,
    pub gds_afraid_something_bad: String,
    pub gds_feels_happy: String,
    pub gds_feels_helpless: String,
    pub gds_prefers_staying_home: String,
    pub gds_memory_problems: String,
    pub gds_wonderful_to_be_alive: String,
    pub gds_feels_worthless: String,
    pub gds_feels_full_of_energy: String,
    pub gds_feels_hopeless: String,
    pub gds_others_better_off: String,
    // Additional mood items
    pub sleep_disturbance: String,
    pub anxiety_symptoms: String,
    pub social_isolation: String,
}

// ─── Social Circumstances (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SocialCircumstances {
    pub housing_type: String,
    pub housing_adaptations: String,
    pub lives_alone: String,
    pub primary_carer: String,
    pub carer_relationship: String,
    pub carer_stress: String,
    pub formal_care_package: String,
    pub care_hours_per_week: String,
    pub social_activities: String,
    pub financial_concerns: String,
    pub safeguarding_concerns: String,
    pub advance_care_plan: String,
    pub lasting_power_of_attorney: String,
    pub driving_status: String,
}

// ─── Continence Assessment (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContinenceAssessment {
    pub urinary_incontinence: String,
    pub urinary_frequency: String,
    pub urinary_urgency: String,
    pub nocturia: String,
    pub catheter_in_situ: String,
    pub faecal_incontinence: String,
    pub constipation: String,
    pub laxative_use: String,
    pub continence_aids: String,
    pub continence_impact_on_quality: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinical_frailty_scale: Option<u8>,
    pub comorbidity_count: Option<u8>,
    pub sensory_impairment_vision: String,
    pub sensory_impairment_hearing: String,
    pub pain_assessment: String,
    pub pain_severity: Option<u8>,
    pub skin_integrity: String,
    pub pressure_ulcer_risk: String,
    pub immunisation_status: String,
    pub palliative_care_needs: String,
    pub clinical_summary: String,
    pub recommendations: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub functional_assessment: FunctionalAssessment,
    pub cognitive_screening: CognitiveScreening,
    pub falls_risk: FallsRisk,
    pub medication_review: MedicationReview,
    pub nutritional_assessment: NutritionalAssessment,
    pub mood_assessment: MoodAssessment,
    pub social_circumstances: SocialCircumstances,
    pub continence_assessment: ContinenceAssessment,
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
    pub frailty_level: FrailtyLevel,
    pub barthel_score: u8,
    pub cognitive_score: Option<u8>,
    pub falls_count: Option<u8>,
    pub polypharmacy_count: Option<u8>,
    pub mna_score: Option<u8>,
    pub gds_score: u8,
    pub cfs_score: Option<u8>,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
