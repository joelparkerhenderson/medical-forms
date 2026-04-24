use pre_operative_assessment_by_clinician_tera_crate::{
    engine,
    types::ClinicianAssessment,
};
use tera::{Context, Tera};

fn load_tera() -> Tera {
    let pattern = concat!(env!("CARGO_MANIFEST_DIR"), "/templates/**/*.tera");
    Tera::new(pattern).expect("templates should parse")
}

#[test]
fn assessment_renders_single_page_with_all_16_sections() {
    let tera = load_tera();
    let data = ClinicianAssessment::default();
    let mut ctx = Context::new();
    ctx.insert("data", &data);
    let html = tera
        .render("assessment.html.tera", &ctx)
        .expect("assessment template renders");
    for i in 1..=16 {
        let needle = format!("Step {i}:");
        assert!(html.contains(&needle), "missing {needle}");
    }
    assert!(html.contains("action=\"/submit\""));
    assert!(html.contains("Grade &amp; generate report"));
}

#[test]
fn report_renders_with_grading_result() {
    let tera = load_tera();
    let mut data = ClinicianAssessment::default();
    data.echo_ef_percent = Some(30);
    let result = engine::grade(&data);

    let fired: Vec<_> = result
        .fired_rules
        .iter()
        .map(|r| {
            serde_json::json!({
                "ruleId": r.rule_id,
                "description": r.description,
                "asaGrade": r.asa_grade,
                "asaGradeRoman": "IV",
            })
        })
        .collect();

    let mut ctx = Context::new();
    ctx.insert("data", &data);
    ctx.insert("result", &result);
    ctx.insert("fired_rules", &fired);
    ctx.insert("computed_asa_roman", "IV");
    ctx.insert("final_asa_roman", "IV");
    ctx.insert("composite_risk_label", result.composite_risk.label());

    let html = tera
        .render("report.html.tera", &ctx)
        .expect("report template renders");
    assert!(html.contains("Composite risk"));
    assert!(html.contains("Critical"));
    assert!(html.contains("F-CARDIAC-EF"));
}
