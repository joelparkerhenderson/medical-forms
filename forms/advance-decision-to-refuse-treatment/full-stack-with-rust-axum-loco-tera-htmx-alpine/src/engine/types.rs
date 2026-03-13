use serde::{Deserialize, Serialize};

// Type aliases matching frontend union types.
// Empty string means unanswered.
pub type YesNo = String;
pub type ValidityStatus = String;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalInformation {
    pub full_legal_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub postcode: String,
    pub telephone: String,
    pub email: String,
    pub gp_name: String,
    pub gp_practice: String,
    pub gp_address: String,
    pub gp_telephone: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CapacityDeclaration {
    pub confirms_capacity: YesNo,
    pub understands_consequences: YesNo,
    pub no_undue_influence: YesNo,
    pub professional_capacity_assessment: YesNo,
    pub assessed_by_name: String,
    pub assessed_by_role: String,
    pub assessment_date: String,
    pub assessment_details: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Circumstances {
    pub specific_circumstances: String,
    pub medical_conditions: String,
    pub situations_description: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentRefusal {
    pub treatment: String,
    pub refused: YesNo,
    pub specification: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentsRefusedGeneral {
    pub antibiotics: TreatmentRefusal,
    pub blood_transfusion: TreatmentRefusal,
    pub iv_fluids: TreatmentRefusal,
    pub tube_feeding: TreatmentRefusal,
    pub dialysis: TreatmentRefusal,
    pub ventilation: TreatmentRefusal,
    pub other_treatments: Vec<TreatmentRefusal>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LifeSustainingRefusal {
    pub treatment: String,
    pub refused: YesNo,
    pub even_if_life_at_risk: YesNo,
    pub specification: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentsRefusedLifeSustaining {
    pub cpr: LifeSustainingRefusal,
    pub mechanical_ventilation: LifeSustainingRefusal,
    pub artificial_nutrition_hydration: LifeSustainingRefusal,
    pub other_life_sustaining: Vec<LifeSustainingRefusal>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExceptionsConditions {
    pub has_exceptions: YesNo,
    pub exceptions_description: String,
    pub has_time_limitations: YesNo,
    pub time_limitations_description: String,
    pub invalidating_conditions: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OtherWishes {
    pub preferred_care_setting: String,
    pub comfort_measures: String,
    pub spiritual_religious_wishes: String,
    pub other_preferences: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LastingPowerOfAttorney {
    pub has_lpa: YesNo,
    pub lpa_type: String,
    pub lpa_registered: YesNo,
    pub lpa_registration_date: String,
    pub donee_names: String,
    pub relationship_between_adrt_and_lpa: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthcareProfessionalReview {
    pub reviewed_by_clinician_name: String,
    pub reviewed_by_clinician_role: String,
    pub review_date: String,
    pub clinical_opinion_on_capacity: String,
    pub any_concerns: YesNo,
    pub concerns_details: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegalSignatures {
    pub patient_signature: YesNo,
    pub patient_statement_of_understanding: YesNo,
    pub patient_signature_date: String,
    pub witness_signature: YesNo,
    pub witness_name: String,
    pub witness_address: String,
    pub witness_signature_date: String,
    pub life_sustaining_written_statement: YesNo,
    pub life_sustaining_statement_text: String,
    pub life_sustaining_signature: YesNo,
    pub life_sustaining_witness_signature: YesNo,
    pub life_sustaining_witness_name: String,
    pub life_sustaining_witness_address: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub personal_information: PersonalInformation,
    pub capacity_declaration: CapacityDeclaration,
    pub circumstances: Circumstances,
    pub treatments_refused_general: TreatmentsRefusedGeneral,
    pub treatments_refused_life_sustaining: TreatmentsRefusedLifeSustaining,
    pub exceptions_conditions: ExceptionsConditions,
    pub other_wishes: OtherWishes,
    pub lasting_power_of_attorney: LastingPowerOfAttorney,
    pub healthcare_professional_review: HealthcareProfessionalReview,
    pub legal_signatures: LegalSignatures,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub severity: String,
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
    pub validity_status: ValidityStatus,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
