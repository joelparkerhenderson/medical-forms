use std::sync::Arc;

use axum::{debug_handler, response::Redirect, Extension};
use chrono::Utc;
use loco_rs::prelude::*;
use sea_orm::{ActiveValue, IntoActiveModel};
use tera::{Context, Tera};
use uuid::Uuid;

use crate::engine::{risk_grader, flagged_issues, types::AssessmentData};
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
        "patient_information" => "patientInformation",
        "menopausal_symptoms" => "menopausalSymptoms",
        "menstrual_history" => "menstrualHistory",
        "medical_history" => "medicalHistory",
        "cardiovascular_risk" => "cardiovascularRisk",
        "breast_health" => "breastHealth",
        "bone_health" => "boneHealth",
        "current_medications" => "currentMedications",
        "hrt_options_counselling" => "hrtOptionsCounselling",
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
            | "ethnicity"
            | "referralDate"
            | "referringClinician"
            | "reasonForReferral"
            | "symptomDurationMonths"
            | "menopausalStatus"
            | "lastMenstrualPeriod"
            | "ageAtMenopause"
            | "menopauseType"
            | "surgicalMenopauseReason"
            | "previousHrtUse"
            | "previousHrtDetails"
            | "contraceptionStatus"
            | "historyOfVte"
            | "historyOfStroke"
            | "historyOfMi"
            | "liverDisease"
            | "undiagnosedVaginalBleeding"
            | "endometriosis"
            | "fibroids"
            | "migraineWithAura"
            | "diabetes"
            | "hypertension"
            | "autoimmineConditions"
            | "otherConditions"
            | "smokingStatus"
            | "bmiCategory"
            | "bloodPressureStatus"
            | "cholesterolStatus"
            | "familyHistoryCvd"
            | "physicalActivityLevel"
            | "alcoholConsumption"
            | "personalBreastCancerHistory"
            | "familyBreastCancerHistory"
            | "brcaGeneStatus"
            | "lastMammogramDate"
            | "mammogramResult"
            | "breastDensity"
            | "currentBreastSymptoms"
            | "dexaScanResult"
            | "previousFractures"
            | "familyHistoryOsteoporosis"
            | "calciumIntake"
            | "vitaminDStatus"
            | "currentMedicationsList"
            | "herbalSupplements"
            | "previousHrtPreparations"
            | "drugAllergies"
            | "contraindicatedMedications"
            | "preferredHrtRoute"
            | "combinedVsEstrogenOnly"
            | "risksDiscussed"
            | "benefitsDiscussed"
            | "alternativesDiscussed"
            | "informedConsentObtained"
            | "patientPreferenceNoted"
            | "clinicianName"
            | "reviewDate"
            | "recommendedAction"
            | "followUpInterval"
            | "additionalInvestigations"
            | "clinicalNotes"
            | "autoimmunConditions"
            | "autoimmineConditions"
            | "autoimmune_conditions"
            | "autoimmuneconditions"
            | "autoimmuneConditions"
    )
}

/// Parse a form value, keeping string fields as strings and converting scored fields to numbers.
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
    let (risk_level, risk_score, fired_rules) =
        risk_grader::calculate_risk(&assessment_data);
    let additional_flags = flagged_issues::detect_additional_flags(&assessment_data);
    let timestamp = Utc::now().to_rfc3339();

    let grading_result = crate::engine::types::GradingResult {
        risk_level: risk_level.clone(),
        risk_score,
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
    let symptom_burden = crate::engine::utils::symptom_burden_score(&assessment_data);

    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("data", &assessment_data);
    context.insert("risk_level", &risk_level);
    context.insert("risk_label", &crate::engine::utils::risk_level_label(&risk_level));
    context.insert("risk_score", &risk_score);
    context.insert("symptom_burden", &symptom_burden);
    context.insert("recommendation", &crate::engine::utils::recommendation_category(&risk_level));
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
