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
    satisfaction_level: Option<String>,
    department: Option<String>,
    nps_category: Option<String>,
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
            row.visit_date.to_lowercase().contains(&term)
                || row.department.to_lowercase().contains(&term)
                || row.provider_name.to_lowercase().contains(&term)
        });
    }

    // Satisfaction level filter
    if let Some(ref level) = params.satisfaction_level {
        if !level.is_empty() {
            items.retain(|row| row.satisfaction_level == *level);
        }
    }

    // Department filter
    if let Some(ref dept) = params.department {
        if !dept.is_empty() {
            items.retain(|row| row.department == *dept);
        }
    }

    // NPS category filter
    if let Some(ref nps) = params.nps_category {
        if !nps.is_empty() {
            items.retain(|row| row.nps_category == *nps);
        }
    }

    // Sort by visit date descending
    items.sort_by(|a, b| b.visit_date.cmp(&a.visit_date));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("satisfaction_level", &params.satisfaction_level.unwrap_or_default());
    context.insert("department", &params.department.unwrap_or_default());
    context.insert("nps_category", &params.nps_category.unwrap_or_default());

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
