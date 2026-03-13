use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::{family_pattern_summary, testing_status_summary};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub referral_reason: String,
    pub risk_level: String,
    pub testing_status: String,
    pub family_pattern: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let testing_status = testing_status_summary(&data);
        let family_pattern = family_pattern_summary(&data);

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            referral_reason: data.referral_reason.referral_indication,
            risk_level: result.risk_level,
            testing_status,
            family_pattern,
        })
    }
}
