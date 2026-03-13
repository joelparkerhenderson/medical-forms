use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::health_impression_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub date_of_birth: String,
    pub age_group: String,
    pub pediatrician: String,
    pub concern_level: String,
    pub concern_score: f64,
    pub health_category: String,
    pub immunization_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let health = health_impression_category(data.clinical_review.overall_health_impression);

        let imm_status = if data.immunization_status.immunizations_up_to_date == "yes" {
            "Up to date"
        } else if data.immunization_status.immunizations_up_to_date == "no" {
            "Behind"
        } else {
            "N/A"
        };

        let age_group = classify_age_group(&data.patient_parent_information.age_months);

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_parent_information.patient_name,
            date_of_birth: data.patient_parent_information.date_of_birth,
            age_group,
            pediatrician: data.patient_parent_information.pediatrician_name,
            concern_level: result.concern_level,
            concern_score: result.concern_score,
            health_category: health.to_string(),
            immunization_status: imm_status.to_string(),
        })
    }
}

/// Classify age into groups based on the age_months field.
fn classify_age_group(age_months: &str) -> String {
    match age_months {
        "0to3" => "Newborn".to_string(),
        "4to6" => "Infant".to_string(),
        "7to12" => "Infant".to_string(),
        "13to24" => "Toddler".to_string(),
        "25to36" => "Toddler".to_string(),
        "37to60" => "Preschool".to_string(),
        "61to96" => "School Age".to_string(),
        "97to144" => "School Age".to_string(),
        "145to216" => "Adolescent".to_string(),
        _ => "Unknown".to_string(),
    }
}
