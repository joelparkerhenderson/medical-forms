// HTTP integration tests for the architecture-decision-record backend.
//
// Exercises the full request pipeline: validation, auto-numbering, auto-slug,
// the JSON `/api/adrs` register, and the `/api/adrs/:slug` viewer.
//
// Requires a running Postgres with the `architecture_decision_record_test`
// database (created by the setup script in this directory's parent). Tests
// are marked `#[serial]` because they share the test database and rely on
// monotonic auto-numbering.

use architecture_decision_record::app::App;
use loco_rs::testing::prelude::*;
use serial_test::serial;

async fn seed_author(ctx: &loco_rs::app::AppContext) -> i64 {
    use architecture_decision_record::models::_entities::authors;
    use loco_rs::prelude::*;
    let a = authors::ActiveModel {
        name: Set("Test Architect".to_string()),
        email: Set("arch@example.com".to_string()),
        role: Set("architect".to_string()),
        ..Default::default()
    };
    let a = a.insert(&ctx.db).await.expect("seed author");
    a.id
}

async fn seed_org(ctx: &loco_rs::app::AppContext) -> i64 {
    use architecture_decision_record::models::_entities::organizations;
    use loco_rs::prelude::*;
    let o = organizations::ActiveModel {
        name: Set("Acme Corp".to_string()),
        ..Default::default()
    };
    let o = o.insert(&ctx.db).await.expect("seed org");
    o.id
}

#[tokio::test]
#[serial]
async fn post_auto_numbers_and_auto_slugs() {
    request::<App, _, _>(|request, ctx| async move {
        let author_id = seed_author(&ctx).await;
        let organization_id = seed_org(&ctx).await;

        // First POST: title only — backend assigns number=1 and slug derived from title.
        let res = request
            .post("/architecture_decision_records")
            .json(&serde_json::json!({
                "authorId": author_id,
                "organizationId": organization_id,
                "title": "Use PostgreSQL for primary storage",
            }))
            .await;
        assert_eq!(res.status_code(), 303);

        // Second POST: explicit number=99, no slug.
        let res = request
            .post("/architecture_decision_records")
            .json(&serde_json::json!({
                "authorId": author_id,
                "organizationId": organization_id,
                "title": "Pick a colour",
                "number": 99,
            }))
            .await;
        assert_eq!(res.status_code(), 303);

        // Third POST: no number → auto-assigns 100 (max + 1).
        let res = request
            .post("/architecture_decision_records")
            .json(&serde_json::json!({
                "authorId": author_id,
                "organizationId": organization_id,
                "title": "After 99",
            }))
            .await;
        assert_eq!(res.status_code(), 303);

        // GET /api/adrs returns the three rows with sane number / slug values.
        let res = request.get("/api/adrs").await;
        assert_eq!(res.status_code(), 200);
        let rows: Vec<serde_json::Value> = res.json();
        assert_eq!(rows.len(), 3, "expected three ADRs in the register");

        let row1 = rows.iter().find(|r| r["title"] == "Use PostgreSQL for primary storage").unwrap();
        assert_eq!(row1["number"], 1);
        assert_eq!(row1["slug"], "use-postgresql-for-primary-storage");

        let row2 = rows.iter().find(|r| r["title"] == "Pick a colour").unwrap();
        assert_eq!(row2["number"], 99);
        assert_eq!(row2["slug"], "pick-a-colour");

        let row3 = rows.iter().find(|r| r["title"] == "After 99").unwrap();
        assert_eq!(row3["number"], 100);
        assert_eq!(row3["slug"], "after-99");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn post_with_bad_status_returns_400() {
    request::<App, _, _>(|request, ctx| async move {
        let author_id = seed_author(&ctx).await;
        let organization_id = seed_org(&ctx).await;

        let res = request
            .post("/architecture_decision_records")
            .json(&serde_json::json!({
                "authorId": author_id,
                "organizationId": organization_id,
                "title": "Bad status",
                "status": "provisional",
            }))
            .await;
        assert_eq!(res.status_code(), 400);
        let body: serde_json::Value = res.json();
        assert!(
            body["description"].as_str().unwrap_or("").contains("provisional"),
            "expected description to name the rejected value: {body:?}"
        );
    })
    .await;
}

#[tokio::test]
#[serial]
async fn api_show_by_slug_returns_rendered_markdown() {
    request::<App, _, _>(|request, ctx| async move {
        let author_id = seed_author(&ctx).await;
        let organization_id = seed_org(&ctx).await;

        request
            .post("/architecture_decision_records")
            .json(&serde_json::json!({
                "authorId": author_id,
                "organizationId": organization_id,
                "title": "Adopt event sourcing",
                "status": "approved",
                "decisionGroup": "data",
                "decision": "We will use event sourcing for the audit log.",
            }))
            .await;

        let res = request.get("/api/adrs/adopt-event-sourcing").await;
        assert_eq!(res.status_code(), 200);
        let body: serde_json::Value = res.json();
        assert_eq!(body["title"], "Adopt event sourcing");
        assert_eq!(body["status"], "approved");
        assert_eq!(body["decisionGroup"], "data");
        assert_eq!(body["authorName"], "Test Architect");

        let md = body["markdown"].as_str().expect("markdown field");
        assert!(md.starts_with("# 0001 — Adopt event sourcing"), "{md}");
        assert!(md.contains("- **Status:** approved"), "{md}");
        assert!(md.contains("- **Author:** Test Architect"), "{md}");
        assert!(md.contains("## Decision\nWe will use event sourcing"), "{md}");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn api_show_by_slug_returns_404_for_unknown_slug() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/adrs/nonexistent-slug").await;
        assert_eq!(res.status_code(), 404);
    })
    .await;
}
