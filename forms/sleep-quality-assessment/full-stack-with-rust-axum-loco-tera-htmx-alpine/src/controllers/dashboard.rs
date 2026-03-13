use std::sync::Arc;

use axum::{debug_handler, Extension};
use axum::http::HeaderMap;
use loco_rs::prelude::*;
use serde::Deserialize;
use tera::{Context, Tera};

use crate::models::assessments::list_completed;
use crate::views::dashboard::PatientRow;

#[derive(Debug, Deserialize)]
struct DashboardParams {
    search: Option<String>,
    sleep_quality: Option<String>,
    apnoea_risk: Option<String>,
}

/// GET /dashboard -- render dashboard with filtered patient table
#[debug_handler]
async fn dashboard(
    State(ctx): State<AppContext>,
    Query(params): Query<DashboardParams>,
    headers: HeaderMap,
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
        });
    }

    // Sleep quality filter
    if let Some(ref quality) = params.sleep_quality {
        if !quality.is_empty() {
            items.retain(|row| row.sleep_quality == *quality);
        }
    }

    // Apnoea risk filter
    if let Some(ref risk) = params.apnoea_risk {
        if !risk.is_empty() {
            items.retain(|row| row.has_apnoea_risk == *risk);
        }
    }

    // Sort by patient name
    items.sort_by(|a, b| a.patient_name.cmp(&b.patient_name));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("sleep_quality", &params.sleep_quality.unwrap_or_default());
    context.insert("apnoea_risk", &params.apnoea_risk.unwrap_or_default());

    // Return partial for HTMX requests, full page otherwise
    let is_htmx = headers
        .get("HX-Request")
        .and_then(|v| v.to_str().ok())
        .map_or(false, |v| v == "true");

    let template = if is_htmx {
        "_dashboard_results.html.tera"
    } else {
        "dashboard.html.tera"
    };

    let rendered = tera
        .render(template, &context)
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
