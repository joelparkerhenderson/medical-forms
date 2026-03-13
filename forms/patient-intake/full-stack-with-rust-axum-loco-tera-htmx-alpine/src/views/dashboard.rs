use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub nhs_number: String,
    pub patient_name: String,
    pub risk_level: String,
    pub reason_for_visit: String,
    pub allergy_flag: bool,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let patient_name = data.personal_information.full_name.clone();
        let allergy_flag = !data.allergies.is_empty();

        Some(Self {
            id: m.id.to_string(),
            nhs_number: data.insurance_and_id.nhs_number,
            patient_name,
            risk_level: result.risk_level,
            reason_for_visit: data.reason_for_visit.primary_reason,
            allergy_flag,
        })
    }
}
