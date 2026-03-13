use serde::{Deserialize, Serialize};

pub type ImpairmentLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub exam_date: String,
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_age: String,
    pub patient_sex: String,
    pub referring_clinician: String,
    pub reason_for_visit: String,
    pub ocular_history: String,
    pub systemic_history: String,
    pub current_medications: String,
    pub allergies: String,
}

// ─── Visual Acuity (Step 2) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VisualAcuity {
    pub right_uncorrected: String,
    pub left_uncorrected: String,
    pub right_best_corrected: String,
    pub left_best_corrected: String,
    pub right_pinhole: String,
    pub left_pinhole: String,
    pub right_near_vision: String,
    pub left_near_vision: String,
    pub binocular_vision: String,
    pub visual_acuity_method: String,
}

// ─── Refraction (Step 3) ────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Refraction {
    pub right_sphere: String,
    pub right_cylinder: String,
    pub right_axis: String,
    pub left_sphere: String,
    pub left_cylinder: String,
    pub left_axis: String,
    pub right_add: String,
    pub left_add: String,
    pub pupillary_distance: String,
    pub refraction_method: String,
}

// ─── Anterior Segment (Step 4) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AnteriorSegment {
    pub right_lids: Option<u8>,
    pub left_lids: Option<u8>,
    pub right_conjunctiva: Option<u8>,
    pub left_conjunctiva: Option<u8>,
    pub right_cornea: Option<u8>,
    pub left_cornea: Option<u8>,
    pub right_anterior_chamber: Option<u8>,
    pub left_anterior_chamber: Option<u8>,
    pub right_iris: Option<u8>,
    pub left_iris: Option<u8>,
    pub right_lens: Option<u8>,
    pub left_lens: Option<u8>,
    pub anterior_segment_notes: String,
}

// ─── Intraocular Pressure (Step 5) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct IntraocularPressure {
    pub right_iop: Option<u8>,
    pub left_iop: Option<u8>,
    pub measurement_time: String,
    pub tonometry_method: String,
    pub central_corneal_thickness_right: String,
    pub central_corneal_thickness_left: String,
    pub gonioscopy_right: String,
    pub gonioscopy_left: String,
}

// ─── Posterior Segment (Step 6) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PosteriorSegment {
    pub right_optic_disc: Option<u8>,
    pub left_optic_disc: Option<u8>,
    pub right_cup_disc_ratio: String,
    pub left_cup_disc_ratio: String,
    pub right_macula: Option<u8>,
    pub left_macula: Option<u8>,
    pub right_vessels: Option<u8>,
    pub left_vessels: Option<u8>,
    pub right_peripheral_retina: Option<u8>,
    pub left_peripheral_retina: Option<u8>,
    pub right_vitreous: Option<u8>,
    pub left_vitreous: Option<u8>,
    pub posterior_segment_notes: String,
}

// ─── Visual Fields (Step 7) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VisualFields {
    pub right_confrontation: Option<u8>,
    pub left_confrontation: Option<u8>,
    pub right_mean_deviation: String,
    pub left_mean_deviation: String,
    pub right_pattern_standard_deviation: String,
    pub left_pattern_standard_deviation: String,
    pub visual_field_test_type: String,
    pub visual_field_reliability: Option<u8>,
    pub visual_field_notes: String,
}

// ─── Ocular Motility (Step 8) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OcularMotility {
    pub extraocular_movements: Option<u8>,
    pub cover_test_distance: String,
    pub cover_test_near: String,
    pub pupil_right_direct: Option<u8>,
    pub pupil_left_direct: Option<u8>,
    pub pupil_right_consensual: Option<u8>,
    pub pupil_left_consensual: Option<u8>,
    pub relative_afferent_pupil_defect: String,
    pub convergence: Option<u8>,
    pub stereopsis: String,
}

// ─── Special Investigations (Step 9) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SpecialInvestigations {
    pub oct_performed: String,
    pub oct_right_findings: String,
    pub oct_left_findings: String,
    pub fundus_photo_performed: String,
    pub ffa_performed: String,
    pub ffa_findings: String,
    pub corneal_topography_performed: String,
    pub corneal_topography_findings: String,
    pub biometry_performed: String,
    pub biometry_findings: String,
    pub other_investigations: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub primary_diagnosis: String,
    pub secondary_diagnosis: String,
    pub management_plan: String,
    pub surgical_intervention_needed: String,
    pub referral_required: String,
    pub referral_destination: String,
    pub follow_up_interval: String,
    pub patient_education_provided: String,
    pub clinician_name: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub visual_acuity: VisualAcuity,
    pub refraction: Refraction,
    pub anterior_segment: AnteriorSegment,
    pub intraocular_pressure: IntraocularPressure,
    pub posterior_segment: PosteriorSegment,
    pub visual_fields: VisualFields,
    pub ocular_motility: OcularMotility,
    pub special_investigations: SpecialInvestigations,
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
    pub impairment_level: ImpairmentLevel,
    pub impairment_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
