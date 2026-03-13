use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::nps_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub visit_date: String,
    pub department: String,
    pub provider_name: String,
    pub satisfaction_level: String,
    pub satisfaction_score: f64,
    pub nps_category: String,
    pub would_return: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let nps = nps_category(data.overall_experience.likelihood_to_recommend);

        let would_return = match data.overall_experience.would_return_for_care {
            Some(4..=5) => "Yes",
            Some(3) => "Maybe",
            Some(1..=2) => "No",
            _ => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            visit_date: data.visit_information.visit_date,
            department: data.visit_information.department_name,
            provider_name: data.visit_information.provider_name,
            satisfaction_level: result.satisfaction_level,
            satisfaction_score: result.satisfaction_score,
            nps_category: nps.to_string(),
            would_return: would_return.to_string(),
        })
    }
}
