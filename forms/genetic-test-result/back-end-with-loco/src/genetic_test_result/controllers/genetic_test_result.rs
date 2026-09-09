#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::genetic_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub report_status: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub test_type: String,
    pub genes_tested: String,
    pub sample_type: String,
    pub clinical_history: String,
    pub inheritance_pattern: String,
    pub variants_detected: String,
    pub variant_classification: String,
    pub zygosity: String,
    pub pathogenic_variant_found: bool,
    pub vus_found: bool,
    pub carrier_status_positive: bool,
    pub secondary_finding: bool,
    pub no_clinically_significant_variant: bool,
    pub interpretation: String,
    pub impression: String,
    pub reporting_category: String,
    pub recommended_cascade_testing: bool,
    pub recommended_follow_up: String,
    pub critical_result_communicated: bool,
    pub reported_to: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.originating_request_reference = Set(self.originating_request_reference.clone());
      item.report_status = Set(self.report_status.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.test_type = Set(self.test_type.clone());
      item.genes_tested = Set(self.genes_tested.clone());
      item.sample_type = Set(self.sample_type.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.inheritance_pattern = Set(self.inheritance_pattern.clone());
      item.variants_detected = Set(self.variants_detected.clone());
      item.variant_classification = Set(self.variant_classification.clone());
      item.zygosity = Set(self.zygosity.clone());
      item.pathogenic_variant_found = Set(self.pathogenic_variant_found);
      item.vus_found = Set(self.vus_found);
      item.carrier_status_positive = Set(self.carrier_status_positive);
      item.secondary_finding = Set(self.secondary_finding);
      item.no_clinically_significant_variant = Set(self.no_clinically_significant_variant);
      item.interpretation = Set(self.interpretation.clone());
      item.impression = Set(self.impression.clone());
      item.reporting_category = Set(self.reporting_category.clone());
      item.recommended_cascade_testing = Set(self.recommended_cascade_testing);
      item.recommended_follow_up = Set(self.recommended_follow_up.clone());
      item.critical_result_communicated = Set(self.critical_result_communicated);
      item.reported_to = Set(self.reported_to.clone());
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i64>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/genetic_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
