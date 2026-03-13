use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::completeness_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub date_of_birth: String,
    pub vaccination_level: String,
    pub vaccination_score: f64,
    pub completeness: String,
    pub consent_status: String,
    pub review_date: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let completeness = completeness_category(result.vaccination_score);

        let consent_status = if data.consent_information.consent_given == "yes" {
            "Given"
        } else if data.consent_information.consent_given == "no" {
            "Refused"
        } else {
            "Pending"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            date_of_birth: data.patient_information.date_of_birth,
            vaccination_level: result.vaccination_level,
            vaccination_score: result.vaccination_score,
            completeness: completeness.to_string(),
            consent_status: consent_status.to_string(),
            review_date: data.clinical_review.next_dose_due,
        })
    }
}
