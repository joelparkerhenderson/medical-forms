use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::smoking_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub date_of_birth: String,
    pub smoking_status: String,
    pub smoking_category: String,
    pub respiratory_level: String,
    pub respiratory_score: f64,
    pub follow_up_urgency: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let smoking_cat = smoking_category(&data.patient_information.pack_years);

        let follow_up = match data.clinical_review.follow_up_urgency {
            Some(4..=5) => "Urgent",
            Some(3) => "Routine",
            Some(1..=2) => "Low",
            _ => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            date_of_birth: data.patient_information.date_of_birth,
            smoking_status: data.patient_information.smoking_status,
            smoking_category: smoking_cat.to_string(),
            respiratory_level: result.respiratory_level,
            respiratory_score: result.respiratory_score,
            follow_up_urgency: follow_up.to_string(),
        })
    }
}
