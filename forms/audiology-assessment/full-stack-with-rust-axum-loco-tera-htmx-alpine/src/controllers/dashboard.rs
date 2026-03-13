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
    hearing_level: Option<String>,
    loss_type: Option<String>,
    tinnitus: Option<String>,
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
                || row.loss_type.to_lowercase().contains(&term)
                || row.hearing_aid_status.to_lowercase().contains(&term)
        });
    }

    // Hearing level filter
    if let Some(ref level) = params.hearing_level {
        if !level.is_empty() {
            items.retain(|row| row.hearing_level == *level);
        }
    }

    // Loss type filter
    if let Some(ref lt) = params.loss_type {
        if !lt.is_empty() {
            items.retain(|row| row.loss_type.to_lowercase().contains(&lt.to_lowercase()));
        }
    }

    // Tinnitus filter
    if let Some(ref t) = params.tinnitus {
        if !t.is_empty() {
            items.retain(|row| row.tinnitus_present == *t);
        }
    }

    // Sort by patient name
    items.sort_by(|a, b| a.patient_name.cmp(&b.patient_name));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("hearing_level", &params.hearing_level.unwrap_or_default());
    context.insert("loss_type", &params.loss_type.unwrap_or_default());
    context.insert("tinnitus", &params.tinnitus.unwrap_or_default());

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
