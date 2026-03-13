use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub nhs_number: String,
    pub patient_name: String,
    pub risk_category: String,
    pub diabetes_type: String,
    pub hba1c: String,
    pub established_cvd: bool,
}

impl PatientRow {
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;
        let has_cvd = crate::engine::utils::has_established_cvd(&data);
        let hba1c = data.diabetes_history.hba1c_value
            .map(|v| format!("{v}"))
            .unwrap_or_else(|| "N/A".to_string());
        Some(Self {
            id: m.id.to_string(),
            nhs_number: data.patient_demographics.nhs_number,
            patient_name: data.patient_demographics.full_name,
            risk_category: result.risk_category,
            diabetes_type: data.diabetes_history.diabetes_type,
            hba1c,
            established_cvd: has_cvd,
        })
    }
}
