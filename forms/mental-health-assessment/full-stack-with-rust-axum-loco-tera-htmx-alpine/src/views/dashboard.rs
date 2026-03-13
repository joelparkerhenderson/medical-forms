use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub phq9_score: u8,
    pub gad7_score: u8,
    pub severity_level: String,
    pub risk_level: String,
    pub has_treatment: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let risk_level = if data.risk_assessment.risk_level.is_empty() {
            "unknown".to_string()
        } else {
            data.risk_assessment.risk_level.clone()
        };

        let has_treatment = if !data.current_treatment.current_medication.is_empty()
            && data.current_treatment.current_medication != "none"
        {
            "Yes"
        } else if !data.current_treatment.therapy_type.is_empty()
            && data.current_treatment.therapy_type != "none"
        {
            "Yes"
        } else {
            "No"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            phq9_score: result.phq9_total,
            gad7_score: result.gad7_total,
            severity_level: result.severity_level,
            risk_level,
            has_treatment: has_treatment.to_string(),
        })
    }
}
