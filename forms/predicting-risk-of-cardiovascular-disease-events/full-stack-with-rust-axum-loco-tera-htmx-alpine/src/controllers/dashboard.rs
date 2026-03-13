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
    risk_category: Option<String>,
    diabetes_status: Option<String>,
}

/// GET /dashboard -- render dashboard with filtered patient table
#[debug_handler]
async fn dashboard(
    State(ctx): State<AppContext>,
    Query(params): Query<DashboardParams>,
    Extension(tera): Extension<Arc<Tera>>,
) -> Result<Response> {
    let models = list_completed(&ctx.db).await?;

    let mut items: Vec<PatientRow> = models.iter().filter_map(PatientRow::from_model).collect();

    // Server-side search filter
    if let Some(ref term) = params.search {
        let term = term.to_lowercase();
        items.retain(|row| {
            row.patient_name.to_lowercase().contains(&term)
                || row.sex.to_lowercase().contains(&term)
                || row.risk_category.to_lowercase().contains(&term)
        });
    }

    // Risk category filter
    if let Some(ref cat) = params.risk_category {
        if !cat.is_empty() {
            items.retain(|row| row.risk_category == *cat);
        }
    }

    // Diabetes status filter
    if let Some(ref status) = params.diabetes_status {
        if !status.is_empty() {
            items.retain(|row| row.diabetes_status == *status);
        }
    }

    // Sort by risk descending (high first)
    items.sort_by_key(|row| match row.risk_category.as_str() {
        "high" => 0,
        "intermediate" => 1,
        "borderline" => 2,
        "low" => 3,
        _ => 4,
    });

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("risk_category", &params.risk_category.unwrap_or_default());
    context.insert(
        "diabetes_status",
        &params.diabetes_status.unwrap_or_default(),
    );

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
