#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::coagulation_test_results::{ActiveModel, Entity, Model};

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
    pub on_anticoagulant: bool,
    pub anticoagulant_agent: String,
    pub prothrombin_time_seconds: Option<f64>,
    pub inr: Option<f64>,
    pub activated_partial_thromboplastin_time_seconds: Option<f64>,
    pub aptt_ratio: Option<f64>,
    pub fibrinogen_g_l: Option<f64>,
    pub d_dimer: Option<f64>,
    pub thrombin_time_seconds: Option<f64>,
    pub factor_assays: String,
    pub overall_result_status: String,
    pub critical_value_present: bool,
    pub critical_value_detail: String,
    pub findings_narrative: String,
    pub comparison_with_previous: String,
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
      item.on_anticoagulant = Set(self.on_anticoagulant);
      item.anticoagulant_agent = Set(self.anticoagulant_agent.clone());
      item.prothrombin_time_seconds = Set(self.prothrombin_time_seconds);
      item.inr = Set(self.inr);
      item.activated_partial_thromboplastin_time_seconds = Set(self.activated_partial_thromboplastin_time_seconds);
      item.aptt_ratio = Set(self.aptt_ratio);
      item.fibrinogen_g_l = Set(self.fibrinogen_g_l);
      item.d_dimer = Set(self.d_dimer);
      item.thrombin_time_seconds = Set(self.thrombin_time_seconds);
      item.factor_assays = Set(self.factor_assays.clone());
      item.overall_result_status = Set(self.overall_result_status.clone());
      item.critical_value_present = Set(self.critical_value_present);
      item.critical_value_detail = Set(self.critical_value_detail.clone());
      item.findings_narrative = Set(self.findings_narrative.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
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
        .prefix("api/coagulation_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
