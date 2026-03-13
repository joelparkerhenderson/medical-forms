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
    hearing_aid_level: Option<String>,
    hearing_loss_severity: Option<String>,
    affected_ear: Option<String>,
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
                || row.assessment_date.to_lowercase().contains(&term)
                || row.hearing_loss_severity.to_lowercase().contains(&term)
        });
    }

    // Hearing aid level filter
    if let Some(ref level) = params.hearing_aid_level {
        if !level.is_empty() {
            items.retain(|row| row.hearing_aid_level == *level);
        }
    }

    // Hearing loss severity filter
    if let Some(ref severity) = params.hearing_loss_severity {
        if !severity.is_empty() {
            items.retain(|row| row.hearing_loss_severity == *severity);
        }
    }

    // Affected ear filter
    if let Some(ref ear) = params.affected_ear {
        if !ear.is_empty() {
            items.retain(|row| row.affected_ear == *ear);
        }
    }

    // Sort by assessment date descending
    items.sort_by(|a, b| b.assessment_date.cmp(&a.assessment_date));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("hearing_aid_level", &params.hearing_aid_level.unwrap_or_default());
    context.insert("hearing_loss_severity", &params.hearing_loss_severity.unwrap_or_default());
    context.insert("affected_ear", &params.affected_ear.unwrap_or_default());

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
