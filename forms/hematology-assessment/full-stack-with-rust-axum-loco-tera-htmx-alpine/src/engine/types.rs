use serde::{Deserialize, Serialize};

pub type AbnormalityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub medical_record_number: String,
    pub referring_physician: String,
    pub clinical_indication: String,
    pub specimen_date: String,
    pub specimen_type: String,
}

// ─── Blood Count Analysis (Step 2) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BloodCountAnalysis {
    pub hemoglobin: Option<f64>,
    pub hematocrit: Option<f64>,
    pub red_blood_cell_count: Option<f64>,
    pub white_blood_cell_count: Option<f64>,
    pub platelet_count: Option<f64>,
    pub mean_corpuscular_volume: Option<f64>,
    pub mean_corpuscular_hemoglobin: Option<f64>,
    pub red_cell_distribution_width: Option<f64>,
}

// ─── Coagulation Studies (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CoagulationStudies {
    pub prothrombin_time: Option<f64>,
    pub inr: Option<f64>,
    pub activated_partial_thromboplastin_time: Option<f64>,
    pub fibrinogen: Option<f64>,
    pub d_dimer: Option<f64>,
    pub bleeding_time: Option<f64>,
}

// ─── Peripheral Blood Film (Step 4) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PeripheralBloodFilm {
    pub red_cell_morphology: String,
    pub white_blood_cell_differential: String,
    pub platelet_morphology: String,
    pub abnormal_cell_morphology: String,
    pub film_quality: Option<u8>,
    pub film_comments: String,
}

// ─── Iron Studies (Step 5) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct IronStudies {
    pub serum_iron: Option<f64>,
    pub total_iron_binding_capacity: Option<f64>,
    pub transferrin_saturation: Option<f64>,
    pub serum_ferritin: Option<f64>,
    pub reticulocyte_count: Option<f64>,
}

// ─── Hemoglobinopathy Screening (Step 6) ────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HemoglobinopathyScreening {
    pub hemoglobin_electrophoresis: String,
    pub sickle_cell_screen: String,
    pub thalassemia_screen: String,
    pub hplc_results: String,
    pub genetic_testing_notes: String,
}

// ─── Bone Marrow Assessment (Step 7) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BoneMarrowAssessment {
    pub aspirate_findings: String,
    pub biopsy_findings: String,
    pub cellularity: Option<u8>,
    pub cytogenetics_results: String,
    pub flow_cytometry_results: String,
    pub bone_marrow_comments: String,
}

// ─── Transfusion History (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TransfusionHistory {
    pub previous_transfusions: String,
    pub transfusion_reactions: String,
    pub blood_group_type: String,
    pub antibody_screen: String,
    pub crossmatch_results: String,
}

// ─── Treatment & Medications (Step 9) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentMedications {
    pub current_medications: String,
    pub chemotherapy_regimen: String,
    pub anticoagulant_therapy: String,
    pub iron_therapy: String,
    pub treatment_response: String,
    pub adverse_effects: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinical_summary: String,
    pub diagnosis: String,
    pub follow_up_plan: String,
    pub urgency_level: Option<u8>,
    pub reviewer_name: String,
    pub review_date: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub blood_count_analysis: BloodCountAnalysis,
    pub coagulation_studies: CoagulationStudies,
    pub peripheral_blood_film: PeripheralBloodFilm,
    pub iron_studies: IronStudies,
    pub hemoglobinopathy_screening: HemoglobinopathyScreening,
    pub bone_marrow_assessment: BoneMarrowAssessment,
    pub transfusion_history: TransfusionHistory,
    pub treatment_medications: TreatmentMedications,
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
    pub abnormality_level: AbnormalityLevel,
    pub abnormality_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
