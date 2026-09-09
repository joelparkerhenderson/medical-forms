#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::toxicology_test_results::{ActiveModel, Entity, Model};

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
    pub specimen_condition: String,
    pub clinical_history: String,
    pub suspected_agent: String,
    pub time_since_ingestion_hours: Option<f64>,
    pub paracetamol_level_mg_l: Option<f64>,
    pub salicylate_level_mg_l: Option<f64>,
    pub ethanol_level: Option<f64>,
    pub lithium_level_mmol_l: Option<f64>,
    pub digoxin_level: Option<f64>,
    pub carboxyhaemoglobin_percent: Option<f64>,
    pub drugs_of_abuse_screen: String,
    pub specific_drug_level: String,
    pub paracetamol_nomogram: String,
    pub overall_result_status: String,
    pub toxic_level_present: bool,
    pub findings_narrative: String,
    pub impression: String,
    pub reporting_category: String,
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
      item.specimen_condition = Set(self.specimen_condition.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.suspected_agent = Set(self.suspected_agent.clone());
      item.time_since_ingestion_hours = Set(self.time_since_ingestion_hours);
      item.paracetamol_level_mg_l = Set(self.paracetamol_level_mg_l);
      item.salicylate_level_mg_l = Set(self.salicylate_level_mg_l);
      item.ethanol_level = Set(self.ethanol_level);
      item.lithium_level_mmol_l = Set(self.lithium_level_mmol_l);
      item.digoxin_level = Set(self.digoxin_level);
      item.carboxyhaemoglobin_percent = Set(self.carboxyhaemoglobin_percent);
      item.drugs_of_abuse_screen = Set(self.drugs_of_abuse_screen.clone());
      item.specific_drug_level = Set(self.specific_drug_level.clone());
      item.paracetamol_nomogram = Set(self.paracetamol_nomogram.clone());
      item.overall_result_status = Set(self.overall_result_status.clone());
      item.toxic_level_present = Set(self.toxic_level_present);
      item.findings_narrative = Set(self.findings_narrative.clone());
      item.impression = Set(self.impression.clone());
      item.reporting_category = Set(self.reporting_category.clone());
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
        .prefix("api/toxicology_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
