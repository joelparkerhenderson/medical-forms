use serde::{Deserialize, Serialize};

pub type VaccinationLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub patient_age: String,
    pub nhs_number: String,
    pub gp_practice: String,
    pub contact_phone: String,
    pub contact_email: String,
}

// ─── Immunization History (Step 2) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImmunizationHistory {
    pub has_vaccination_record: String,
    pub record_source: String,
    pub last_review_date: String,
    pub previous_adverse_reactions: String,
    pub adverse_reaction_details: String,
    pub immunocompromised: String,
    pub immunocompromised_details: String,
}

// ─── Childhood Vaccinations (Step 3) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ChildhoodVaccinations {
    pub dtap_ipv_hib_hepb: Option<u8>,
    pub pneumococcal: Option<u8>,
    pub rotavirus: Option<u8>,
    pub meningitis_b: Option<u8>,
    pub mmr: Option<u8>,
    pub hib_menc: Option<u8>,
    pub preschool_booster: Option<u8>,
}

// ─── Adult Vaccinations (Step 4) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AdultVaccinations {
    pub td_ipv_booster: Option<u8>,
    pub hpv: Option<u8>,
    pub meningitis_acwy: Option<u8>,
    pub influenza_annual: Option<u8>,
    pub covid19: Option<u8>,
    pub shingles: Option<u8>,
    pub pneumococcal_ppv: Option<u8>,
}

// ─── Travel Vaccinations (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TravelVaccinations {
    pub travel_planned: String,
    pub travel_destination: String,
    pub hepatitis_a: Option<u8>,
    pub hepatitis_b: Option<u8>,
    pub typhoid: Option<u8>,
    pub yellow_fever: Option<u8>,
    pub rabies: Option<u8>,
    pub japanese_encephalitis: Option<u8>,
}

// ─── Occupational Vaccinations (Step 6) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OccupationalVaccinations {
    pub occupation: String,
    pub healthcare_worker: String,
    pub hepatitis_b_occupational: Option<u8>,
    pub influenza_occupational: Option<u8>,
    pub varicella: Option<u8>,
    pub bcg_tuberculosis: Option<u8>,
}

// ─── Contraindications & Allergies (Step 7) ─────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContraindicationsAllergies {
    pub egg_allergy: String,
    pub gelatin_allergy: String,
    pub latex_allergy: String,
    pub neomycin_allergy: String,
    pub pregnant: String,
    pub pregnancy_weeks: String,
    pub severe_illness: String,
    pub previous_anaphylaxis: String,
    pub anaphylaxis_details: String,
}

// ─── Consent & Information (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ConsentInformation {
    pub information_provided: Option<u8>,
    pub risks_explained: Option<u8>,
    pub benefits_explained: Option<u8>,
    pub questions_answered: Option<u8>,
    pub consent_given: String,
    pub consent_date: String,
    pub guardian_consent: String,
}

// ─── Administration Record (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AdministrationRecord {
    pub vaccine_name: String,
    pub batch_number: String,
    pub expiry_date: String,
    pub administration_site: String,
    pub administration_route: String,
    pub dose_number: String,
    pub administered_by: String,
    pub administration_date: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub post_vaccination_observation: Option<u8>,
    pub immediate_reaction: String,
    pub reaction_details: String,
    pub next_dose_due: String,
    pub catch_up_schedule_needed: String,
    pub referral_needed: String,
    pub clinician_notes: String,
    pub reviewing_clinician: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub immunization_history: ImmunizationHistory,
    pub childhood_vaccinations: ChildhoodVaccinations,
    pub adult_vaccinations: AdultVaccinations,
    pub travel_vaccinations: TravelVaccinations,
    pub occupational_vaccinations: OccupationalVaccinations,
    pub contraindications_allergies: ContraindicationsAllergies,
    pub consent_information: ConsentInformation,
    pub administration_record: AdministrationRecord,
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
    pub vaccination_level: VaccinationLevel,
    pub vaccination_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
