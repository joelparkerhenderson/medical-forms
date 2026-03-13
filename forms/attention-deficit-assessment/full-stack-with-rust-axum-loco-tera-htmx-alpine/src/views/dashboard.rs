use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::treatment_status;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub assessment_date: String,
    pub asrs_score: u8,
    pub likelihood_level: String,
    pub functional_impact: String,
    pub treatment_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let tx_status = treatment_status(&data).to_string();

        let fi = match crate::engine::utils::functional_impact_score(&data) {
            Some(s) if s > 75.0 => "Severe",
            Some(s) if s > 50.0 => "Moderate",
            Some(s) if s > 25.0 => "Mild",
            Some(_) => "Minimal",
            None => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            assessment_date: data.patient_information.assessment_date,
            asrs_score: result.asrs_score,
            likelihood_level: result.likelihood_level,
            functional_impact: fi.to_string(),
            treatment_status: tx_status,
        })
    }
}
