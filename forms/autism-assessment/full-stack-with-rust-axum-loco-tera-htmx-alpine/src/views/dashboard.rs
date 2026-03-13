use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::support_level_label;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub aq10_score: u8,
    pub likelihood_level: String,
    pub support_level: String,
    pub referral_source: String,
    pub referral_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let support = support_level_label(&data.support_needs.support_level_needed);

        let referral_status = match result.likelihood_level.as_str() {
            "highlyLikely" | "likely" => "Recommended",
            "possible" => "Consider",
            _ => "Not Indicated",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            aq10_score: result.aq10_score,
            likelihood_level: result.likelihood_level,
            support_level: support.to_string(),
            referral_source: data.patient_information.referral_source,
            referral_status: referral_status.to_string(),
        })
    }
}
