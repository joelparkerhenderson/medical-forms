use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::stop_bang_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub sleep_quality: String,
    pub psqi_score: u8,
    pub ess_score: u8,
    pub stop_bang: u8,
    pub has_apnoea_risk: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let has_apnoea_risk = match stop_bang_category(result.stop_bang_score) {
            "high" => "High",
            "intermediate" => "Intermediate",
            _ => "Low",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            sleep_quality: result.sleep_quality,
            psqi_score: result.psqi_score,
            ess_score: result.ess_score,
            stop_bang: result.stop_bang_score,
            has_apnoea_risk: has_apnoea_risk.to_string(),
        })
    }
}
