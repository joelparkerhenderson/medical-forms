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
    severity_level: Option<String>,
    ipss_category: Option<String>,
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
            row.referral_date.to_lowercase().contains(&term)
                || row.patient_name.to_lowercase().contains(&term)
                || row.referring_provider.to_lowercase().contains(&term)
                || row.reason_for_referral.to_lowercase().contains(&term)
        });
    }

    // Severity level filter
    if let Some(ref level) = params.severity_level {
        if !level.is_empty() {
            items.retain(|row| row.severity_level == *level);
        }
    }

    // IPSS category filter
    if let Some(ref cat) = params.ipss_category {
        if !cat.is_empty() {
            items.retain(|row| row.ipss_category == *cat);
        }
    }

    // Sort by referral date descending
    items.sort_by(|a, b| b.referral_date.cmp(&a.referral_date));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("severity_level", &params.severity_level.unwrap_or_default());
    context.insert("ipss_category", &params.ipss_category.unwrap_or_default());

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
