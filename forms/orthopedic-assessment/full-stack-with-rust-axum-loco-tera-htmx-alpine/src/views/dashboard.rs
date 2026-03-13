use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub assessment_date: String,
    pub clinician_name: String,
    pub primary_complaint: String,
    pub affected_joint: String,
    pub severity_level: String,
    pub severity_score: f64,
    pub surgical_candidate: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let surgical = match data.surgical_considerations.surgical_candidate.as_str() {
            "yes" => "Yes",
            "no" => "No",
            _ => "N/A",
        };

        Some(Self {
            id: m.id.to_string(),
            assessment_date: data.patient_information.assessment_date,
            clinician_name: data.patient_information.clinician_name,
            primary_complaint: data.injury_history.primary_complaint,
            affected_joint: data.joint_examination.affected_joint,
            severity_level: result.severity_level,
            severity_score: result.severity_score,
            surgical_candidate: surgical.to_string(),
        })
    }
}
