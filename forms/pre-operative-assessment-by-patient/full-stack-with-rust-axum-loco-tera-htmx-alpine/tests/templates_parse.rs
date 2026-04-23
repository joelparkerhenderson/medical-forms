use pre_op_assessment_tera_crate::engine::types::AssessmentData;
use pre_op_assessment_tera_crate::views::assessment::build_assessment_context;
use tera::Tera;
use uuid::Uuid;

fn load_tera() -> Tera {
    let dir = env!("CARGO_MANIFEST_DIR");
    let pattern = format!("{dir}/templates/**/*.tera");
    Tera::new(&pattern).expect("templates should parse")
}

#[test]
fn assessment_template_renders_for_default_patient() {
    let tera = load_tera();
    let data = AssessmentData::default();
    let ctx = build_assessment_context(&data, Uuid::new_v4());
    let html = tera
        .render("assessment.html.tera", &ctx)
        .expect("assessment.html.tera should render");
    // Every section 1..15 must appear in a single-page render.
    assert!(html.contains("Step 1: Demographics"));
    assert!(html.contains("Step 2: Cardiovascular"));
    assert!(html.contains("Step 15: Functional Capacity"));
    assert!(html.contains("Submit Assessment"));
    // Step 16 (Pregnancy) is hidden for the default (sex="") patient.
    assert!(!html.contains("Step 16: Pregnancy"));
}

#[test]
fn assessment_template_renders_for_female_patient() {
    let tera = load_tera();
    let mut data = AssessmentData::default();
    data.demographics.sex = "female".to_string();
    data.demographics.date_of_birth = "1990-01-01".to_string();
    let ctx = build_assessment_context(&data, Uuid::new_v4());
    let html = tera
        .render("assessment.html.tera", &ctx)
        .expect("assessment.html.tera should render");
    // Pregnancy section is visible for female patients of reproductive age.
    assert!(html.contains("Step 16: Pregnancy"));
    assert!(html.contains("Possibly Pregnant"));
}
