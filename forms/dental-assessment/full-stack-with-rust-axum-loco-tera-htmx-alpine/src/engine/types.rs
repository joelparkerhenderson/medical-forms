use serde::{Deserialize, Serialize};

pub type OralHealthStatus = String;

// ─── Patient Information (Step 1) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub telephone: String,
    pub email: String,
    pub gp_name: String,
    pub dental_practice: String,
}

// ─── Dental History (Step 2) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DentalHistory {
    pub last_dental_visit: String,
    pub visit_frequency: String,
    pub dental_anxiety: Option<u8>,
    pub previous_surgery: String,
    pub dental_trauma: String,
    pub orthodontic_history: String,
    pub dental_phobia: String,
}

// ─── Oral Examination (Step 3) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OralExamination {
    pub soft_tissue_normal: String,
    pub soft_tissue_findings: String,
    pub tongue_condition: String,
    pub mucosal_lesions: String,
    pub oral_cancer_screening: String,
    pub lymph_nodes: String,
    pub salivary_flow: String,
}

// ─── Periodontal Assessment (Step 4) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PeriodontalAssessment {
    pub bpe_score: String,
    pub gingival_bleeding: String,
    pub pocket_depth_max: Option<u8>,
    pub clinical_attachment_loss: String,
    pub mobility_present: String,
    pub furcation_involvement: String,
    pub periodontal_diagnosis: String,
}

// ─── Caries Assessment (Step 5) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CariesAssessment {
    pub decayed_teeth: Option<u8>,
    pub missing_teeth: Option<u8>,
    pub filled_teeth: Option<u8>,
    pub active_caries: String,
    pub caries_risk: String,
    pub root_caries: String,
    pub secondary_caries: String,
}

// ─── Occlusion & TMJ (Step 6) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OcclusionTmj {
    pub occlusion_class: String,
    pub tmj_pain: String,
    pub tmj_clicking: String,
    pub limited_opening: String,
    pub bruxism: String,
    pub tooth_wear: Option<u8>,
    pub prosthetic_needs: String,
}

// ─── Oral Hygiene (Step 7) ────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OralHygiene {
    pub brushing_frequency: String,
    pub brush_type: String,
    pub interdental_cleaning: String,
    pub mouthwash_use: String,
    pub fluoride_use: String,
    pub dietary_sugar: String,
    pub smoking_status: String,
    pub alcohol_use: String,
}

// ─── Radiographic Findings (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RadiographicFindings {
    pub radiographs_taken: String,
    pub radiograph_type: String,
    pub bone_loss: String,
    pub bone_loss_percentage: Option<u8>,
    pub periapical_lesions: String,
    pub impacted_teeth: String,
    pub other_findings: String,
}

// ─── Treatment Needs (Step 9) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentNeeds {
    pub fillings: Option<u8>,
    pub extractions: Option<u8>,
    pub root_canals: Option<u8>,
    pub crowns: Option<u8>,
    pub periodontal_treatment: String,
    pub urgent_treatment: String,
    pub prosthodontic_needs: String,
    pub orthodontic_needs: String,
}

// ─── Clinical Review (Step 10) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub overall_status: String,
    pub dmft_score: Option<u8>,
    pub clinical_notes: String,
    pub treatment_plan: String,
    pub next_review_date: String,
    pub referral_needed: String,
}

// ─── Assessment Data (all sections) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub dental_history: DentalHistory,
    pub oral_examination: OralExamination,
    pub periodontal_assessment: PeriodontalAssessment,
    pub caries_assessment: CariesAssessment,
    pub occlusion_tmj: OcclusionTmj,
    pub oral_hygiene: OralHygiene,
    pub radiographic_findings: RadiographicFindings,
    pub treatment_needs: TreatmentNeeds,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ────────────────────────────────────────────

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
    pub oral_health_status: OralHealthStatus,
    pub dmft_score: Option<u8>,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
