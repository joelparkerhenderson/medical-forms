use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

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
    pub gp_practice: String,
}

// ─── Event Details (Step 2) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EventDetails {
    pub symptom_onset_date: String,
    pub symptom_onset_time: String,
    pub last_known_well: String,
    pub arrival_time: String,
    pub stroke_code: String,
    pub facial_droop: String,
    pub arm_weakness: String,
    pub speech_difficulty: String,
    pub symptom_duration: String,
    pub tia_or_stroke: String,
}

// ─── NIHSS Assessment (Step 3) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NihssAssessment {
    pub consciousness: Option<u8>,
    pub orientation_questions: Option<u8>,
    pub response_to_commands: Option<u8>,
    pub best_gaze: Option<u8>,
    pub visual_fields: Option<u8>,
    pub facial_palsy: Option<u8>,
    pub motor_left_arm: Option<u8>,
    pub motor_right_arm: Option<u8>,
    pub motor_left_leg: Option<u8>,
    pub motor_right_leg: Option<u8>,
    pub limb_ataxia: Option<u8>,
    pub sensory: Option<u8>,
    pub language: Option<u8>,
    pub dysarthria: Option<u8>,
    pub neglect: Option<u8>,
}

// ─── Stroke Classification (Step 4) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StrokeClassification {
    pub stroke_type: String,
    pub bamford_classification: String,
    pub toast_classification: String,
    pub territory: String,
    pub side_affected: String,
}

// ─── Risk Factors (Step 5) ────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RiskFactors {
    pub hypertension: String,
    pub atrial_fibrillation: String,
    pub diabetes: String,
    pub dyslipidaemia: String,
    pub previous_stroke: String,
    pub previous_tia: String,
    pub smoking_status: String,
    pub alcohol_excess: String,
    pub carotid_stenosis: String,
    pub pfo: String,
}

// ─── Investigations (Step 6) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Investigations {
    pub ct_brain: String,
    pub ct_angiography: String,
    pub mri: String,
    pub carotid_doppler: String,
    pub echocardiogram: String,
    pub holter_monitor: String,
    pub blood_glucose: Option<f64>,
    pub inr: Option<f64>,
    pub lipid_profile: String,
}

// ─── Acute Treatment (Step 7) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AcuteTreatment {
    pub thrombolysis: String,
    pub thrombolysis_time: String,
    pub thrombectomy: String,
    pub antiplatelet: String,
    pub anticoagulant: String,
    pub bp_management: String,
    pub nil_by_mouth: String,
    pub swallow_assessment: String,
}

// ─── Functional Assessment (Step 8) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalAssessment {
    pub modified_rankin_score: Option<u8>,
    pub barthel_index: Option<u8>,
    pub mobility_status: String,
    pub speech_assessment: String,
    pub swallowing_status: String,
    pub cognition: String,
    pub mood_screening: String,
    pub continence: String,
}

// ─── Secondary Prevention (Step 9) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SecondaryPrevention {
    pub antiplatelet_therapy: String,
    pub anticoagulation_indicated: String,
    pub statin_therapy: String,
    pub antihypertensive: String,
    pub target_bp: String,
    pub carotid_endarterectomy: String,
    pub lifestyle_advice: String,
    pub driving_advice: String,
}

// ─── Clinical Review (Step 10) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub nihss_total: Option<u8>,
    pub severity_level: String,
    pub clinical_notes: String,
    pub discharge_destination: String,
    pub follow_up_plan: String,
    pub referrals: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub event_details: EventDetails,
    pub nihss_assessment: NihssAssessment,
    pub stroke_classification: StrokeClassification,
    pub risk_factors: RiskFactors,
    pub investigations: Investigations,
    pub acute_treatment: AcuteTreatment,
    pub functional_assessment: FunctionalAssessment,
    pub secondary_prevention: SecondaryPrevention,
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
    pub severity_level: SeverityLevel,
    pub nihss_total: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
