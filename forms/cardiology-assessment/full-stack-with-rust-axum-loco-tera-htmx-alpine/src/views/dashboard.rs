use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub primary_diagnosis: String,
    pub severity_level: String,
    pub nyha_class: String,
    pub lvef: String,
    pub heart_rhythm: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let lvef_display = match data.echocardiography.lvef {
            Some(v) => format!("{}%", v),
            None => "N/A".to_string(),
        };

        let nyha = if data.symptoms_assessment.nyha_class.is_empty() {
            "N/A".to_string()
        } else {
            format!("NYHA {}", data.symptoms_assessment.nyha_class)
        };

        let heart_rhythm = if data.physical_examination.heart_rhythm.is_empty() {
            "N/A".to_string()
        } else {
            data.physical_examination.heart_rhythm.clone()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            primary_diagnosis: data.clinical_review.primary_diagnosis,
            severity_level: result.severity_level,
            nyha_class: nyha,
            lvef: lvef_display,
            heart_rhythm,
        })
    }
}
