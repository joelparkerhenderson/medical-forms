use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub assessment_date: String,
    pub diagnosis: String,
    pub therapist_name: String,
    pub function_level: String,
    pub function_score: f64,
    pub adl_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let adl_status = match crate::engine::utils::adl_score(&data) {
            Some(s) if s >= 75.0 => "Independent",
            Some(s) if s >= 50.0 => "Modified",
            Some(s) if s >= 25.0 => "Supervisory",
            Some(_) => "Dependent",
            None => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            assessment_date: data.patient_information.assessment_date,
            diagnosis: data.patient_information.diagnosis,
            therapist_name: data.patient_information.therapist_name,
            function_level: result.function_level,
            function_score: result.function_score,
            adl_status: adl_status.to_string(),
        })
    }
}
