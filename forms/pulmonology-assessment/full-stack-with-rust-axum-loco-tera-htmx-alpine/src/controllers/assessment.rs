use std::sync::Arc;

use axum::{debug_handler, response::Redirect, Extension};
use chrono::Utc;
use loco_rs::prelude::*;
use sea_orm::{ActiveValue, IntoActiveModel};
use serde::Deserialize;
use tera::{Context, Tera};
use uuid::Uuid;

use crate::engine::{pulmonology_grader, flagged_issues, types::AssessmentData};
use crate::models::{
    _entities::assessments::ActiveModel,
    assessments::find_by_id,
};
use crate::views::assessment::build_step_context;

/// POST /assessment/new -- create new assessment, redirect to step 1
#[debug_handler]
async fn create_new(
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let item = ActiveModel::new_draft()
        .map_err(|e| Error::BadRequest(format!("Failed to create assessment: {e}")))?;
    let item = item.insert(&ctx.db).await?;
    let id = item.id;
    Ok(Redirect::to(&format!("/assessment/{id}/step/1")).into_response())
}

#[derive(Debug, Deserialize)]
struct StepParams {
    id: Uuid,
    step: u32,
}

/// GET /assessment/{id}/step/{step} -- render step form
#[debug_handler]
async fn show_step(
    Path(params): Path<StepParams>,
    State(ctx): State<AppContext>,
    Extension(tera): Extension<Arc<Tera>>,
) -> Result<Response> {
    let item = find_by_id(&ctx.db, params.id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let data: AssessmentData = item
        .assessment_data()
        .unwrap_or_default();

    let context = build_step_context(&data, params.id, params.step);
    let template_name = format!("assessment/step{:02}.html.tera", params.step);

    let rendered = tera
        .render(&template_name, &context)
        .map_err(|e| Error::BadRequest(format!("Template error: {e}")))?;

    Ok(Response::builder()
        .header("Content-Type", "text/html; charset=utf-8")
        .body(axum::body::Body::from(rendered))
        .map_err(Error::wrap)?
        .into_response())
}

/// Convert form section name (snake_case) to JSON key (camelCase).
fn section_to_json(section: &str) -> &str {
    match section {
        "patient_information" => "patientInformation",
        "respiratory_history" => "respiratoryHistory",
        "symptom_assessment" => "symptomAssessment",
        "smoking_exposure" => "smokingExposure",
        "pulmonary_function_tests" => "pulmonaryFunctionTests",
        "chest_imaging" => "chestImaging",
        "arterial_blood_gases" => "arterialBloodGases",
        "sleep_breathing" => "sleepBreathing",
        "current_treatment" => "currentTreatment",
        "clinical_review" => "clinicalReview",
        other => other,
    }
}

/// Convert form field name (snake_case) to JSON key (camelCase).
fn field_to_json(field: &str) -> String {
    let parts: Vec<&str> = field.split('_').collect();
    let mut result = String::new();
    for (i, part) in parts.iter().enumerate() {
        if i == 0 {
            result.push_str(part);
        } else {
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.push(first.to_ascii_uppercase());
                result.extend(chars);
            }
        }
    }
    result
}

/// Parse a form value string, converting numeric strings to JSON numbers.
fn parse_form_value(value: &serde_json::Value) -> serde_json::Value {
    if let Some(s) = value.as_str() {
        if s.is_empty() {
            serde_json::Value::Null
        } else if let Ok(n) = s.parse::<f64>() {
            serde_json::json!(n)
        } else {
            value.clone()
        }
    } else {
        value.clone()
    }
}

/// List of fields that should remain as strings even when they look numeric.
fn is_string_field(field: &str) -> bool {
    matches!(
        field,
        "patientName"
            | "dateOfBirth"
            | "patientAge"
            | "patientSex"
            | "referringPhysician"
            | "assessmentDate"
            | "primaryComplaint"
            | "insuranceStatus"
            | "asthmaHistory"
            | "copdHistory"
            | "pneumoniaHistory"
            | "tuberculosisHistory"
            | "lungCancerHistory"
            | "interstitialLungDisease"
            | "familyRespiratoryHistory"
            | "hemoptysisPresent"
            | "symptomDuration"
            | "smokingStatus"
            | "packYears"
            | "secondhandSmoke"
            | "occupationalExposure"
            | "environmentalAllergens"
            | "dustExposure"
            | "chemicalExposure"
            | "asbestosExposure"
            | "bronchodilatorResponse"
            | "lungVolumesNormal"
            | "flowVolumeLoopPattern"
            | "chestXrayFindings"
            | "ctScanFindings"
            | "noduleDetected"
            | "noduleSizeMm"
            | "pleuralEffusion"
            | "consolidationPresent"
            | "fibrosisPattern"
            | "pao2Mmhg"
            | "paco2Mmhg"
            | "phLevel"
            | "sao2Percent"
            | "bicarbonateLevel"
            | "supplementalOxygen"
            | "oxygenFlowRate"
            | "apneaWitnessed"
            | "sleepStudyDone"
            | "ahiScore"
            | "cpapCompliance"
            | "morningHeadaches"
            | "inhalerUse"
            | "oralMedications"
            | "oxygenTherapy"
            | "pulmonaryRehab"
            | "sideEffectsReported"
            | "exacerbationFrequency"
            | "specialistReferralNeeded"
            | "additionalTestsNeeded"
            | "clinicalNotes"
    )
}

/// Parse a form value, keeping string fields as strings and converting Likert fields to numbers.
fn parse_field_value(json_field: &str, value: &serde_json::Value) -> serde_json::Value {
    if is_string_field(json_field) {
        if let Some(s) = value.as_str() {
            serde_json::Value::String(s.to_string())
        } else {
            value.clone()
        }
    } else {
        parse_form_value(value)
    }
}

/// POST /assessment/{id}/step/{step} -- save step data, redirect to next step
#[debug_handler]
async fn save_step(
    Path(params): Path<StepParams>,
    State(ctx): State<AppContext>,
    axum::extract::Form(form_data): axum::extract::Form<serde_json::Value>,
) -> Result<Response> {
    let item = find_by_id(&ctx.db, params.id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    // Merge form data into existing assessment data
    let mut data_value = item.data.clone();
    if let Some(obj) = data_value.as_object_mut() {
        if let Some(form_obj) = form_data.as_object() {
            for (key, value) in form_obj {
                // Handle dotted keys: "section.field"
                let parts: Vec<&str> = key.split('.').collect();
                if parts.len() == 2 {
                    let section = section_to_json(parts[0]);
                    let field = field_to_json(parts[1]);
                    if let Some(section_obj) = obj.get_mut(section).and_then(|s| s.as_object_mut()) {
                        section_obj.insert(field.clone(), parse_field_value(&field, value));
                    }
                }
            }
        }
    }

    let mut active: ActiveModel = item.into_active_model();
    active.data = ActiveValue::Set(data_value);
    active.updated_at = ActiveValue::Set(Utc::now().into());
    active.update(&ctx.db).await?;

    let next_step = params.step + 1;
    if next_step > 10 {
        Ok(Redirect::to(&format!("/assessment/{}/report", params.id)).into_response())
    } else {
        Ok(Redirect::to(&format!("/assessment/{}/step/{next_step}", params.id)).into_response())
    }
}

/// GET /assessment/{id}/report -- grade and render report
#[debug_handler]
async fn show_report(
    Path(id): Path<Uuid>,
    State(ctx): State<AppContext>,
    Extension(tera): Extension<Arc<Tera>>,
) -> Result<Response> {
    let item = find_by_id(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let assessment_data: AssessmentData = item
        .assessment_data()
        .map_err(|e| Error::BadRequest(format!("Invalid assessment data: {e}")))?;

    // Run grading engine
    let (severity_level, severity_score, fired_rules) =
        pulmonology_grader::calculate_severity(&assessment_data);
    let additional_flags = flagged_issues::detect_additional_flags(&assessment_data);
    let timestamp = Utc::now().to_rfc3339();

    let grading_result = crate::engine::types::GradingResult {
        severity_level: severity_level.clone(),
        severity_score,
        fired_rules: fired_rules.clone(),
        additional_flags: additional_flags.clone(),
        timestamp: timestamp.clone(),
    };

    // Store result in DB
    let result_json = serde_json::to_value(&grading_result).map_err(Error::wrap)?;
    let mut active: ActiveModel = item.into_active_model();
    active.result = ActiveValue::Set(Some(result_json));
    active.status = ActiveValue::Set("completed".to_string());
    active.updated_at = ActiveValue::Set(Utc::now().into());
    active.update(&ctx.db).await?;

    // Build template context
    let gold_stage = crate::engine::utils::copd_gold_stage(
        assessment_data.pulmonary_function_tests.fev1_percent_predicted,
    );

    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("data", &assessment_data);
    context.insert("severity_level", &severity_level);
    context.insert("severity_label", &crate::engine::utils::severity_level_label(&severity_level));
    context.insert("severity_score", &severity_score);
    context.insert("gold_stage", &gold_stage);
    context.insert("fired_rules", &fired_rules);
    context.insert("additional_flags", &additional_flags);
    context.insert("timestamp", &timestamp);

    let rendered = tera
        .render("report.html.tera", &context)
        .map_err(|e| Error::BadRequest(format!("Template error: {e}")))?;

    Ok(Response::builder()
        .header("Content-Type", "text/html; charset=utf-8")
        .body(axum::body::Body::from(rendered))
        .map_err(Error::wrap)?
        .into_response())
}

/// GET / -- landing page
#[debug_handler]
async fn landing(Extension(tera): Extension<Arc<Tera>>) -> Result<Response> {
    let context = Context::new();
    let rendered = tera
        .render("landing.html.tera", &context)
        .map_err(|e| Error::BadRequest(format!("Template error: {e}")))?;

    Ok(Response::builder()
        .header("Content-Type", "text/html; charset=utf-8")
        .body(axum::body::Body::from(rendered))
        .map_err(Error::wrap)?
        .into_response())
}

pub fn routes(tera: Arc<Tera>) -> Routes {
    Routes::new()
        .add("/", get(landing))
        .add("assessment/new", post(create_new))
        .add("assessment/{id}/step/{step}", get(show_step))
        .add("assessment/{id}/step/{step}", post(save_step))
        .add("assessment/{id}/report", get(show_report))
        .layer(Extension(tera))
}
