use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::bmi_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub assessment_date: String,
    pub referring_clinician: String,
    pub eligibility_level: String,
    pub eligibility_score: f64,
    pub bmi_category: String,
    pub bmi: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let bmi_cat = bmi_category(data.weight_bmi_history.current_bmi);

        let bmi_display = match data.weight_bmi_history.current_bmi {
            Some(b) => format!("{:.1}", b),
            None => "N/A".to_string(),
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            assessment_date: data.patient_information.assessment_date,
            referring_clinician: data.patient_information.referring_clinician,
            eligibility_level: result.eligibility_level,
            eligibility_score: result.eligibility_score,
            bmi_category: bmi_cat.to_string(),
            bmi: bmi_display,
        })
    }
}
