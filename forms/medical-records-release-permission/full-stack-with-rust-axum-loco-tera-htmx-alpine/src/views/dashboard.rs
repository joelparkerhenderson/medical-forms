use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::review_decision_label;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub requester_name: String,
    pub purpose: String,
    pub completion_level: String,
    pub completion_score: f64,
    pub review_decision: String,
    pub submission_date: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let review = review_decision_label(&data.clinical_review.review_decision);

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_full_name,
            requester_name: data.requesting_party.requester_name,
            purpose: data.purpose_of_release.primary_purpose,
            completion_level: result.completion_level,
            completion_score: result.completion_score,
            review_decision: review.to_string(),
            submission_date: data.signatures_consent.patient_signature_date,
        })
    }
}
