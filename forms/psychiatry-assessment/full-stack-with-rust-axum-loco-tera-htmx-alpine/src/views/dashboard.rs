use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::urgency_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub assessment_date: String,
    pub clinician_name: String,
    pub severity_level: String,
    pub severity_score: f64,
    pub urgency_category: String,
    pub chief_complaint: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let urgency = urgency_category(data.clinical_review.treatment_urgency);

        let complaint = if data.presenting_complaint.chief_complaint.len() > 50 {
            format!("{}...", &data.presenting_complaint.chief_complaint[..50])
        } else {
            data.presenting_complaint.chief_complaint.clone()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            assessment_date: data.patient_information.assessment_date,
            clinician_name: data.patient_information.clinician_name,
            severity_level: result.severity_level,
            severity_score: result.severity_score,
            urgency_category: urgency.to_string(),
            chief_complaint: complaint,
        })
    }
}
