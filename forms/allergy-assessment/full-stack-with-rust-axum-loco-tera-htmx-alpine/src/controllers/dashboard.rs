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
    allergen_category: Option<String>,
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
                || row.primary_allergen.to_lowercase().contains(&term)
                || row.last_review.to_lowercase().contains(&term)
        });
    }

    // Severity level filter
    if let Some(ref level) = params.severity_level {
        if !level.is_empty() {
            items.retain(|row| row.severity_level == *level);
        }
    }

    // Allergen category filter
    if let Some(ref category) = params.allergen_category {
        if !category.is_empty() {
            items.retain(|row| row.allergen_category == *category);
        }
    }

    // Sort by last review date descending
    items.sort_by(|a, b| b.last_review.cmp(&a.last_review));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("severity_level", &params.severity_level.unwrap_or_default());
    context.insert("allergen_category", &params.allergen_category.unwrap_or_default());

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
