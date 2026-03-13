use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub medical_record_number: String,
    pub specimen_date: String,
    pub referring_physician: String,
    pub abnormality_level: String,
    pub abnormality_score: f64,
    pub diagnosis: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            medical_record_number: data.patient_information.medical_record_number,
            specimen_date: data.patient_information.specimen_date,
            referring_physician: data.patient_information.referring_physician,
            abnormality_level: result.abnormality_level,
            abnormality_score: result.abnormality_score,
            diagnosis: data.clinical_review.diagnosis,
        })
    }
}
