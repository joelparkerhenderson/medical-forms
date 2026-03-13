use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub age: u8,
    pub sex: String,
    pub risk_level: String,
    pub ten_year_risk_percent: f64,
    pub smoking_status: String,
    pub on_treatment: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let on_treatment = if data.blood_pressure.on_bp_treatment == "yes" {
            "Yes"
        } else {
            "No"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            age: data.demographics.age.unwrap_or(0),
            sex: data.demographics.sex,
            risk_level: result.risk_category,
            ten_year_risk_percent: result.ten_year_risk_percent,
            smoking_status: data.smoking_history.smoking_status,
            on_treatment: on_treatment.to_string(),
        })
    }
}
