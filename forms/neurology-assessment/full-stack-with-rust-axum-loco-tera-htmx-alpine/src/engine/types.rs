use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ──────────────────────────

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

// ─── Neurological History (Step 2) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NeurologicalHistory {
    pub primary_complaint: String,
    pub symptom_duration: String,
    pub symptom_onset: String,
    pub previous_neurological_condition: String,
    pub seizure_history: String,
    pub stroke_history: String,
    pub head_injury: String,
    pub family_neurological_history: String,
}

// ─── Headache Assessment (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HeadacheAssessment {
    pub headache_type: String,
    pub headache_frequency: String,
    pub headache_severity: Option<u8>,
    pub aura_present: String,
    pub headache_duration: String,
    pub trigger_factors: String,
    pub red_flag_symptoms: String,
    pub thunderclap_onset: String,
}

// ─── Cranial Nerve Examination (Step 4) ────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CranialNerveExamination {
    pub visual_acuity: String,
    pub visual_fields: String,
    pub pupil_reaction: String,
    pub eye_movements: String,
    pub facial_sensation: String,
    pub facial_symmetry: String,
    pub hearing: String,
    pub swallowing: String,
    pub tongue_movement: String,
}

// ─── Motor Assessment (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MotorAssessment {
    pub upper_limb_power_right: Option<u8>,
    pub upper_limb_power_left: Option<u8>,
    pub lower_limb_power_right: Option<u8>,
    pub lower_limb_power_left: Option<u8>,
    pub tonus_abnormality: String,
    pub muscle_wasting: String,
    pub involuntary_movements: String,
    pub gait_assessment: String,
}

// ─── Sensory Assessment (Step 6) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SensoryAssessment {
    pub light_touch: String,
    pub pinprick: String,
    pub vibration_sense: String,
    pub proprioception: String,
    pub temperature_sense: String,
    pub sensory_level: String,
    pub dermatomal_pattern: String,
    pub peripheral_neuropathy: String,
}

// ─── Reflexes & Coordination (Step 7) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReflexesCoordination {
    pub biceps_reflex: String,
    pub knee_reflex: String,
    pub ankle_reflex: String,
    pub plantar_response: String,
    pub finger_nose_test: String,
    pub heel_shin_test: String,
    pub romberg_sign: String,
    pub dysdiadochokinesis: String,
}

// ─── Cognitive Screening (Step 8) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CognitiveScreening {
    pub orientation: Option<u8>,
    pub attention: Option<u8>,
    pub memory: Option<u8>,
    pub language: Option<u8>,
    pub executive_function: Option<u8>,
    pub mmse_score: Option<u8>,
    pub moca_score: Option<u8>,
    pub consciousness_level: String,
}

// ─── Investigations (Step 9) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Investigations {
    pub ct_scan: String,
    pub mri_scan: String,
    pub eeg: String,
    pub nerve_conduction_study: String,
    pub lumbar_puncture: String,
    pub blood_tests: String,
    pub imaging_findings: String,
}

// ─── Clinical Review (Step 10) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub primary_diagnosis: String,
    pub differential_diagnosis: String,
    pub severity_level: String,
    pub clinical_notes: String,
    pub treatment_plan: String,
    pub referral_needed: String,
    pub urgency: String,
}

// ─── Assessment Data (all sections) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub neurological_history: NeurologicalHistory,
    pub headache_assessment: HeadacheAssessment,
    pub cranial_nerve_examination: CranialNerveExamination,
    pub motor_assessment: MotorAssessment,
    pub sensory_assessment: SensoryAssessment,
    pub reflexes_coordination: ReflexesCoordination,
    pub cognitive_screening: CognitiveScreening,
    pub investigations: Investigations,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ─────────────────────────────────────────

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
    pub severity_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
