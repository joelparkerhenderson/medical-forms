use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::hearing_loss_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub assessment_date: String,
    pub hearing_loss_severity: String,
    pub hearing_aid_level: String,
    pub hearing_aid_score: f64,
    pub affected_ear: String,
    pub currently_wearing: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let severity = if !data.audiometric_results.hearing_loss_severity.is_empty() {
            data.audiometric_results.hearing_loss_severity.clone()
        } else {
            // Derive from PTA if not explicitly set
            let max_pta = std::cmp::max(
                data.audiometric_results.right_ear_pta.unwrap_or(0),
                data.audiometric_results.left_ear_pta.unwrap_or(0),
            );
            hearing_loss_category(Some(max_pta)).to_string()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            assessment_date: data.patient_information.assessment_date,
            hearing_loss_severity: severity,
            hearing_aid_level: result.hearing_aid_level,
            hearing_aid_score: result.hearing_aid_score,
            affected_ear: data.hearing_history.affected_ear,
            currently_wearing: data.current_hearing_aids.currently_wearing,
        })
    }
}
