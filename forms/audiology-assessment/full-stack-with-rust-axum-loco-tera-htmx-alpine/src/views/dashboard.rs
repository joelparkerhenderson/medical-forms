use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::hearing_aid_status;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub hearing_level: String,
    pub pure_tone_average: f64,
    pub loss_type: String,
    pub tinnitus_present: String,
    pub hearing_aid_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let loss_type = if !data.clinical_review.loss_type_right.is_empty() {
            if data.clinical_review.loss_type_right == data.clinical_review.loss_type_left {
                data.clinical_review.loss_type_right.clone()
            } else {
                format!("R: {} / L: {}", data.clinical_review.loss_type_right, data.clinical_review.loss_type_left)
            }
        } else if !data.clinical_review.loss_type_left.is_empty() {
            data.clinical_review.loss_type_left.clone()
        } else {
            "Not specified".to_string()
        };

        let tinnitus = if data.tinnitus.tinnitus_present == "yes" {
            "Yes".to_string()
        } else {
            "No".to_string()
        };

        let ha_status = hearing_aid_status(&data).to_string();

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            hearing_level: result.hearing_level,
            pure_tone_average: result.pure_tone_average,
            loss_type,
            tinnitus_present: tinnitus,
            hearing_aid_status: ha_status,
        })
    }
}
