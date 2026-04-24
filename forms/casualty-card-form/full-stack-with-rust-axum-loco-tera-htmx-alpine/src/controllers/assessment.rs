use std::sync::Arc;

use axum::{debug_handler, response::Redirect, Extension};
use chrono::Utc;
use loco_rs::prelude::*;
use sea_orm::{ActiveValue, IntoActiveModel};
use tera::{Context, Tera};
use uuid::Uuid;

use crate::engine::{news2_calculator, flagged_issues, types::AssessmentData};
use crate::models::{
    _entities::assessments::ActiveModel,
    assessments::find_by_id,
};
use crate::views::assessment::build_assessment_context;

/// POST /assessment/new -- create new assessment, redirect to step 1
#[debug_handler]
async fn create_new(
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let item = ActiveModel::new_draft()
        .map_err(|e| Error::BadRequest(format!("Failed to create assessment: {e}")))?;
    let item = item.insert(&ctx.db).await?;
    let id = item.id;
    Ok(Redirect::to(&format!("/assessment/{id}")).into_response())
}

/// GET /assessment/{id} -- render the single-page form
#[debug_handler]
async fn show_assessment(
    Path(id): Path<Uuid>,
    State(ctx): State<AppContext>,
    Extension(tera): Extension<Arc<Tera>>,
) -> Result<Response> {
    let item = find_by_id(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let data: AssessmentData = item
        .assessment_data()
        .unwrap_or_default();

    let context = build_assessment_context(&data, id);
    let rendered = tera
        .render("assessment.html.tera", &context)
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
        "next_of_kin" => "nextOfKin",
        "arrival_triage" => "arrivalTriage",
        "presenting_complaint" => "presentingComplaint",
        "pain_assessment" => "painAssessment",
        "medical_history" => "medicalHistory",
        "vital_signs" => "vitalSigns",
        "primary_survey" => "primarySurvey",
        "clinical_examination" => "clinicalExamination",
        "treatment_interventions" => "treatmentInterventions",
        "assessment_plan" => "assessmentPlan",
        other => other,
    }
}

/// Convert form field name (snake_case) to JSON key (camelCase),
/// handling medical abbreviations with explicit serde renames.
fn field_to_json(field: &str) -> String {
    match field {
        "mts_flowchart" => return "mtsFlowchart".to_string(),
        "mts_category" => return "mtsCategory".to_string(),
        "mts_discriminator" => return "mtsDiscriminator".to_string(),
        "systolic_bp" => return "systolicBP".to_string(),
        "diastolic_bp" => return "diastolicBP".to_string(),
        "gcs_eye" => return "gcsEye".to_string(),
        "gcs_verbal" => return "gcsVerbal".to_string(),
        "gcs_motor" => return "gcsMotor".to_string(),
        "gcs_total" => return "gcsTotal".to_string(),
        "completed_by_gmc_number" => return "completedByGMCNumber".to_string(),
        "iv_access" => return "ivAccess".to_string(),
        _ => {}
    }
    // Standard snake_case to camelCase
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
            serde_json::Value::String(String::new())
        } else if let Ok(n) = s.parse::<f64>() {
            serde_json::json!(n)
        } else {
            value.clone()
        }
    } else {
        value.clone()
    }
}

/// Array field prefixes we handle in the form data.
const ARRAY_PREFIXES: &[(&str, &str)] = &[
    ("medications[", "medications"),
    ("allergies[", "allergies"),
    ("blood_tests[", "bloodTests"),
    ("imaging[", "imaging"),
    ("medications_administered[", "medicationsAdministered"),
    ("fluid_therapy[", "fluidTherapy"),
    ("procedures[", "procedures"),
];

/// POST /assessment/{id}/submit -- save all form data, redirect to report
#[debug_handler]
async fn submit_assessment(
    Path(id): Path<Uuid>,
    State(ctx): State<AppContext>,
    axum::extract::Form(form_data): axum::extract::Form<serde_json::Value>,
) -> Result<Response> {
    let item = find_by_id(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    // Merge form data into existing assessment data
    let mut data_value = item.data.clone();
    if let Some(obj) = data_value.as_object_mut() {
        if let Some(form_obj) = form_data.as_object() {
            // Collect array entries separately
            let mut array_maps: std::collections::HashMap<&str, std::collections::BTreeMap<usize, serde_json::Map<String, serde_json::Value>>> =
                std::collections::HashMap::new();

            for (key, value) in form_obj {
                // Check if this is an array field
                let mut is_array = false;
                for (prefix, json_key) in ARRAY_PREFIXES {
                    if key.starts_with(prefix) {
                        is_array = true;
                        if let Some(bracket_end) = key.find(']') {
                            if let Ok(idx) = key[key.find('[').unwrap() + 1..bracket_end].parse::<usize>() {
                                if let Some(dot_pos) = key.find("].") {
                                    let field_name = &key[dot_pos + 2..];
                                    let parsed = parse_form_value(value);
                                    array_maps
                                        .entry(json_key)
                                        .or_default()
                                        .entry(idx)
                                        .or_default()
                                        .insert(field_name.to_string(), parsed);
                                }
                            }
                        }
                        break;
                    }
                }
                if is_array {
                    continue;
                }

                // Handle dotted keys: "section.field"
                let parts: Vec<&str> = key.split('.').collect();
                if parts.len() == 2 {
                    let section = section_to_json(parts[0]);
                    let field = field_to_json(parts[1]);
                    if let Some(section_obj) = obj.get_mut(section).and_then(|s| s.as_object_mut()) {
                        section_obj.insert(field, parse_form_value(value));
                    }
                }
            }

            // Build arrays from collected entries
            for (json_key, entries) in &array_maps {
                // Determine the filter field (first non-empty field to filter empties)
                let filter_field = match *json_key {
                    "allergies" => "allergen",
                    "imaging" => "site",
                    "fluidTherapy" => "fluidType",
                    "procedures" => "description",
                    "medicationsAdministered" => "drug",
                    _ => "name",
                };
                let items: Vec<serde_json::Value> = entries.values()
                    .filter(|entry| {
                        entry.get(filter_field).and_then(|v| v.as_str()).unwrap_or("").len() > 0
                    })
                    .map(|entry| serde_json::Value::Object(entry.clone()))
                    .collect();
                obj.insert(json_key.to_string(), serde_json::Value::Array(items));
            }
        }
    }

    let mut active: ActiveModel = item.into_active_model();
    active.data = ActiveValue::Set(data_value);
    active.updated_at = ActiveValue::Set(Utc::now().into());
    active.update(&ctx.db).await?;

    Ok(Redirect::to(&format!("/assessment/{id}/report")).into_response())
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

    // Run NEWS2 grading engine
    let (news2_score, fired_rules) = news2_calculator::calculate_news2(&assessment_data);
    let clinical_response = news2_calculator::clinical_response(news2_score, &fired_rules);
    let additional_flags = flagged_issues::detect_additional_flags(&assessment_data);
    let timestamp = Utc::now().to_rfc3339();

    // Add NEWS2 high score flag if applicable
    let mut all_flags = additional_flags.clone();
    if news2_score >= 7 {
        all_flags.insert(0, crate::engine::types::AdditionalFlag {
            id: "FLAG-NEWS2-HIGH".to_string(),
            category: "NEWS2".to_string(),
            message: format!("NEWS2 score {} - emergency assessment by critical care", news2_score),
            priority: "critical".to_string(),
        });
    }

    let grading_result = crate::engine::types::GradingResult {
        news2_score,
        clinical_response: clinical_response.clone(),
        fired_rules: fired_rules.clone(),
        additional_flags: all_flags.clone(),
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
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("data", &assessment_data);
    context.insert("news2_score", &news2_score);
    context.insert("clinical_response", &clinical_response);
    context.insert("clinical_response_label", &crate::engine::utils::clinical_response_label(&clinical_response));
    context.insert("fired_rules", &fired_rules);
    context.insert("additional_flags", &all_flags);
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
        .add("assessment/{id}", get(show_assessment))
        .add("assessment/{id}/submit", post(submit_assessment))
        .add("assessment/{id}/report", get(show_report))
        .layer(Extension(tera))
}
