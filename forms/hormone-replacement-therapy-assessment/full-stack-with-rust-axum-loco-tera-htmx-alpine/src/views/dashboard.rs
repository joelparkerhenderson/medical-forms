use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::recommendation_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub patient_age: String,
    pub menopausal_status: String,
    pub risk_level: String,
    pub risk_score: f64,
    pub recommendation: String,
    pub review_date: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let recommendation = recommendation_category(&result.risk_level);

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            patient_age: data.patient_information.patient_age,
            menopausal_status: data.menstrual_history.menopausal_status,
            risk_level: result.risk_level,
            risk_score: result.risk_score,
            recommendation: recommendation.to_string(),
            review_date: data.clinical_review.review_date,
        })
    }
}
