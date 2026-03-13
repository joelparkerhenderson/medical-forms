use serde::{Deserialize, Serialize};

pub type YesNo = String;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Demographics {
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub sex: String,
    pub nhs_number: String,
    pub address: String,
    pub postcode: String,
    pub phone: String,
    pub email: String,
    pub ethnicity: String,
    pub preferred_language: String,
    pub interpreter_required: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NextOfKin {
    pub name: String,
    pub relationship: String,
    pub phone: String,
    pub notified: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GP {
    pub name: String,
    pub practice_name: String,
    pub practice_address: String,
    pub practice_phone: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArrivalTriage {
    pub attendance_date: String,
    pub arrival_time: String,
    pub attendance_category: String,
    pub arrival_mode: String,
    pub referral_source: String,
    pub ambulance_incident_number: String,
    pub triage_time: String,
    pub triage_nurse: String,
    #[serde(rename = "mtsFlowchart")]
    pub mts_flowchart: String,
    #[serde(rename = "mtsCategory")]
    pub mts_category: String,
    #[serde(rename = "mtsDiscriminator")]
    pub mts_discriminator: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PresentingComplaint {
    pub chief_complaint: String,
    pub history_of_presenting_complaint: String,
    pub onset: String,
    pub duration: String,
    pub character: String,
    pub severity: String,
    pub location: String,
    pub radiation: String,
    pub aggravating_factors: String,
    pub relieving_factors: String,
    pub associated_symptoms: String,
    pub previous_episodes: YesNo,
    pub treatment_prior_to_arrival: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PainAssessment {
    pub pain_present: YesNo,
    pub pain_score: Option<u8>,
    pub pain_location: String,
    pub pain_character: String,
    pub pain_onset: String,
    pub pain_severity_category: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub past_medical_history: String,
    pub past_surgical_history: String,
    pub tetanus_status: String,
    pub smoking_status: String,
    pub alcohol_consumption: String,
    pub recreational_drug_use: String,
    pub last_oral_intake: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Medication {
    pub name: String,
    pub dose: String,
    pub frequency: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Allergy {
    pub allergen: String,
    pub reaction: String,
    pub severity: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VitalSigns {
    pub heart_rate: Option<f64>,
    #[serde(rename = "systolicBP")]
    pub systolic_bp: Option<f64>,
    #[serde(rename = "diastolicBP")]
    pub diastolic_bp: Option<f64>,
    pub respiratory_rate: Option<f64>,
    pub oxygen_saturation: Option<f64>,
    pub supplemental_oxygen: YesNo,
    pub oxygen_flow_rate: Option<f64>,
    pub temperature: Option<f64>,
    pub blood_glucose: Option<f64>,
    pub consciousness_level: String,
    pub pupil_left_size: Option<f64>,
    pub pupil_left_reactive: YesNo,
    pub pupil_right_size: Option<f64>,
    pub pupil_right_reactive: YesNo,
    pub capillary_refill_time: Option<f64>,
    pub weight: Option<f64>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrimarySurvey {
    // Airway
    pub airway_status: String,
    pub airway_adjuncts: String,
    pub c_spine_immobilised: YesNo,
    // Breathing
    pub breathing_effort: String,
    pub chest_movement: String,
    pub breath_sounds: String,
    pub trachea_position: String,
    // Circulation
    pub pulse_character: String,
    pub skin_colour: String,
    pub skin_temperature: String,
    pub capillary_refill: String,
    pub haemorrhage: YesNo,
    pub haemorrhage_details: String,
    pub iv_access: YesNo,
    // Disability
    #[serde(rename = "gcsEye")]
    pub gcs_eye: Option<u8>,
    #[serde(rename = "gcsVerbal")]
    pub gcs_verbal: Option<u8>,
    #[serde(rename = "gcsMotor")]
    pub gcs_motor: Option<u8>,
    #[serde(rename = "gcsTotal")]
    pub gcs_total: Option<u8>,
    pub pupils: String,
    pub disability_blood_glucose: Option<f64>,
    pub limb_movements: String,
    // Exposure
    pub skin_examination: String,
    pub injuries_identified: String,
    pub log_roll_findings: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalExamination {
    pub general_appearance: String,
    pub head_and_face: String,
    pub neck: String,
    pub chest_cardiovascular: String,
    pub chest_respiratory: String,
    pub abdomen: String,
    pub pelvis: String,
    pub musculoskeletal_limbs: String,
    pub neurological: String,
    pub skin: String,
    pub mental_state: String,
    pub body_diagram_notes: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Investigations {
    pub urinalysis: String,
    pub pregnancy_test: String,
    pub ecg_performed: YesNo,
    pub ecg_findings: String,
    pub other_investigations: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BloodTest {
    pub test_name: String,
    pub ordered: YesNo,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Imaging {
    #[serde(rename = "type")]
    pub imaging_type: String,
    pub site: String,
    pub findings: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentInterventions {
    pub oxygen_therapy_device: String,
    pub oxygen_therapy_flow_rate: String,
    pub tetanus_prophylaxis: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MedicationAdministered {
    pub drug: String,
    pub dose: String,
    pub route: String,
    pub time: String,
    pub given_by: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FluidTherapy {
    pub fluid_type: String,
    pub volume: String,
    pub rate: String,
    pub time_started: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Procedure {
    pub description: String,
    pub time: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentPlan {
    pub working_diagnosis: String,
    pub differential_diagnoses: String,
    pub clinical_impression: String,
    pub risk_stratification: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Disposition {
    pub disposition: String,
    // Admitted
    pub admitting_specialty: String,
    pub admitting_consultant: String,
    pub ward: String,
    pub level_of_care: String,
    // Discharged
    pub discharge_diagnosis: String,
    pub discharge_medications: String,
    pub discharge_instructions: String,
    pub follow_up: String,
    pub return_precautions: String,
    // Transferred
    pub receiving_hospital: String,
    pub reason_for_transfer: String,
    pub mode_of_transfer: String,
    // Common
    pub discharge_time: String,
    pub total_time_in_department: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Safeguarding {
    pub safeguarding_concern: YesNo,
    pub safeguarding_type: String,
    pub referral_made: YesNo,
    pub mental_capacity_assessment: String,
    pub mental_health_act_status: String,
    pub consent_for_treatment: String,
    pub completed_by_name: String,
    pub completed_by_role: String,
    #[serde(rename = "completedByGMCNumber")]
    pub completed_by_gmc_number: String,
    pub senior_reviewing_clinician: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub demographics: Demographics,
    pub next_of_kin: NextOfKin,
    pub gp: GP,
    pub arrival_triage: ArrivalTriage,
    pub presenting_complaint: PresentingComplaint,
    pub pain_assessment: PainAssessment,
    pub medical_history: MedicalHistory,
    pub vital_signs: VitalSigns,
    pub primary_survey: PrimarySurvey,
    pub clinical_examination: ClinicalExamination,
    pub investigations: Investigations,
    pub treatment_interventions: TreatmentInterventions,
    pub assessment_plan: AssessmentPlan,
    pub disposition: Disposition,
    pub safeguarding: Safeguarding,
    pub medications: Vec<Medication>,
    pub allergies: Vec<Allergy>,
    pub blood_tests: Vec<BloodTest>,
    pub imaging: Vec<Imaging>,
    pub medications_administered: Vec<MedicationAdministered>,
    pub fluid_therapy: Vec<FluidTherapy>,
    pub procedures: Vec<Procedure>,
}

pub type News2Score = u8;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub parameter: String,
    pub description: String,
    pub score: u8,
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
    pub news2_score: News2Score,
    pub clinical_response: String,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
