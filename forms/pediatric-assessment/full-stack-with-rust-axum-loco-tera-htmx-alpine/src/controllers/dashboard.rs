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
    concern_level: Option<String>,
    age_group: Option<String>,
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
                || row.date_of_birth.to_lowercase().contains(&term)
                || row.pediatrician.to_lowercase().contains(&term)
        });
    }

    // Concern level filter
    if let Some(ref level) = params.concern_level {
        if !level.is_empty() {
            items.retain(|row| row.concern_level == *level);
        }
    }

    // Age group filter
    if let Some(ref age) = params.age_group {
        if !age.is_empty() {
            items.retain(|row| row.age_group == *age);
        }
    }

    // Sort by date of birth descending
    items.sort_by(|a, b| b.date_of_birth.cmp(&a.date_of_birth));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("concern_level", &params.concern_level.unwrap_or_default());
    context.insert("age_group", &params.age_group.unwrap_or_default());

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
