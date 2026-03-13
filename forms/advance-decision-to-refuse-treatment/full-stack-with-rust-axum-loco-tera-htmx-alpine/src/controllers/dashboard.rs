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
    validity_status: Option<String>,
    life_sustaining: Option<String>,
    witnessed: Option<String>,
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
            row.nhs_number.to_lowercase().contains(&term)
                || row.patient_name.to_lowercase().contains(&term)
        });
    }

    // Validity status filter
    if let Some(ref status) = params.validity_status {
        if !status.is_empty() {
            items.retain(|row| row.validity_status == *status);
        }
    }

    // Life-sustaining refusal filter
    if let Some(ref ls) = params.life_sustaining {
        match ls.as_str() {
            "yes" => items.retain(|row| row.life_sustaining_refusal),
            "no" => items.retain(|row| !row.life_sustaining_refusal),
            _ => {}
        }
    }

    // Witnessed filter
    if let Some(ref w) = params.witnessed {
        match w.as_str() {
            "yes" => items.retain(|row| row.witnessed),
            "no" => items.retain(|row| !row.witnessed),
            _ => {}
        }
    }

    // Sort by patient name ascending
    items.sort_by(|a, b| a.patient_name.cmp(&b.patient_name));

    let total = items.len();
    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("validity_status", &params.validity_status.unwrap_or_default());
    context.insert("life_sustaining", &params.life_sustaining.unwrap_or_default());
    context.insert("witnessed", &params.witnessed.unwrap_or_default());

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
