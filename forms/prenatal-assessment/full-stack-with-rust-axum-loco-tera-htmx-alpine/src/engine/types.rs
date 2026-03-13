use serde::{Deserialize, Serialize};

pub type RiskLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub gestational_age_weeks: Option<u8>,
    pub estimated_due_date: String,
    pub referring_provider: String,
    pub booking_date: String,
    pub contact_phone: String,
}

// ─── Obstetric History (Step 2) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ObstetricHistory {
    pub gravida: Option<u8>,
    pub para: Option<u8>,
    pub previous_caesarean: String,
    pub previous_preterm_birth: String,
    pub previous_stillbirth: String,
    pub previous_preeclampsia: String,
    pub recurrent_miscarriage: String,
    pub inter_pregnancy_interval: String,
}

// ─── Current Pregnancy (Step 3) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentPregnancy {
    pub pregnancy_type: String,
    pub conception_method: String,
    pub vaginal_bleeding: String,
    pub severe_nausea: String,
    pub fetal_movements: String,
    pub gestational_diabetes_screening: String,
    pub rhesus_status: String,
    pub cervical_length: String,
}

// ─── Antenatal Screening (Step 4) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AntenatalScreening {
    pub combined_screening_result: String,
    pub quadruple_test_result: String,
    pub nipt_result: String,
    pub anomaly_scan_result: String,
    pub infectious_disease_screening: String,
    pub group_b_strep: String,
    pub sickle_cell_thalassaemia: String,
    pub screening_declined: String,
}

// ─── Physical Examination (Step 5) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalExamination {
    pub blood_pressure_systolic: Option<u16>,
    pub blood_pressure_diastolic: Option<u16>,
    pub bmi: Option<f64>,
    pub fundal_height: Option<u16>,
    pub fetal_heart_rate: Option<u16>,
    pub fetal_presentation: String,
    pub oedema: String,
    pub proteinuria: String,
}

// ─── Blood Tests (Step 6) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BloodTests {
    pub haemoglobin: Option<f64>,
    pub platelet_count: Option<u16>,
    pub blood_group: String,
    pub antibody_screen: String,
    pub hba1c: Option<f64>,
    pub thyroid_function: String,
    pub liver_function: String,
    pub renal_function: String,
}

// ─── Ultrasound Findings (Step 7) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UltrasoundFindings {
    pub dating_scan_consistent: String,
    pub nuchal_translucency: String,
    pub amniotic_fluid_index: String,
    pub placental_position: String,
    pub fetal_growth_centile: String,
    pub structural_abnormalities: String,
    pub doppler_findings: String,
    pub cervical_length_scan: String,
}

// ─── Mental Health & Wellbeing (Step 8) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MentalHealthWellbeing {
    pub phq2_score: Option<u8>,
    pub gad2_score: Option<u8>,
    pub previous_mental_health_history: String,
    pub current_psychiatric_medication: String,
    pub social_support: String,
    pub domestic_abuse_screening: String,
    pub substance_use: String,
    pub smoking_status: String,
}

// ─── Birth Planning (Step 9) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BirthPlanning {
    pub preferred_birth_place: String,
    pub birth_preferences_discussed: String,
    pub pain_relief_preferences: String,
    pub breastfeeding_intention: String,
    pub antenatal_classes_attended: String,
    pub birth_partner_identified: String,
    pub consent_for_interventions: String,
    pub vbac_discussion: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_risk_assessment: Option<u8>,
    pub referral_to_consultant: String,
    pub safeguarding_concerns: String,
    pub additional_investigations: String,
    pub follow_up_interval: String,
    pub clinical_notes: String,
    pub reviewed_by: String,
    pub review_date: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub obstetric_history: ObstetricHistory,
    pub current_pregnancy: CurrentPregnancy,
    pub antenatal_screening: AntenatalScreening,
    pub physical_examination: PhysicalExamination,
    pub blood_tests: BloodTests,
    pub ultrasound_findings: UltrasoundFindings,
    pub mental_health_wellbeing: MentalHealthWellbeing,
    pub birth_planning: BirthPlanning,
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
    pub risk_level: RiskLevel,
    pub risk_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
