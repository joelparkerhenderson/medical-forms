use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub diagnosis: String,
    pub severity_level: String,
    pub dlqi_score: f64,
    pub bsa_percent: String,
    pub treatment_response: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let bsa_percent = match data.current_condition.body_area_affected {
            Some(v) => format!("{}%", v),
            None => "N/A".to_string(),
        };

        let treatment_response = match data.current_treatment.treatment_response {
            Some(4..=5) => "Good",
            Some(3) => "Moderate",
            Some(1..=2) => "Poor",
            _ => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            diagnosis: data.skin_history.primary_diagnosis,
            severity_level: result.severity_level,
            dlqi_score: result.dlqi_score,
            bsa_percent,
            treatment_response: treatment_response.to_string(),
        })
    }
}
