use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::is_filled;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub completeness_status: String,
    pub has_nominated_person: String,
    pub last_review_date: String,
    pub capacity_confirmed: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let has_nominated = if is_filled(&data.nominated_persons.primary_contact_name) {
            "Yes"
        } else {
            "No"
        };

        let capacity = if data.healthcare_professional_review.capacity_confirmed.eq_ignore_ascii_case("yes") {
            "Yes"
        } else {
            "No"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            completeness_status: result.completeness_status,
            has_nominated_person: has_nominated.to_string(),
            last_review_date: data.healthcare_professional_review.review_date,
            capacity_confirmed: capacity.to_string(),
        })
    }
}
