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
    diabetes_type: Option<String>,
}

#[debug_handler]
async fn dashboard(
    State(ctx): State<AppContext>,
    Query(params): Query<DashboardParams>,
    Extension(tera): Extension<Arc<Tera>>,
) -> Result<Response> {
    let models = list_completed(&ctx.db).await?;
    let mut items: Vec<PatientRow> = models.iter().filter_map(PatientRow::from_model).collect();

    if let Some(ref term) = params.search {
        let term = term.to_lowercase();
        items.retain(|row| {
            row.nhs_number.to_lowercase().contains(&term)
                || row.patient_name.to_lowercase().contains(&term)
        });
    }
    if let Some(ref cat) = params.risk_category {
        if !cat.is_empty() {
            items.retain(|row| row.risk_category == *cat);
        }
    }
    if let Some(ref dt) = params.diabetes_type {
        if !dt.is_empty() {
            items.retain(|row| row.diabetes_type == *dt);
        }
    }

    items.sort_by(|a, b| a.patient_name.cmp(&b.patient_name));
    let total = items.len();

    let mut context = Context::new();
    context.insert("patients", &items);
    context.insert("total", &total);
    context.insert("search", &params.search.unwrap_or_default());
    context.insert("risk_category", &params.risk_category.unwrap_or_default());
    context.insert("diabetes_type", &params.diabetes_type.unwrap_or_default());

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
