use apgar_score::app::App;
use loco_rs::testing::prelude::*;
use serde_json::Value;
use serial_test::serial;

/// POST-then-GET round-trip against the scaffold `patients` controller.
///
/// Proves the domain controller actually functions end to end: create a
/// record over HTTP, read it back by id, and assert the fields round-trip.
///
/// The `Params` request struct and the `_entities::patients::Model` response
/// struct both carry `#[serde(rename_all = "camelCase")]` (added fleet-wide
/// by `bin/loco-camel-case-json-refactor`), so the on-the-wire keys are
/// camelCase — the request body and the asserted response keys below match
/// the generated code exactly.
#[tokio::test]
#[serial]
async fn can_create_and_read_back_patient() {
    request::<App, _, _>(|request, _ctx| async move {
        // A deterministic, valid patient body matching the `Params` struct.
        let new_patient = serde_json::json!({
            "name": "Ada Lovelace",
            "birthDate": "2024-05-01",
            "sex": "female",
            "email": "ada@example.com",
            "phone": "+441234567890",
            "postalAddressAsFullText": "10 Downing Street, London",
            "countryAsIso31661Alpha2": "GB",
            "postcode": "SW1A 2AA",
            "unitedKingdomNhsNumber": "9434765919",
            "hospitalMrn": "MRN-000123",
            "heightAsCm": 50.5,
            "weightAsKg": 3.4,
            "bodyMassIndex": 13.3,
            "allergiesSummary": "No known allergies"
        });

        // 1. CREATE over HTTP.
        //
        // NB: the scaffold's create handler mounts at `/api/patients` (no
        // trailing slash), whereas the list handler is at `/api/patients/`
        // (with one). Posting to the trailing-slash form falls through to
        // Loco's welcome/fallback page, so the exact path matters here.
        let create_res = request.post("/api/patients").json(&new_patient).await;
        assert_eq!(
            create_res.status_code(),
            200,
            "create should succeed, got body: {}",
            create_res.text()
        );

        let created: Value = create_res.json();
        let id = created
            .get("id")
            .and_then(Value::as_i64)
            .expect("create response should carry a numeric id");
        assert!(id > 0, "id should be a positive integer, got {id}");

        // 2. READ back by id over HTTP.
        let get_res = request.get(&format!("/api/patients/{id}")).await;
        assert_eq!(
            get_res.status_code(),
            200,
            "get-by-id should succeed, got body: {}",
            get_res.text()
        );

        let fetched: Value = get_res.json();

        // 3. Round-trip: the fetched record echoes exactly what we sent.
        assert_eq!(fetched["id"].as_i64(), Some(id));
        assert_eq!(fetched["name"], "Ada Lovelace");
        assert_eq!(fetched["birthDate"], "2024-05-01");
        assert_eq!(fetched["sex"], "female");
        assert_eq!(fetched["email"], "ada@example.com");
        assert_eq!(fetched["phone"], "+441234567890");
        assert_eq!(
            fetched["postalAddressAsFullText"],
            "10 Downing Street, London"
        );
        assert_eq!(fetched["countryAsIso31661Alpha2"], "GB");
        assert_eq!(fetched["postcode"], "SW1A 2AA");
        assert_eq!(fetched["unitedKingdomNhsNumber"], "9434765919");
        assert_eq!(fetched["hospitalMrn"], "MRN-000123");
        assert_eq!(fetched["heightAsCm"].as_f64(), Some(50.5));
        assert_eq!(fetched["weightAsKg"].as_f64(), Some(3.4));
        assert_eq!(fetched["bodyMassIndex"].as_f64(), Some(13.3));
        assert_eq!(fetched["allergiesSummary"], "No known allergies");

        // 4. The new record is present in the list endpoint.
        //    (Same trailing-slash caveat as the create route: the real list
        //    handler is at `/api/patients`; `/api/patients/` hits the
        //    fallback page.)
        let list_res = request.get("/api/patients").await;
        assert_eq!(list_res.status_code(), 200);
        let list: Value = list_res.json();
        let items = list.as_array().expect("list should be a JSON array");
        assert!(
            items
                .iter()
                .any(|row| row.get("id").and_then(Value::as_i64) == Some(id)),
            "the created patient (id {id}) should appear in the list"
        );
    })
    .await;
}
