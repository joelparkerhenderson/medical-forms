use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub oral_status: String,
    pub dmft_score: String,
    pub periodontal_diagnosis: String,
    pub caries_risk: String,
    pub last_visit: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let dmft_display = match result.dmft_score {
            Some(s) => s.to_string(),
            None => "N/A".to_string(),
        };

        let periodontal_label = match data.periodontal_assessment.periodontal_diagnosis.as_str() {
            "healthy" => "Healthy",
            "gingivitis" => "Gingivitis",
            "mildPeriodontitis" => "Mild Periodontitis",
            "moderatePeriodontitis" => "Moderate Periodontitis",
            "severePeriodontitis" => "Severe Periodontitis",
            other => other,
        };

        let caries_risk_label = match data.caries_assessment.caries_risk.as_str() {
            "low" => "Low",
            "moderate" => "Moderate",
            "high" => "High",
            other => other,
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name.clone(),
            oral_status: result.oral_health_status,
            dmft_score: dmft_display,
            periodontal_diagnosis: periodontal_label.to_string(),
            caries_risk: caries_risk_label.to_string(),
            last_visit: data.dental_history.last_dental_visit.clone(),
        })
    }
}
