use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub assessment_date: String,
    pub patient_name: String,
    pub severity_level: String,
    pub severity_score: f64,
    pub organ_systems: String,
    pub mediator_response: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let mediator_response = match data.clinical_review.response_to_mediator_therapy {
            Some(4..=5) => "Good",
            Some(3) => "Partial",
            Some(1..=2) => "Poor",
            _ => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            assessment_date: data.patient_information.assessment_date,
            patient_name: data.patient_information.patient_name,
            severity_level: result.severity_level,
            severity_score: result.severity_score,
            organ_systems: data.clinical_review.organ_systems_involved_count,
            mediator_response: mediator_response.to_string(),
        })
    }
}
