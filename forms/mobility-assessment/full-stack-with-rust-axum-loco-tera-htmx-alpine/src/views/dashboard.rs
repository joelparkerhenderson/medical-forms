use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::falls_risk_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub assessment_date: String,
    pub primary_diagnosis: String,
    pub assessor_name: String,
    pub mobility_level: String,
    pub mobility_score: f64,
    pub falls_risk: String,
    pub rehabilitation_potential: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let falls = falls_risk_category(&data.falls_risk_assessment.falls_in_past_year);

        let rehab = match data.clinical_review.rehabilitation_potential {
            Some(4..=5) => "High",
            Some(3) => "Moderate",
            Some(1..=2) => "Low",
            _ => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            assessment_date: data.patient_information.assessment_date,
            primary_diagnosis: data.patient_information.primary_diagnosis,
            assessor_name: data.patient_information.assessor_name,
            mobility_level: result.mobility_level,
            mobility_score: result.mobility_score,
            falls_risk: falls.to_string(),
            rehabilitation_potential: rehab.to_string(),
        })
    }
}
