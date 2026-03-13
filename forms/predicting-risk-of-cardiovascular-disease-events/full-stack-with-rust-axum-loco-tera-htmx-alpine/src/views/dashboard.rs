use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub age: String,
    pub sex: String,
    pub risk_category: String,
    pub ten_year_risk: f64,
    pub diabetes_status: String,
    pub egfr: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult = m
            .result
            .as_ref()
            .and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let age_str = data
            .demographics
            .age
            .map(|a| a.to_string())
            .unwrap_or_else(|| "N/A".to_string());

        let sex_str = if data.demographics.sex.is_empty() {
            "N/A".to_string()
        } else {
            data.demographics.sex.clone()
        };

        let diabetes = if data.metabolic_health.has_diabetes == "yes" {
            "Yes".to_string()
        } else if data.metabolic_health.has_diabetes == "no" {
            "No".to_string()
        } else {
            "N/A".to_string()
        };

        let egfr_str = data
            .renal_function
            .egfr
            .map(|e| format!("{:.0}", e))
            .unwrap_or_else(|| "N/A".to_string());

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            age: age_str,
            sex: sex_str,
            risk_category: result.risk_category,
            ten_year_risk: result.ten_year_risk_percent,
            diabetes_status: diabetes,
            egfr: egfr_str,
        })
    }
}
