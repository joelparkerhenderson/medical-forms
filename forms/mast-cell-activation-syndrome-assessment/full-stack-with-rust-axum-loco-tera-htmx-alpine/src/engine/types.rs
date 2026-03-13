use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub sex: String,
    pub assessment_date: String,
    pub referring_physician: String,
    pub primary_complaint: String,
    pub symptom_onset_date: String,
    pub family_history_mcas: String,
}

// ─── Symptom History (Step 2) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomHistory {
    pub symptom_duration_months: String,
    pub symptom_frequency: String,
    pub symptom_pattern: String,
    pub symptom_severity_overall: Option<u8>,
    pub symptom_progression: String,
    pub episode_duration: String,
    pub symptom_impact_daily_life: Option<u8>,
    pub emergency_visits_past_year: String,
}

// ─── Skin Manifestations (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SkinManifestations {
    pub flushing_severity: Option<u8>,
    pub flushing_frequency: String,
    pub urticaria_severity: Option<u8>,
    pub angioedema_severity: Option<u8>,
    pub dermatographism_present: String,
    pub pruritus_severity: Option<u8>,
    pub skin_lesions_present: String,
}

// ─── Gastrointestinal Symptoms (Step 4) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GastrointestinalSymptoms {
    pub abdominal_pain_severity: Option<u8>,
    pub nausea_severity: Option<u8>,
    pub diarrhea_severity: Option<u8>,
    pub bloating_severity: Option<u8>,
    pub gastroesophageal_reflux: Option<u8>,
    pub food_intolerances_count: String,
    pub malabsorption_signs: String,
}

// ─── Cardiovascular & Neurological (Step 5) ──────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiovascularNeurological {
    pub tachycardia_severity: Option<u8>,
    pub hypotension_episodes: Option<u8>,
    pub presyncope_syncope: Option<u8>,
    pub headache_severity: Option<u8>,
    pub brain_fog_severity: Option<u8>,
    pub neuropathic_pain: Option<u8>,
    pub dizziness_severity: Option<u8>,
}

// ─── Respiratory Symptoms (Step 6) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RespiratorySymptoms {
    pub wheezing_severity: Option<u8>,
    pub dyspnea_severity: Option<u8>,
    pub nasal_congestion_severity: Option<u8>,
    pub throat_tightness_severity: Option<u8>,
    pub stridor_present: String,
    pub cough_severity: Option<u8>,
    pub previous_anaphylaxis: String,
}

// ─── Laboratory Studies (Step 7) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LaboratoryStudies {
    pub serum_tryptase_elevated: String,
    pub serum_tryptase_level: String,
    pub urine_prostaglandin_d2_elevated: String,
    pub urine_n_methylhistamine_elevated: String,
    pub plasma_histamine_elevated: String,
    pub serum_chromogranin_a_elevated: String,
    pub other_mediators_elevated: String,
    pub bone_marrow_biopsy_done: String,
}

// ─── Trigger Identification (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TriggerIdentification {
    pub heat_trigger: Option<u8>,
    pub stress_trigger: Option<u8>,
    pub exercise_trigger: Option<u8>,
    pub food_trigger: Option<u8>,
    pub medication_trigger: Option<u8>,
    pub fragrance_chemical_trigger: Option<u8>,
    pub insect_sting_trigger: Option<u8>,
    pub trigger_predictability: String,
}

// ─── Current Treatment (Step 9) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub h1_antihistamine_response: Option<u8>,
    pub h2_antihistamine_response: Option<u8>,
    pub mast_cell_stabilizer_response: Option<u8>,
    pub leukotriene_inhibitor_response: Option<u8>,
    pub epinephrine_auto_injector: String,
    pub corticosteroid_use: String,
    pub other_medications: String,
    pub treatment_adherence: Option<u8>,
}

// ─── Clinical Review (Step 10) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub consensus_criteria_met: String,
    pub organ_systems_involved_count: String,
    pub response_to_mediator_therapy: Option<u8>,
    pub differential_diagnoses_excluded: String,
    pub comorbid_conditions: String,
    pub quality_of_life_impact: Option<u8>,
    pub clinician_severity_assessment: Option<u8>,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub symptom_history: SymptomHistory,
    pub skin_manifestations: SkinManifestations,
    pub gastrointestinal_symptoms: GastrointestinalSymptoms,
    pub cardiovascular_neurological: CardiovascularNeurological,
    pub respiratory_symptoms: RespiratorySymptoms,
    pub laboratory_studies: LaboratoryStudies,
    pub trigger_identification: TriggerIdentification,
    pub current_treatment: CurrentTreatment,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ───────────────────────────────────────────

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
