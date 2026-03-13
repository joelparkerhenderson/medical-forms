use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub exam_date: String,
    pub patient_name: String,
    pub referring_clinician: String,
    pub impairment_level: String,
    pub impairment_score: f64,
    pub right_bcva: String,
    pub left_bcva: String,
    pub right_iop: String,
    pub left_iop: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let right_iop = data
            .intraocular_pressure
            .right_iop
            .map(|v| format!("{} mmHg", v))
            .unwrap_or_else(|| "N/A".to_string());
        let left_iop = data
            .intraocular_pressure
            .left_iop
            .map(|v| format!("{} mmHg", v))
            .unwrap_or_else(|| "N/A".to_string());

        let right_bcva = if data.visual_acuity.right_best_corrected.is_empty() {
            "N/A".to_string()
        } else {
            data.visual_acuity.right_best_corrected.clone()
        };
        let left_bcva = if data.visual_acuity.left_best_corrected.is_empty() {
            "N/A".to_string()
        } else {
            data.visual_acuity.left_best_corrected.clone()
        };

        Some(Self {
            id: m.id.to_string(),
            exam_date: data.patient_information.exam_date,
            patient_name: data.patient_information.patient_name,
            referring_clinician: data.patient_information.referring_clinician,
            impairment_level: result.impairment_level,
            impairment_score: result.impairment_score,
            right_bcva,
            left_bcva,
            right_iop,
            left_iop,
        })
    }
}
