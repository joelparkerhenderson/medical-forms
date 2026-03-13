use serde::{Deserialize, Serialize};

pub type CompletenessStatus = String;

// ─── Patient Information (Step 1) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub postcode: String,
    pub telephone: String,
    pub email: String,
    pub gp_name: String,
    pub gp_practice: String,
}

// ─── Personal Values & Beliefs (Step 2) ───────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PersonalValues {
    pub important_to_me: String,
    pub quality_of_life_factors: String,
    pub unacceptable_outcomes: String,
    pub religious_belief: String,
    pub cultural_considerations: String,
    pub personal_philosophy: String,
}

// ─── Care Preferences (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CarePreferences {
    pub preferred_care_location: String,
    pub pain_management_preference: String,
    pub treatment_goals: String,
    pub resuscitation_wishes: String,
    pub artificial_nutrition_view: String,
    pub ventilation_view: String,
}

// ─── Communication Preferences (Step 4) ───────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CommunicationPreferences {
    pub preferred_language: String,
    pub interpreter_needed: String,
    pub communication_aids: String,
    pub information_sharing_wishes: String,
    pub who_to_inform: String,
    pub how_to_break_bad_news: String,
}

// ─── Daily Living Preferences (Step 5) ────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DailyLivingPreferences {
    pub routine_importance: Option<u8>,
    pub food_preferences: String,
    pub personal_care_wishes: String,
    pub clothing_preferences: String,
    pub social_activities: String,
    pub pet_considerations: String,
}

// ─── Spiritual & Cultural Wishes (Step 6) ─────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SpiritualCultural {
    pub religious_practices: String,
    pub spiritual_support: String,
    pub specific_rituals: String,
    pub dietary_restrictions: String,
    pub cultural_practices: String,
    pub chaplain_visit: String,
}

// ─── Nominated Persons (Step 7) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NominatedPersons {
    pub primary_contact_name: String,
    pub primary_contact_relationship: String,
    pub primary_contact_phone: String,
    pub secondary_contact_name: String,
    pub secondary_contact_relationship: String,
    pub secondary_contact_phone: String,
    pub has_lpa: String,
    pub lpa_details: String,
}

// ─── End of Life Preferences (Step 8) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EndOfLifePreferences {
    pub preferred_place_of_death: String,
    pub organ_donation: String,
    pub funeral_wishes: String,
    pub after_death_wishes: String,
    pub music_or_comfort: String,
    pub who_should_be_present: String,
}

// ─── Healthcare Professional Review (Step 9) ──────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HealthcareProfessionalReview {
    pub reviewer_name: String,
    pub reviewer_role: String,
    pub review_date: String,
    pub capacity_confirmed: String,
    pub discussion_notes: String,
    pub statement_accurate: String,
}

// ─── Signatures & Verification (Step 10) ──────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SignaturesVerification {
    pub patient_signature: String,
    pub patient_signature_date: String,
    pub witness_name: String,
    pub witness_signature: String,
    pub witness_signature_date: String,
    pub reviewed_with_patient: String,
}

// ─── Assessment Data (all sections) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub personal_values: PersonalValues,
    pub care_preferences: CarePreferences,
    pub communication_preferences: CommunicationPreferences,
    pub daily_living_preferences: DailyLivingPreferences,
    pub spiritual_cultural: SpiritualCultural,
    pub nominated_persons: NominatedPersons,
    pub end_of_life_preferences: EndOfLifePreferences,
    pub healthcare_professional_review: HealthcareProfessionalReview,
    pub signatures_verification: SignaturesVerification,
}

// ─── Grading types ────────────────────────────────────────

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
    pub completeness_status: CompletenessStatus,
    pub sections_completed: u32,
    pub total_sections: u32,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
