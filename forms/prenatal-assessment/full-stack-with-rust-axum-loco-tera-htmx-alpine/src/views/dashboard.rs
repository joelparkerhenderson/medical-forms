use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub due_date: String,
    pub gestational_age: String,
    pub referring_provider: String,
    pub risk_level: String,
    pub risk_score: f64,
    pub booking_date: String,
    pub pregnancy_type: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let gestational_age = match data.patient_information.gestational_age_weeks {
            Some(w) => format!("{w} weeks"),
            None => "N/A".to_string(),
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            due_date: data.patient_information.estimated_due_date,
            gestational_age,
            referring_provider: data.patient_information.referring_provider,
            risk_level: result.risk_level,
            risk_score: result.risk_score,
            booking_date: data.patient_information.booking_date,
            pregnancy_type: data.current_pregnancy.pregnancy_type,
        })
    }
}
