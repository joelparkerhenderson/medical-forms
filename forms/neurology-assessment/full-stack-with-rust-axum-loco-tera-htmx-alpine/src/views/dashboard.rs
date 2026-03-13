use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::minimum_motor_power;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub primary_diagnosis: String,
    pub severity_level: String,
    pub motor_status: String,
    pub cognitive_score: String,
    pub urgency: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let motor_status = match minimum_motor_power(&data) {
            Some(p) if p <= 2 => format!("{}/5 (severe)", p),
            Some(p) if p <= 3 => format!("{}/5 (moderate)", p),
            Some(p) if p <= 4 => format!("{}/5 (mild)", p),
            Some(5) => "5/5 (normal)".to_string(),
            _ => "N/A".to_string(),
        };

        let cognitive_score = if let Some(mmse) = data.cognitive_screening.mmse_score {
            format!("MMSE: {}/30", mmse)
        } else if let Some(moca) = data.cognitive_screening.moca_score {
            format!("MoCA: {}/30", moca)
        } else {
            "N/A".to_string()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            primary_diagnosis: data.clinical_review.primary_diagnosis,
            severity_level: result.severity_level,
            motor_status,
            cognitive_score,
            urgency: data.clinical_review.urgency,
        })
    }
}
