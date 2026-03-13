use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub review_date: String,
    pub primary_diagnosis: String,
    pub clinician_name: String,
    pub severity_level: String,
    pub severity_score: f64,
    pub referral_needed: String,
    pub follow_up: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            review_date: data.clinical_review.review_date,
            primary_diagnosis: data.clinical_review.primary_diagnosis,
            clinician_name: data.clinical_review.clinician_name,
            severity_level: result.severity_level,
            severity_score: result.severity_score,
            referral_needed: data.clinical_review.referral_needed,
            follow_up: data.clinical_review.follow_up,
        })
    }
}
