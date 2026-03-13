use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub age: Option<u8>,
    pub sex: String,
    pub risk_category: String,
    pub ten_year_risk: f64,
    pub heart_age: Option<u8>,
    pub smoking_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            age: data.demographics_ethnicity.age,
            sex: data.demographics_ethnicity.sex,
            risk_category: result.risk_category,
            ten_year_risk: result.ten_year_risk_percent,
            heart_age: result.heart_age,
            smoking_status: data.smoking_alcohol.smoking_status,
        })
    }
}
