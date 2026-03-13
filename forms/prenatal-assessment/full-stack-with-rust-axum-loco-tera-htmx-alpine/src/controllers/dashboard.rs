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
    risk_level: Option<String>,
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
                || row.due_date.to_lowercase().contains(&term)
                || row.referring_provider.to_lowercase().contains(&term)
        });
    }

    // Risk level filter
    if let Some(ref level) = params.risk_level {
        if !level.is_empty() {
            items.retain(|row| row.risk_level == *level);
        }
    }

    // Sort by booking date descending
    items.sort_by(|a, b| b.booking_date.cmp(&a.booking_date));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("risk_level", &params.risk_level.unwrap_or_default());

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
