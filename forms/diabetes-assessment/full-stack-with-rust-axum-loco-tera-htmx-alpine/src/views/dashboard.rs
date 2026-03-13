use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::count_complications;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub diabetes_type: String,
    pub hba1c: String,
    pub control_level: String,
    pub complications: String,
    pub last_review: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let hba1c = if let Some(val) = data.glycaemic_control.hba1c_value {
            if data.glycaemic_control.hba1c_unit == "percent" {
                format!("{:.1}%", val)
            } else {
                format!("{:.0} mmol/mol", val)
            }
        } else {
            "N/A".to_string()
        };

        let comp_count = count_complications(&data);
        let complications = if comp_count == 0 {
            "None".to_string()
        } else {
            format!("{} active", comp_count)
        };

        let diabetes_type = match data.diabetes_history.diabetes_type.as_str() {
            "type1" => "Type 1",
            "type2" => "Type 2",
            "gestational" => "Gestational",
            "other" => "Other",
            _ => "Unknown",
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            diabetes_type: diabetes_type.to_string(),
            hba1c,
            control_level: result.control_level,
            complications,
            last_review: data.review_care_plan.review_date,
        })
    }
}
