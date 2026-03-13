use std::sync::Arc;

use axum::{debug_handler, Extension};
use loco_rs::prelude::*;
use serde::Deserialize;
use tera::{Context, Tera};

use crate::models::assessments::list_completed;
use crate::views::dashboard::PatientRow;

#[derive(Debug, Deserialize)]
struct DashboardParams {
    search: Option<String>,
    abnormality_level: Option<String>,
    diagnosis: Option<String>,
}

/// GET /dashboard -- render dashboard with filtered patient table
#[debug_handler]
async fn dashboard(
    State(ctx): State<AppContext>,
    Query(params): Query<DashboardParams>,
    Extension(tera): Extension<Arc<Tera>>,
) -> Result<Response> {
    let models = list_completed(&ctx.db).await?;

    let mut items: Vec<PatientRow> = models
        .iter()
        .filter_map(PatientRow::from_model)
        .collect();

    // Server-side search filter
    if let Some(ref term) = params.search {
        let term = term.to_lowercase();
        items.retain(|row| {
            row.patient_name.to_lowercase().contains(&term)
                || row.medical_record_number.to_lowercase().contains(&term)
                || row.referring_physician.to_lowercase().contains(&term)
                || row.diagnosis.to_lowercase().contains(&term)
        });
    }

    // Abnormality level filter
    if let Some(ref level) = params.abnormality_level {
        if !level.is_empty() {
            items.retain(|row| row.abnormality_level == *level);
        }
    }

    // Diagnosis filter
    if let Some(ref diag) = params.diagnosis {
        if !diag.is_empty() {
            items.retain(|row| row.diagnosis.to_lowercase().contains(&diag.to_lowercase()));
        }
    }

    // Sort by specimen date descending
    items.sort_by(|a, b| b.specimen_date.cmp(&a.specimen_date));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("abnormality_level", &params.abnormality_level.unwrap_or_default());
    context.insert("diagnosis", &params.diagnosis.unwrap_or_default());

    let rendered = tera
        .render("dashboard.html.tera", &context)
        .map_err(|e| Error::BadRequest(format!("Template error: {e}")))?;

    Ok(Response::builder()
        .header("Content-Type", "text/html; charset=utf-8")
        .body(axum::body::Body::from(rendered))
        .map_err(Error::wrap)?
        .into_response())
}

pub fn routes(tera: Arc<Tera>) -> Routes {
    Routes::new()
        .add("dashboard", get(dashboard))
        .layer(Extension(tera))
}
