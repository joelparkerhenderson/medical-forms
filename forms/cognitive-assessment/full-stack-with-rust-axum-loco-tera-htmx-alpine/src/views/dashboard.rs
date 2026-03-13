use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub mmse_score: u8,
    pub moca_score: u8,
    pub severity_level: String,
    pub decline_rate: String,
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
            mmse_score: result.mmse_score,
            moca_score: result.moca_score,
            severity_level: result.impairment_level,
            decline_rate: data.cognitive_history.rate_of_decline,
        })
    }
}
