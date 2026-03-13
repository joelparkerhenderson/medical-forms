use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::fev1_percent_predicted;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub control_level: String,
    pub gina_step: String,
    pub fev1_percent: String,
    pub exacerbations: String,
    pub has_action_plan: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let fev1_pct = fev1_percent_predicted(&data)
            .map(|p| format!("{:.0}%", p))
            .unwrap_or_else(|| "N/A".to_string());

        let exacerbations = data
            .triggers_exacerbations
            .exacerbations_last12_months
            .map(|n| n.to_string())
            .unwrap_or_else(|| "N/A".to_string());

        let has_action_plan = if data.review_management_plan.action_plan_provided == "yes" {
            "Yes"
        } else {
            "No"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            control_level: result.control_level,
            gina_step: data.current_medications.gina_step,
            fev1_percent: fev1_pct,
            exacerbations,
            has_action_plan: has_action_plan.to_string(),
        })
    }
}
