use std::sync::Arc;

use axum::{
    Form, Router,
    extract::State,
    response::Html,
    routing::{get, post},
};
use pre_operative_assessment_by_clinician_tera_crate::engine;
use pre_operative_assessment_by_clinician_tera_crate::types::ClinicianAssessment;
use tera::{Context, Tera};

struct AppState {
    tera: Tera,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let templates_glob = concat!(env!("CARGO_MANIFEST_DIR"), "/templates/**/*.tera");
    let tera = Tera::new(templates_glob).expect("templates should parse");

    let state = Arc::new(AppState { tera });

    let app = Router::new()
        .route("/", get(show_assessment))
        .route("/submit", post(submit_assessment))
        .with_state(state);

    let addr = "0.0.0.0:5161";
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    tracing::info!("clinician pre-op form listening on http://{addr}");
    axum::serve(listener, app).await.expect("serve");
}

async fn show_assessment(State(state): State<Arc<AppState>>) -> Html<String> {
    let data = ClinicianAssessment::default();
    let ctx = build_form_context(&data);
    let body = state
        .tera
        .render("assessment.html.tera", &ctx)
        .unwrap_or_else(|e| format!("<pre>template error: {e}</pre>"));
    Html(body)
}

async fn submit_assessment(
    State(state): State<Arc<AppState>>,
    Form(data): Form<ClinicianAssessment>,
) -> Html<String> {
    let result = engine::grade(&data);
    let mut ctx = build_form_context(&data);
    let computed_roman = roman_asa(result.asa_grade);
    let final_roman = roman_asa(result.final_asa_grade);
    let fired_rules: Vec<_> = result
        .fired_rules
        .iter()
        .map(|r| {
            serde_json::json!({
                "ruleId": r.rule_id,
                "description": r.description,
                "asaGrade": r.asa_grade,
                "asaGradeRoman": roman_asa(r.asa_grade),
            })
        })
        .collect();
    let composite_label = result.composite_risk.label();
    ctx.insert("result", &result);
    ctx.insert("fired_rules", &fired_rules);
    ctx.insert("computed_asa_roman", computed_roman);
    ctx.insert("final_asa_roman", final_roman);
    ctx.insert("composite_risk_label", composite_label);
    let body = state
        .tera
        .render("report.html.tera", &ctx)
        .unwrap_or_else(|e| format!("<pre>template error: {e}</pre>"));
    Html(body)
}

fn roman_asa(grade: u8) -> &'static str {
    match grade {
        1 => "I",
        2 => "II",
        3 => "III",
        4 => "IV",
        5 => "V",
        6 => "VI",
        _ => "?",
    }
}

fn build_form_context(data: &ClinicianAssessment) -> Context {
    let mut ctx = Context::new();
    ctx.insert("data", data);
    ctx
}
