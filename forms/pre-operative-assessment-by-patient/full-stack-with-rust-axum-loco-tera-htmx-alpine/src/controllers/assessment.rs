use std::sync::Arc;

use axum::{debug_handler, response::Redirect, Extension};
use chrono::Utc;
use loco_rs::prelude::*;
use sea_orm::{ActiveValue, IntoActiveModel};
use tera::{Context, Tera};
use uuid::Uuid;

use crate::engine::{asa_grader, flagged_issues, types::AssessmentData};
use crate::models::{
    _entities::assessments::ActiveModel,
    assessments::find_by_id,
};
use crate::views::assessment::build_assessment_context;

/// POST /assessment/new -- create new assessment, redirect to the single-page form.
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

/// GET /assessment/{id} -- render the single-page assessment form.
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
        "musculoskeletal_airway" => "musculoskeletalAirway",
        "previous_anaesthesia" => "previousAnaesthesia",
        "social_history" => "socialHistory",
        "functional_capacity" => "functionalCapacity",
        other => other,
    }
}

/// Convert form field name (snake_case) to JSON key (camelCase),
/// handling medical abbreviations with explicit serde renames.
fn field_to_json(field: &str) -> String {
    match field {
        "heart_failure_nyha" => return "heartFailureNYHA".to_string(),
        "recent_mi" => return "recentMI".to_string(),
        "recent_mi_weeks" => return "recentMIWeeks".to_string(),
        "osa_cpap" => return "osaCPAP".to_string(),
        "recent_urti" => return "recentURTI".to_string(),
        "stroke_or_tia" => return "strokeOrTIA".to_string(),
        "raised_icp" => return "raisedICP".to_string(),
        "family_mh_history" => return "familyMHHistory".to_string(),
        "family_mh_details" => return "familyMHDetails".to_string(),
        "estimated_mets" => return "estimatedMETs".to_string(),
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

/// POST /assessment/{id}/submit -- save all sections of the form, grade, redirect to report.
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
            // Collect array entries (medications, allergies) separately
            let mut med_entries: std::collections::BTreeMap<usize, serde_json::Map<String, serde_json::Value>> = std::collections::BTreeMap::new();
            let mut allergy_entries: std::collections::BTreeMap<usize, serde_json::Map<String, serde_json::Value>> = std::collections::BTreeMap::new();

            for (key, value) in form_obj {
                // Handle array fields: medications[0].name, allergies[1].allergen
                if key.starts_with("medications[") || key.starts_with("allergies[") {
                    let is_med = key.starts_with("medications[");
                    if let Some(bracket_end) = key.find(']') {
                        if let Ok(idx) = key[key.find('[').unwrap() + 1..bracket_end].parse::<usize>() {
                            if let Some(dot_pos) = key.find("].") {
                                let field_name = &key[dot_pos + 2..];
                                let parsed = parse_form_value(value);
                                let entries = if is_med { &mut med_entries } else { &mut allergy_entries };
                                entries.entry(idx).or_default().insert(field_name.to_string(), parsed);
                            }
                        }
                    }
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

            // Build medication array (filter out empty entries)
            if !med_entries.is_empty() {
                let meds: Vec<serde_json::Value> = med_entries.values()
                    .filter(|entry| {
                        entry.get("name").and_then(|v| v.as_str()).unwrap_or("").len() > 0
                    })
                    .map(|entry| serde_json::Value::Object(entry.clone()))
                    .collect();
                obj.insert("medications".to_string(), serde_json::Value::Array(meds));
            }

            // Build allergy array (filter out empty entries)
            if !allergy_entries.is_empty() {
                let allergies: Vec<serde_json::Value> = allergy_entries.values()
                    .filter(|entry| {
                        entry.get("allergen").and_then(|v| v.as_str()).unwrap_or("").len() > 0
                    })
                    .map(|entry| serde_json::Value::Object(entry.clone()))
                    .collect();
                obj.insert("allergies".to_string(), serde_json::Value::Array(allergies));
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

    // Run grading engine
    let (asa_grade, fired_rules) = asa_grader::calculate_asa(&assessment_data);
    let additional_flags = flagged_issues::detect_additional_flags(&assessment_data);
    let timestamp = Utc::now().to_rfc3339();

    let grading_result = crate::engine::types::GradingResult {
        asa_grade,
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
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("data", &assessment_data);
    context.insert("asa_grade", &asa_grade);
    let asa_roman = ["I", "II", "III", "IV", "V", "VI"];
    context.insert("asa_grade_roman", asa_roman.get((asa_grade as usize).wrapping_sub(1)).unwrap_or(&"?"));
    context.insert("asa_label", &crate::engine::utils::asa_grade_label(asa_grade));
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
        .add("assessment/{id}", get(show_assessment))
        .add("assessment/{id}/submit", post(submit_assessment))
        .add("assessment/{id}/report", get(show_report))
        .layer(Extension(tera))
}
