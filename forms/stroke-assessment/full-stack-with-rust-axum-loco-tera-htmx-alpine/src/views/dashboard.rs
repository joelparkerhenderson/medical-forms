use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub stroke_type: String,
    pub nihss_score: u8,
    pub severity_level: String,
    pub mrs_score: String,
    pub af_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let mrs_score = match data.functional_assessment.modified_rankin_score {
            Some(v) => v.to_string(),
            None => "N/A".to_string(),
        };

        let af_status = if data.risk_factors.atrial_fibrillation == "yes" {
            "Yes".to_string()
        } else if data.risk_factors.atrial_fibrillation == "no" {
            "No".to_string()
        } else {
            "N/A".to_string()
        };

        let stroke_type = if data.stroke_classification.stroke_type.is_empty() {
            "Unknown".to_string()
        } else {
            data.stroke_classification.stroke_type.clone()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: if data.patient_information.full_name.is_empty() {
                "Unknown".to_string()
            } else {
                data.patient_information.full_name.clone()
            },
            stroke_type,
            nihss_score: result.nihss_total,
            severity_level: result.severity_level,
            mrs_score,
            af_status,
        })
    }
}
