use serde::{Deserialize, Serialize};

// Type aliases matching frontend union types.
// Empty string means unanswered.
pub type YesNo = String;
pub type Sex = String;
pub type UrgencyLevel = String;
pub type SmokingStatus = String;
pub type AlcoholFrequency = String;
pub type DrugUseFrequency = String;
pub type ExerciseFrequency = String;
pub type DietQuality = String;
pub type AllergySeverity = String;
pub type AllergyType = String;
pub type CommunicationPreference = String;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub sex: Sex,
    pub address_line1: String,
    pub address_line2: String,
    pub city: String,
    pub postcode: String,
    pub phone: String,
    pub email: String,
    pub emergency_contact_name: String,
    pub emergency_contact_phone: String,
    pub emergency_contact_relationship: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InsuranceAndId {
    pub insurance_provider: String,
    pub policy_number: String,
    pub nhs_number: String,
    pub gp_name: String,
    pub gp_practice_name: String,
    pub gp_phone: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReasonForVisit {
    pub primary_reason: String,
    pub urgency_level: UrgencyLevel,
    pub referring_provider: String,
    pub symptom_duration: String,
    pub additional_details: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub chronic_conditions: Vec<String>,
    pub previous_surgeries: String,
    pub previous_hospitalizations: String,
    pub ongoing_treatments: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Medication {
    pub name: String,
    pub dose: String,
    pub frequency: String,
    pub prescriber: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Allergy {
    pub allergen: String,
    pub allergy_type: AllergyType,
    pub reaction: String,
    pub severity: AllergySeverity,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FamilyHistory {
    pub heart_disease: YesNo,
    pub heart_disease_details: String,
    pub cancer: YesNo,
    pub cancer_details: String,
    pub diabetes: YesNo,
    pub diabetes_details: String,
    pub stroke: YesNo,
    pub stroke_details: String,
    pub mental_illness: YesNo,
    pub mental_illness_details: String,
    pub genetic_conditions: YesNo,
    pub genetic_conditions_details: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SocialHistory {
    pub smoking_status: SmokingStatus,
    pub smoking_pack_years: Option<f64>,
    pub alcohol_frequency: AlcoholFrequency,
    pub alcohol_units_per_week: Option<f64>,
    pub drug_use: DrugUseFrequency,
    pub drug_details: String,
    pub occupation: String,
    pub exercise_frequency: ExerciseFrequency,
    pub diet_quality: DietQuality,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewOfSystems {
    pub constitutional: String,
    pub heent: String,
    pub cardiovascular: String,
    pub respiratory: String,
    pub gastrointestinal: String,
    pub genitourinary: String,
    pub musculoskeletal: String,
    pub neurological: String,
    pub psychiatric: String,
    pub skin: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsentAndPreferences {
    pub consent_to_treatment: YesNo,
    pub privacy_acknowledgement: YesNo,
    pub communication_preference: CommunicationPreference,
    pub advance_directives: YesNo,
    pub advance_directive_details: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub personal_information: PersonalInformation,
    pub insurance_and_id: InsuranceAndId,
    pub reason_for_visit: ReasonForVisit,
    pub medical_history: MedicalHistory,
    pub medications: Vec<Medication>,
    pub allergies: Vec<Allergy>,
    pub family_history: FamilyHistory,
    pub social_history: SocialHistory,
    pub review_of_systems: ReviewOfSystems,
    pub consent_and_preferences: ConsentAndPreferences,
}

/// Risk level: low, medium, high
pub type RiskLevel = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub risk_level: RiskLevel,
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
    pub risk_level: RiskLevel,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
